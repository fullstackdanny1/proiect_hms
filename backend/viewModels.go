package main

import "time"

type AppointmentVM struct {
	ID          int       `json:"id"`
	DoctorName  string    `json:"doc_name"`
	PatientName string    `json:"p_name"`
	Date        time.Time `json:"date"`
	StartHour   time.Time `json:"start_hour"`
	EndHour     time.Time `json:"end_hour"`
	Status      string    `json:"status"`
}

type MedicalRecordVM struct {
	ID          int       `json:"id"`
	PatientName string    `json:"patient_id"`
	DoctorName  string    `json:"doctor"`
	Diagnosis   string    `json:"diagnosis"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
}

type PrescriptionVM struct {
	ID           int    `json:"id"`
	DoctorName   string `json:"doctor"`
	MedName      string `json:"medicament"`
	Instructions string `json:"instructiuni"`
}
