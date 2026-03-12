const loggedUser = JSON.parse(localStorage.getItem("user"))
const content = document.getElementById("content")
const nav = document.getElementById("nav")

if(!loggedUser){
    window.location = "login.html"
}

function setupNav() {
    if(loggedUser.role === "admin"){
        nav.innerHTML = `<li><a href ='#' id ="nav-home">Home</a></li>
            <li><a href ='#' id ="nav-users">Users</a></li>
            <li><a href ='#' id ="nav-inventory">Inventory</a></li>
            <li><a href ='#' id ="nav-logout">Logout</a></li>`
    }
    else if(loggedUser.role === "doctor") {
        nav.innerHTML = `<li><a href ='#' id ="nav-home">Home</a></li>
            <li><a href ='#' id ="nav-schedule">Schedule</a></li>
            <li><a href ='#' id ="nav-doc-appointments">Appointments</a></li>
            <li><a href ='#' id ="nav-logout">Logout</a></li>`
    }
    else if(loggedUser.role === "patient") {
        nav.innerHTML = `<li><a href ='#' id ="nav-home">Home</a></li>
            <li><a href ='#' id ="nav-patient-appointments">Appointments</a></li>
            <li><a href ='#' id ="nav-medical-history">Medical History</a></li>
            <li><a href ='#' id ="nav-logout">Logout</a></li>`
    }
    attachEventListeners();
}

function attachEventListeners() {
    const clickMap = {
        "nav-home": renderHome,
        "nav-users": renderUsers,
        "nav-inventory": renderInventory,
        "nav-schedule": renderSchedules,
        "nav-doc-appointments": renderDocAppointments,
        "nav-patient-appointments": renderPatientAppointments,
        "nav-medical-history": renderMedicalHistory,
        "nav-logout": logout
    };

    Object.keys(clickMap).forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener("click", (e) => {
            e.preventDefault();
            clickMap[id]();
        });
    });
}

// 3. Funcții de Redare (Render)
function renderHome() {
    content.innerHTML = "";
    const div = document.createElement("div");
    div.className = "user-flashcard";

    div.innerHTML = `<h2>Welcome, ${loggedUser.username}</h2>
                     <p>User ID: ${loggedUser.user_id}</p>
                     <p>Role: ${loggedUser.role}</p>`;
    content.appendChild(div);

    if(loggedUser.role !== "admin") {
        getUserFullInfo(loggedUser.user_id, loggedUser.role, div);
    }
}

async function renderUsers() {
    content.innerHTML = `<p>Loading users....</p>`
    try {
        const users = await getUsers();
        let html = `<table class="data-table">
            <thead>
                <tr><th>User Id</th><th>Username</th><th>Role</th></tr>
            </thead>
            <tbody>`;
                
        users.forEach(u => {
            html += `<tr data-userid="${u.user_id}" data-role="${u.role}" class="user-row">
                <td>${u.user_id}</td>
                <td>${u.username}</td>
                <td>${u.role}</td>
                </tr>`;
        });
        html += `</tbody></table>`;
        content.innerHTML = html;
                
        document.querySelectorAll(".user-row").forEach(row => {
            row.addEventListener("click", async () => {
                const userId = row.dataset.userid;
                const role = row.dataset.role;
                if (role === "admin") return; 

                content.innerHTML = "";
                const card = document.createElement("div");
                card.className = "user-flashcard";
                card.innerHTML = `<h2>User Details</h2><p>User ID: ${userId}</p><p>Role: ${role}</p>`;
                content.appendChild(card);

                await getUserFullInfo(userId, role, card);

                const backBtn = document.createElement("button");
                backBtn.innerText = "Go back";
                backBtn.onclick = renderUsers;
                card.appendChild(backBtn);
            });
        });
    } catch(err) {
        content.innerHTML = "<p>Error loading users</p>";
    }
}

async function getUserFullInfo(userId, role, container) { 
    try {
        let detailsHtml = "";
        if(role === "patient") {
            const patient = await getPatient(userId);
            detailsHtml = `
                <p>Name: ${patient.name}</p>
                <p>CNP: ${patient.cnp}</p>
                <p>Phone: ${patient.phone}</p>
                <p>Email: ${patient.email}</p>
                <p>Birth Date: ${patient.birth_date}</p>`;
        }
        else if(role === "doctor") {
            const doctor = await getDoctor(userId);
            detailsHtml = `
                <p>Name: ${doctor.name}</p>
                <p>Phone: ${doctor.phone}</p>
                <p>Email: ${doctor.email}</p>
                <p>Specialisation: ${doctor.specialisation}</p>`;
        }
        const infoDiv = document.createElement("div");
        infoDiv.innerHTML = detailsHtml;
        container.appendChild(infoDiv);
    } catch(err) {
        console.error("Error loading user details:", err);
    }
}
async function renderPatientAppointments() {
    content.innerHTML = `<p>Se încarcă programările...</p>`;
    try {
        const appointments = await getPatientAppointments(loggedUser.user_id);
        let html = `<h3>Programările Tale</h3><table class="data-table">
            <thead>
                <tr>
                    <th>Doctor</th>
                    <th>Data</th>
                    <th>Interval</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>`;
        
        appointments.forEach(ap => {
            // Folosim proprietățile din AppointmentVM: doc_name, date, start_hour, end_hour, status
            html += `<tr>
                <td>${ap.doc_name}</td>
                <td>${ap.date}</td>
                <td>${ap.start_hour} - ${ap.end_hour}</td>
                <td>${ap.status}</td>
            </tr>`;
        });
        content.innerHTML = html + `</tbody></table>`;
    } catch (err) {
        content.innerHTML = "<p>Nu aveți programări sau a apărut o eroare.</p>";
    }
}

async function renderDocAppointments() {
    content.innerHTML = `<p>Se încarcă programările pacienților...</p>`;
    try {
        const appointments = await getDoctorAppointments(loggedUser.user_id);
        let html = `<h3>Programări Pacienți</h3><table class="data-table">
            <thead>
                <tr>
                    <th>Pacient</th>
                    <th>Data</th>
                    <th>Interval</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>`;
        
        appointments.forEach(ap => {
            // Folosim p_name pentru numele pacientului conform AppointmentVM
            html += `<tr>
                <td>${ap.p_name}</td>
                <td>${ap.date}</td>
                <td>${ap.start_hour} - ${ap.end_hour}</td>
                <td>${ap.status}</td>
            </tr>`;
        });
        content.innerHTML = html + `</tbody></table>`;
    } catch (err) {
        content.innerHTML = "<p>Eroare la încărcarea programărilor.</p>";
    }
}

async function renderMedicalHistory() {
    content.innerHTML = `<p>Se încarcă istoricul medical...</p>`;
    try {
        const history = await getPatientMedicalHistory(loggedUser.user_id);
        let html = `<h3>Istoric Medical</h3><table class="data-table">
            <thead>
                <tr>
                    <th>Diagnostic</th>
                    <th>Doctor</th>
                    <th>Note</th>
                    <th>Data</th>
                    <th>Acțiuni</th>
                </tr>
            </thead>
            <tbody>`;
        
        history.forEach(mh => {
            // Folosim diagnosis, doctor, notes, created_at conform MedicalRecordVM
            html += `<tr>
                <td>${mh.diagnosis}</td>
                <td>${mh.doctor}</td>
                <td>${mh.notes}</td>
                <td>${mh.created_at}</td>
                <td><button onclick="viewPrescriptionFromRecord(${mh.id})">Vezi Rețetă</button></td>
            </tr>`;
        });
        content.innerHTML = html + `</tbody></table>`;
    } catch (err) {
        content.innerHTML = "<p>Nu există istoric medical disponibil.</p>";
    }
}

// Funcție helper pentru a vedea rețeta unei înregistrări specifice
window.viewPrescriptionFromRecord = async function(recordId) {
    content.innerHTML = `<p>Se încarcă rețeta...</p>`;
    try {
        const prescriptions = await getPatientPrescriptions(recordId);
        let html = `<h3>Detalii Rețetă</h3><table class="data-table">
            <thead>
                <tr>
                    <th>Medicament</th>
                    <th>Instrucțiuni</th>
                    <th>Doctor</th>
                </tr>
            </thead>
            <tbody>`;
        
        prescriptions.forEach(p => {
            // Folosim medicament, instructiuni, doctor conform PrescriptionVM
            html += `<tr>
                <td>${p.medicament}</td>
                <td>${p.instructiuni}</td>
                <td>${p.doctor}</td>
            </tr>`;
        });
        content.innerHTML = html + `</tbody></table><button onclick="renderMedicalHistory()">Înapoi la Istoric</button>`;
    } catch (err) {
        //content.innerHTML = "<p>Nu a fost găsită nicio rețetă pentru această înregistrare.</p><button onclick="renderMedicalHistory()">Înapoi</button>";
    }
}

async function renderInventory() {
    content.innerHTML = `<p>Rendering inventory...</p>`
    try {
        const items = await getInventory();
        let html = `<table class="data-table">
            <thead>
                <tr><th>Item ID</th><th>Item name</th><th>Item type</th><th>Stock</th></tr>
            </thead>
            <tbody>`;
        items.forEach(i => {
            html += `<tr><td>${i.item_id}</td><td>${i.item_name}</td><td>${i.item_type}</td><td>${i.number_of_items}</td></tr>`;
        });
        content.innerHTML = html + `</tbody></table>`;      
    } catch(err) {
        content.innerHTML = "<p>Error loading inventory</p>";
    }
}

async function renderSchedules() {
    content.innerHTML = "<p>Schedule management is under construction.</p>";
}

function logout() {
    localStorage.removeItem("user");
    window.location = "login.html";
}

// 4. Inițializare sistem
setupNav();
renderHome();
