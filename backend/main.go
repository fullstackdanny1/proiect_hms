package main

import (
	"log"
	"net/http"
)

func main() {

	InitDB()
	defer db.Close()

	r := SetupRoutes()
	err := http.ListenAndServe(":8080", r)
	if err != nil {
		log.Fatal(err)
	}
}
