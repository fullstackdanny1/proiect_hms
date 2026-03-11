package main

type AppointmentVM struct {
	ID          int    `json:"id"`
	DoctorName  string `json:"doc_name"`
	PatientName string `json:"p_name"`
	Date        string `json:"date"`
	StartHour   string `json:"start_hour"`
	EndHour     string `json:"end_hour"`
	Status      string `json:"status"`
}

type MedicalRecordVM struct {
	ID          int    `json:"id"`
	PatientName string `json:"patient"`
	DoctorName  string `json:"doctor"`
	Diagnosis   string `json:"diagnosis"`
	Notes       string `json:"notes"`
	CreatedAt   string `json:"created_at"`
}

type PrescriptionVM struct {
	ID           int    `json:"id"`
	DoctorName   string `json:"doctor"`
	MedName      string `json:"medicament"`
	Instructions string `json:"instructiuni"`
}
