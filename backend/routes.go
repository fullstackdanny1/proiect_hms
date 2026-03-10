package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func SetupRoutes() *chi.Mux {

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Route("/patients", func(r chi.Router) {
		r.Get("/", GetPatientsHandler)
		r.Get("/{id}", GetPatientHandler)
		r.Post("/create-patient", CreatePatientHandler)
		r.Get("/appointments/{patient_id}", GetPatientAppointmentHandler)
		r.Get("/medical-history/{patient_id}", GetPatientMedHistoryHandler)
		r.Get("/prescriptions/{record_id}", GetPatientPrescriptionsHandler)
	})

	r.Route("/doctors", func(r chi.Router) {
		r.Get("/", GetDoctorsHandler)
		r.Get("/{id}", GetDoctorHandler)
		r.Post("/create-doctor", CreateDoctorHandler)
		r.Get("/schedules/{doctor_id}", GetDoctorSchedulesHandler)
		r.Get("/appointments/{doctor_id}", GetDoctorAppointmentHandler)
		r.Put("/appointments/{status}-{patient_id}", UpdateAppointmentStatusHandler)

	})

	r.Get("/users", GetUsersHandler)
	r.Get("/login", GetUserByNameAndPasswordHandler)
	r.Get("/inventory/", GetInventoryItemsHandler)

	return r
}
