const loggedUser = JSON.parse(localStorage.getItem("user"))
const content = document.getElementById("content")
const nav = document.getElementById("nav")

if(!loggedUser){
    window.location = "login.html"
}

function setupNav() {
    if(loggedUser.role === "admin"){
        nav.innerHTML = `<li><a href ='#' id ="nav-home">Acasa</a></li>
            <li><a href ='#' id ="nav-users">Utilizatori</a></li>
            <li><a href ='#' id ="nav-inventory">Inventar</a></li>
            <li><a href ='#' id ="nav-logout">Deconecteaza-te</a></li>`
    }
    else if(loggedUser.role === "doctor") {
        nav.innerHTML = `<li><a href ='#' id ="nav-home">Acasa</a></li>
            <li><a href ='#' id ="nav-schedule">Program doctor</a></li>
            <li><a href ='#' id ="nav-doc-appointments">Programari pacienti</a></li>
            <li><a href ='#' id ="nav-logout">Deconecteaza-te</a></li>`
    }
    else if(loggedUser.role === "patient") {
        nav.innerHTML = `<li><a href ='#' id ="nav-home">Acasa</a></li>
            <li><a href ='#' id ="nav-patient-appointments">Programari</a></li>
            <li><a href ='#' id ="nav-medical-history">Istoric medical</a></li>
            <li><a href ='#' id ="nav-logout">Deconecteaza-te</a></li>`
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

function renderHome() {
    content.innerHTML = "";
    const div = document.createElement("div");
    div.className = "user-flashcard";

    div.innerHTML = `<h2>Bine ai venit, ${loggedUser.username}</h2>
                     <p>ID utilizator: ${loggedUser.user_id}</p>
                     <p>Rol: ${loggedUser.role}</p>`;
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
                card.innerHTML = `<h2>User Detalii</h2><p>ID utilizator: ${userId}</p><p>Rol: ${role}</p>`;
                content.appendChild(card);

                await getUserFullInfo(userId, role, card);

                const backBtn = document.createElement("button");
                backBtn.innerText = "Inapoi";
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
                <p>Nume: ${patient.name}</p>
                <p>CNP: ${patient.cnp}</p>
                <p>Telefon: ${patient.phone}</p>
                <p>Email: ${patient.email}</p>
                <p>Data nasterii: ${formatDateString(patient.birth_date)}</p>`;
        }
        else if(role === "doctor") {
            const doctor = await getDoctor(userId);
            detailsHtml = `
                <p>Nume: ${doctor.name}</p>
                <p>Telefon: ${doctor.phone}</p>
                <p>Email: ${doctor.email}</p>
                <p>Specializare: ${doctor.specialisation}</p>`;
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
            html += `<tr>
                <td>${ap.doc_name}</td>
                <td>${formatDateString(ap.date)}</td>
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
            html += `<tr>
                <td>${ap.p_name}</td>
                <td>${formatDateString(ap.date)}</td>
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
            html += `<tr>
                <td>${mh.diagnosis}</td>
                <td>${mh.doctor}</td>
                <td>${mh.notes}</td>
                <td>${formatDateString(mh.created_at)}</td>
                <td><button onclick="viewPrescriptionFromRecord(${mh.id})">Vezi Rețetă</button></td>
            </tr>`;
        });
        content.innerHTML = html + `</tbody></table>`;
    } catch (err) {
        content.innerHTML = "<p>Nu există istoric medical disponibil.</p>";
    }
}
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
            html += `<tr>
                <td>${p.medicament}</td>
                <td>${p.instructiuni}</td>
                <td>${p.doctor}</td>
            </tr>`;
        });
        content.innerHTML = html + `</tbody></table><button onclick="renderMedicalHistory()">Înapoi la Istoric</button>`;
    } catch (err) {  
        content.innerHTML = "<p>You have no prescriptions</p>"; 
    }
}

async function renderInventory() {
    content.innerHTML = `<p>Rendering inventory...</p>`
    try {
        const items = await getInventory();
        let html = `<table class="data-table">
            <thead>
                <tr><th>Item ID</th><th>Nume item</th><th>Tip item</th><th>Stock</th></tr>
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
    content.innerHTML = "Rendering doctor schedule..."

    try {
        let html = `<h3>Program doctor</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Ziua</th>
                                <th>Incepe la</th>
                                <th>Termina la</th>
                            </tr>
                        </thead>
                        <tbody>`;

        const schedules = await getDoctorScedules(loggedUser.user_id);

        schedules.forEach(s => {
            html += `
                <tr>
                    <td>${weekday(s.day_of_week)}</td>
                    <td>${s.start_hour}</td>
                    <td>${s.end_hour}</td>
                </tr>`;
        });

        html += `</tbody></table>`;
        content.innerHTML = html;
    }
    catch (err) {
        content.innerHTML = "Failed to load doctor schedules...";
        console.error(err);
    }
}

function weekday(day) {
    const days = [
        "Luni",
        "Marți",
        "Miercuri",
        "Joi",
        "Vineri",
        "Sâmbătă",
        "Duminică"
    ];

    return days[day - 1] || "Necunoscut";
}

function logout() {
    localStorage.removeItem("user");
    window.location = "login.html";
}

function formatDateString(dateString){
    return new Date(dateString).toLocaleDateString('ro-RO')
}
// 4. Inițializare sistem
setupNav();
renderHome();
