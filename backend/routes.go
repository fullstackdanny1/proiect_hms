package main

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func SetupRoutes() *chi.Mux {

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.CleanPath)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Printf("Received: %s %s\n", r.Method, r.URL.Path)
			next.ServeHTTP(w, r)
		})
	})
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
		r.Put("/appointments/update-status", UpdateAppointmentStatusHandler)

	})

	r.Get("/users", GetUsersHandler)
	r.Post("/users/login", GetUserByNameAndPasswordHandler)
	r.Get("/inventory", GetInventoryItemsHandler)

	fs := http.FileServer(http.Dir("./frontend"))
	r.Handle("/*", http.StripPrefix("/", fs))

	return r
}
