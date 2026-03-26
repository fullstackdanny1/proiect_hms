const API = "http://localhost:8080"

async function getUsers() {
    const res = await fetch(`${API}/users`)
    return res.json()
}

async function getValidateUser(username, password) {
    const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
    });

    const text = await res.text()
    console.log("Raw response:", text)

    return JSON.parse(text)
    //return res.json()
}

async function getPatients() {
    const res = await fetch(`${API}/patients/`)

    return res.json()
}

async function getPatient(ID) {
    const res = await fetch(`${API}/patients/${ID}`)

    return res.json()
}

async function getPatientAppointments(ID) {
    const res = await fetch(`${API}/patients/appointments/${ID}`)

    return res.json()
}

async function getPatientMedicalHistory(ID) {
    const res = await fetch(`${API}/patients/medical-history/${ID}`)

    return res.json()
}
async function getPatientPrescriptions(record_ID) {
    const res = await fetch(`${API}/patients/prescriptions/${record_ID}`)

    return res.json()
}

async function createPatient(user, patient) {
    const res = await fetch(`${API}/patients/create-patient`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": user.username,
            "password": user.password,
            "role": user.role,
            "name": patient.name,
            "cnp": patient.cnp,
            "phone": patient.phone,
            "email": patient.email,
            "birth_date": patient.birth_date
        })
    })

    return res.json()
}
async function getDoctors() {
    const res = await fetch(`${API}/doctors/`)

    return res.json()
}

async function getDoctor(ID) {
    const res = await fetch(`${API}/doctors/${ID}`)

    return res.json()
}
async function createDoctor(user, doctor) {
    const res = await fetch(`${API}/doctors/create-doctor`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": user.username,
            "password": user.password,
            "role": user.role,
            "name": doctor.name,
            "phone": doctor.phone,
            "email": doctor.email,
            "specialisation": doctor.specialisation
        })
    })

    return res.json()
}

async function getDoctorSchedules(ID) {
    const res = await fetch(`${API}/doctors/schedules/${ID}`)

    return res.json()
}
async function getDoctorAppointments(ID) {
    const res = await fetch(`${API}/doctors/appointments/${ID}`)

    return res.json()
}

async function updateAppointmentStatus(user_ID, status) {
    const res = await fetch(`${API}/doctors/appointments/update-status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "patient_id": user_ID,
            "status": status
        })
    })

    return res.json()
}

async function getInventory(){
    const res = await fetch(`${API}/inventory`)

    return res.json()
}


