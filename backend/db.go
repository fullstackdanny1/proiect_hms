package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func InitDB() *sql.DB {
	var err error
	db, err = sql.Open("sqlite", "./hospital.db")

	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()

	if err != nil {
		log.Fatal(err)
	}

	log.Println("Database connected!")

	return db
}

// Users
func CreateUser(db *sql.DB, u *User) (uint32, error) {
	result, err := db.Exec(`INSERT INTO users 
                        (username, password, role) VALUES(?, ?, ?)`,
		u.Username, u.Password, u.Role)

	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()

	if err != nil {
		return 0, err
	}

	return uint32(id), nil
}

func GetUsers(db *sql.DB) ([]User, error) {
	rows, err := db.Query("SELECT * FROM users")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var users []User

	for rows.Next() {
		var u User

		err := rows.Scan(
			&u.ID,
			&u.Username,
			&u.Password,
			&u.Role,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, u)
	}

	return users, nil
}

func GetUserByNameAndPassword(db *sql.DB, name string, password string) (*User, error) {
	row := db.QueryRow("SELECT * FROM users WHERE username = ? AND password = ?", name, password)

	var user User

	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Password,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func DeleteUser() {} // To be implemented

// Patients
func GetPatients(db *sql.DB) ([]Patient, error) {

	rows, err := db.Query(`SELECT * FROM patients`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var patients []Patient

	for rows.Next() {
		var p Patient

		err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.Cnp,
			&p.Phone,
			&p.Email,
			&p.BirthDate,
		)

		if err != nil {
			return nil, err
		}

		patients = append(patients, p)
	}

	return patients, nil
}

func CreatePatient(db *sql.DB, u *User, p *Patient) error {

	id, err := CreateUser(db, u)

	if err != nil {
		return err
	}

	_, err = db.Exec(`INSERT INTO patients 
	(user_id, name, cnp, phone_number, email, birth_date)
	VALUES (?, ?, ?, ?, ?, ?)`, id, p.Name, p.Cnp, p.Phone, p.Email, p.BirthDate)

	return err
}

func GetPatientById(db *sql.DB, id uint32) (*Patient, error) {
	rows := db.QueryRow("SELECT * FROM patients WHERE user_id = ?", id)

	var p Patient

	err := rows.Scan(
		&p.ID,
		&p.Name,
		&p.Cnp,
		&p.Phone,
		&p.Email,
		&p.BirthDate,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &p, err
}

// Doctors
func CreateDoctor(db *sql.DB, u *User, d *Doctor) error {

	id, err := CreateUser(db, u)

	if err != nil {
		return err
	}
	_, err = db.Exec(`INSERT INTO doctors
	                (user_id, name, phone, email, role)
					VALUES(?, ?, ?, ?, ?)`,
		id, d.Name, d.Phone, d.Email, d.Specialisation)
	return err
}

func DeleteDoctor() {} // To be implemented

func GetDoctorById(db *sql.DB, id uint32) (*Doctor, error) {
	rows := db.QueryRow("SELECT * FROM doctors WHERE user_id = ?", id)

	var d Doctor

	err := rows.Scan(
		&d.ID,
		&d.Name,
		&d.Phone,
		&d.Email,
		&d.Specialisation,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &d, err
}

func GetDoctors(db *sql.DB) ([]Doctor, error) {
	rows, err := db.Query("SELECT * FROM doctors")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var doctors []Doctor

	for rows.Next() {
		var doc Doctor
		err = rows.Scan(
			&doc.ID,
			&doc.Name,
			&doc.Phone,
			&doc.Email,
			&doc.Specialisation,
		)

		if err != nil {
			return nil, err
		}

		doctors = append(doctors, doc)
	}

	return doctors, err
}

// Schedules
func GetDoctorSchedules(db *sql.DB, doc_id uint32) ([]DoctorSchedule, error) {
	rows, err := db.Query("SELECT * FROM doctor_schedules WHERE doctor_id = ?", doc_id)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var schedules []DoctorSchedule

	for rows.Next() {
		var sch DoctorSchedule
		err := rows.Scan(
			&sch.ID,
			&sch.DoctorID,
			&sch.DayOfWeek,
			&sch.StartHour,
			&sch.EndHour,
		)

		if err != nil {
			return nil, err
		}
		schedules = append(schedules, sch)
	}

	return schedules, nil
}

func CreateSchedule() {} // to be implemented

// Appointments
func CreateAppointment(db *sql.DB, ap *Appointment) error {
	_, err := db.Exec(`INSERT INTO appointments 
	                (patient_id, doctor_id, appnmt_date, appnmt_start_hour, appnmt_end_hour, status)
					VALUES(?, ?, ?, ?, ?, ?)`,
		ap.PatientID, ap.DoctorID, ap.Date, ap.StartHour,
		ap.EndHour, ap.Status)
	return err
}

func GetAppointmentsByPatientId(db *sql.DB, id uint32) ([]AppointmentVM, error) {
	rows, err := db.Query(`SELECT a.appmnt_id, a.doctor_id, a.patient_id, 
                          d.name AS doctor_name, p.name AS patient_name,
                          a.appmnt_date, a.appmnt_start_hour, a.appmnt_end_hour, a.status
                          FROM appointments a
                          JOIN doctors d ON a.doctor_id = d.user_id
                          JOIN patients p ON a.patient_id = p.user_id
                        WHERE a.patient_id = ?`, id)

	if err != nil {
		return nil, err
	}

	var vms []AppointmentVM

	for rows.Next() {
		var vm AppointmentVM

		err := rows.Scan(
			&vm.ID,
			&vm.DoctorID,
			&vm.PatientID,
			&vm.DoctorName,
			&vm.PatientName,
			&vm.Date,
			&vm.StartHour,
			&vm.EndHour,
			&vm.Status,
		)

		if err != nil {
			return nil, err
		}

		vms = append(vms, vm)
	}

	return vms, nil
}

func GetAppointmentsByDocId(db *sql.DB, id uint32) ([]AppointmentVM, error) {
	rows, err := db.Query(`SELECT a.appmnt_id, a.doctor_id, a.patient_id,
	                    d.name AS doctor_name, p.name AS patient_name,
                        a.appmnt_date, a.appmnt_start_hour, a.appmnt_end_hour, a.status
                        FROM appointments a
                        JOIN doctors d ON a.doctor_id = d.user_id
                        JOIN patients p ON a.patient_id = p.user_id
                        WHERE a.doctor_id = ?`, id)

	if err != nil {
		return nil, err
	}

	var vms []AppointmentVM

	for rows.Next() {
		var vm AppointmentVM

		err := rows.Scan(
			&vm.ID,
			&vm.DoctorID,
			&vm.PatientID,
			&vm.DoctorName,
			&vm.PatientName,
			&vm.Date,
			&vm.StartHour,
			&vm.EndHour,
			&vm.Status,
		)

		if err != nil {
			return nil, err
		}

		vms = append(vms, vm)
	}

	return vms, nil
}

func UpdateAppointmentStatus(db *sql.DB, status string, patient_id uint32) error {
	_, err := db.Exec(`UPDATE appointments SET status = ? WHERE patient_id = ?`,
		status, patient_id)

	return err
}

// Records
func GetMedRecordsByPatientId(db *sql.DB, user_id uint32) ([]MedicalRecordVM, error) {
	rows, err := db.Query(`SELECT 
	                    mr.record_id, 
						p.name AS patient_name,
                        d.name AS doctor_name,
						mr.diagnosis,
						mr.notes,
						mr.created_at
						FROM medical_records mr
						JOIN appointments a ON mr.appmnt_id = a.appmnt_id
						JOIN doctors d ON a.doctor_id = d.user_id
						JOIN patients p ON a.patient_id = p.user_id
						WHERE a.patient_id = ?`, user_id)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var vms []MedicalRecordVM

	for rows.Next() {
		var vm MedicalRecordVM

		err = rows.Scan(
			&vm.ID,
			&vm.PatientName,
			&vm.DoctorName,
			&vm.Diagnosis,
			&vm.Notes,
			&vm.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		vms = append(vms, vm)
	}

	return vms, nil
}

// Prescriptions
func GetPrescriptionsRecordId(db *sql.DB, rec_id uint32) ([]PrescriptionVM, error) {
	rows, err := db.Query(`SELECT
                        p.prescription_id,
						d.name AS doctor_name,
						i.item_name AS medicament,
						p.instructions
						FROM prescriptions p
						JOIN medical_records mr ON p.record_id = mr.record_id
						JOIN appointments a ON mr.appmnt_id = a.appmnt_id
						JOIN doctors d ON a.doctor_id = d.user_id
						JOIN inventory i ON p.med_id = i.item_id
						WHERE p.record_id = ?`, rec_id)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var vms []PrescriptionVM

	for rows.Next() {
		var vm PrescriptionVM

		err := rows.Scan(
			&vm.ID,
			&vm.DoctorName,
			&vm.MedName,
			&vm.Instructions,
		)

		if err != nil {
			return nil, err
		}

		vms = append(vms, vm)
	}

	return vms, err
}

// Inventory
func GetInventoryItems(db *sql.DB) ([]InventoryItem, error) {
	rows, err := db.Query(`SELECT * FROM inventory`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []InventoryItem

	for rows.Next() {
		var item InventoryItem

		err = rows.Scan(
			&item.ID,
			&item.Name,
			&item.Type,
			&item.NumberOfItems,
		)

		if err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	return items, nil
}
func CreateInventoryItem() {} // to be implemented
func DeleteInventoryItem() {} // to be implemented
