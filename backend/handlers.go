package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type PatientRequest struct {
	ID        int    `json:"user_id"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	Role      string `json:"role"`
	Name      string `json:"name"`
	Cnp       string `json:"cnp"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	BirthDate string `json:"birth_date"`
}

type DoctorRequest struct {
	ID             int    `json:"user_id"`
	Username       string `json:"username"`
	Password       string `json:"password"`
	Role           string `json:"role"`
	Name           string `json:"name"`
	Phone          string `json:"phone"`
	Email          string `json:"email"`
	Specialisation string `json:"specialisation"`
}

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AppointmentStautsRequest struct {
	PatientID int    `json:"patient_id"`
	Status    string `json:"status"`
}

// users
func GetUsersHandler(w http.ResponseWriter, r *http.Request) {

	users, err := GetUsers(db)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func GetUserByNameAndPasswordHandler(w http.ResponseWriter, r *http.Request) {

	var req AuthRequest
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u, err := GetUserByNameAndPassword(db, req.Username, req.Password)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if u == nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(u)
}

// Patients
func GetPatientsHandler(w http.ResponseWriter, r *http.Request) {

	patients, err := GetPatients(db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if patients == nil {
		http.Error(w, "no patients found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patients)
}

func GetPatientHandler(w http.ResponseWriter, r *http.Request) {

	idStr := chi.URLParam(r, "id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	p, err := GetPatientById(db, uint32(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if p == nil {
		http.Error(w, "patient not found", http.StatusNotFound)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func CreatePatientHandler(w http.ResponseWriter, r *http.Request) {
	var req PatientRequest
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u := User{
		Username: req.Username,
		Password: req.Password,
		Role:     req.Role,
	}

	p := Patient{
		Name:      req.Name,
		Cnp:       req.Cnp,
		Phone:     req.Phone,
		Email:     req.Email,
		BirthDate: req.BirthDate,
	}

	err = CreatePatient(db, &u, &p)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// Docs
func GetDoctorHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	d, err := GetDoctorById(db, uint32(id))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if d == nil {
		http.Error(w, "doctor not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(d)
}

func GetDoctorsHandler(w http.ResponseWriter, r *http.Request) {
	docs, err := GetDoctors(db)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if docs == nil {
		http.Error(w, "there are not any doctors", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(docs)
}

func CreateDoctorHandler(w http.ResponseWriter, r *http.Request) {
	var req DoctorRequest
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u := User{
		Username: req.Username,
		Password: req.Password,
		Role:     req.Role,
	}

	d := Doctor{
		Name:           req.Name,
		Phone:          req.Phone,
		Email:          req.Email,
		Specialisation: req.Specialisation,
	}

	err = CreateDoctor(db, &u, &d)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func GetDoctorSchedulesHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "doctor_id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	schedules, err := GetDoctorSchedules(db, uint32(id))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if schedules == nil {
		http.Error(w, "there are not any schedules", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(schedules)
}

// Appointments

func CreateAppointmentHandler(w http.ResponseWriter, r *http.Request) {
	var ap Appointment

	err := json.NewDecoder(r.Body).Decode(&ap)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = CreateAppointment(db, &ap)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func GetPatientAppointmentHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "patient_id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ap, err := GetAppointmentsByPatientId(db, uint32(id))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if ap == nil {
		http.Error(w, "no aappointments were made", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ap)
}

func GetDoctorAppointmentHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "doctor_id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ap, err := GetAppointmentsByDocId(db, uint32(id))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if ap == nil {
		http.Error(w, "no aappointments were made", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ap)
}

func UpdateAppointmentStatusHandler(w http.ResponseWriter, r *http.Request) {

	var ap AppointmentStautsRequest

	err := json.NewDecoder(r.Body).Decode(&ap)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = UpdateAppointmentStatus(db, ap.Status, uint32(ap.PatientID))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func GetPatientMedHistoryHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "patient_id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mh, err := GetMedRecordsByPatientId(db, uint32(id))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if mh == nil {
		http.Error(w, "no medical history", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mh)
}

func GetPatientPrescriptionsHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "record_id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	p, err := GetPrescriptionsRecordId(db, uint32(id))

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if p == nil {
		http.Error(w, "no prescriptions", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func GetInventoryItemsHandler(w http.ResponseWriter, r *http.Request) {

	inv, err := GetInventoryItems(db)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if inv == nil {
		http.Error(w, "no itmes in inventory", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(inv)
}
