package main

import "time"

type User struct {
	ID       int    `json:"user_id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Doctor struct {
	ID             int    `json:"user_id"`
	Name           string `json:"name"`
	Phone          string `json:"phone"`
	Email          string `json:"email"`
	Specialisation string `json:"specialisation"`
}

type Patient struct {
	ID        int       `json:"user_id"`
	Name      string    `json:"name"`
	Cnp       string    `json:"cnp"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	BirthDate time.Time `json:"birth_date"`
}

type DoctorSchedule struct {
	ID        int       `json:"shd_day_id"`
	DoctorID  int       `json:"doctor_id"`
	DayOfWeek int       `json:"day_of_week"`
	StartHour time.Time `json:"start_hour"`
	EndHour   time.Time `json:"end_hour"`
}

type Appointment struct {
	ID        int       `json:"appnmt_id"`
	PatientID int       `json:"patient_id"`
	DoctorID  int       `json:"doctor_id"`
	Date      time.Time `json:"appnmt_date"`
	StartHour time.Time `json:"appnmt_start_hour"`
	EndHour   time.Time `json:"appnmt_end_hour"`
	Status    string    `json:"status"`
}

type MedicalRecord struct {
	ID            int       `json:"record_id"`
	AppointmentID int       `json:"appnmt_id"`
	Diagnosis     string    `json:"diagnosis"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
}

type InventoryItem struct {
	ID            int    `json:"item_id"`
	Name          string `json:"item_name"`
	Type          string `json:"item_type"`
	NumberOfItems int    `json:"number_of_items"`
}
