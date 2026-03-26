const loggedUser = JSON.parse(localStorage.getItem("user"))
const content = document.getElementById("content")
const nav = document.getElementById("nav")

if(!loggedUser){
    window.location = "login.html"
}

function setupNav() {
    if(loggedUser.role === "admin") {
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

async function renderHome()
{
    content.innerHTML = ""
    let flashcard = await createUserFlashcard(loggedUser)
    content.appendChild(flashcard)
}

async function createUserFlashcard(user) {

    const div = document.createElement("div");
    div.className = "user-flashcard";

    div.innerHTML = `<h2>${user.username}</h2>
                    <p>ID utilizator: ${user.user_id}</p>
                    <p>Rol: ${user.role}</p>`;

    if(user.role === "admin") return div;
        
    await getUserFullInfo(user.user_id, user.role, div);
    
    return div
}

async function getUserFullInfo(userId, role, container) { 
    try {
        if(role === "patient") {
            const patient = await getPatient(userId);
            container.innerHTML += `
                <p>Nume: ${patient.name}</p>
                <p>CNP: ${patient.cnp}</p>
                <p>Telefon: ${patient.phone}</p>
                <p>Email: ${patient.email}</p>
                <p>Data nasterii: ${formatDateString(patient.birth_date)}</p>`;
        }
        else if(role === "doctor") {
            const doctor = await getDoctor(userId);
            container.innerHTML += `
                <p>Nume: ${doctor.name}</p>
                <p>Telefon: ${doctor.phone}</p>
                <p>Email: ${doctor.email}</p>
                <p>Specializare: ${doctor.specialisation}</p>`;
        }
        
    } catch(err) {
        console.error("Error loading user details:", err);
    }
}

async function renderUsers() {

    content.innerHTML = ""
    let usersTable = await createUsersTable()

    if(!usersTable) 
    {
        content.innerHTML = "<p>Nu exista utilizatori</p>";
        return;
    }

    content.appendChild(usersTable);
}

async function createUsersTable()
{
    try {
        let table = document.createElement("table");
        table.className = "data-table";
        
        let thead = document.createElement("thead");
        thead.innerHTML = `<tr><th>User Id</th><th>Username</th><th>Role</th></tr>`;
        
        let tbody = document.createElement("tbody");
        
        const users = await getUsers();

        if(!users || users.length === 0) return null;
        
        tbody.innerHTML = users.map(u => `
            <tr data-userid="${u.user_id}" class="user-row">
                <td>${u.user_id}</td>
                <td>${u.username}</td>
                <td>${u.role}</td>
                </tr>`).join('');
    
        table.appendChild(thead);
        table.appendChild(tbody);

        tbody.querySelectorAll(".user-row").forEach(row => {
            row.addEventListener("click", async () => {
                const userId = row.dataset.userid;
                const user = users.find(u => u.user_id == userId)

                if(user.role === "admin") return;

                const previousView = table;
                content.innerHTML = "";

                const flashCard = await createUserFlashcard(user);
                content.appendChild(flashCard);

                let returnButton = document.createElement("button");
                returnButton.textContent = "Inapoi";

                returnButton.addEventListener("click", (e) => {
                    content.innerHTML = "";
                    content.appendChild(previousView);
                });
                flashCard.appendChild(returnButton);
                
            });
        });
        return table;

    } catch(err) {
        console.error("Error list users: ", err);
    }
}

async function renderPatientAppointments() {
 
    content.innerHTML = "";

    let appointmentsTable = await createPatientAppnmtTable(loggedUser.user_id);

    if(!appointmentsTable) {
        content.innerHTML = "<p>Nu exista programari</p>"
        return;
    }
    content.innerHTML += "<h3>Programările Tale</h3>";
    content.appendChild(appointmentsTable);
}

async function createPatientAppnmtTable(userId)
{
    try {
        let table = document.createElement("table");
        table.className = "data-table";
        let thead = document.createElement("thead");
        thead.innerHTML = `<tr>
                    <th>Doctor</th>
                    <th>Data</th>
                    <th>Interval</th>
                    <th>Status</th>
                </tr>`

        let tbody = document.createElement("tbody");
        
        const appointments = await getPatientAppointments(userId);

        if(!appointments || appointments.length === 0) return null;
        
        tbody.innerHTML = appointments.map(ap => `<tr>
                <td>${ap.doc_name}</td>
                <td>${formatDateString(ap.date)}</td>
                <td>${ap.start_hour} - ${ap.end_hour}</td>
                <td>${ap.status}</td>
            </tr>`
        ).join('');

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;

    } catch (err) {
        console.error("error: Could not load appointments!", err);
    }
}
async function renderDocAppointments() {
    content.innerHTML = "";
    // Apelăm funcția de creare a tabelului
    let appointmentsTable = await createDocAppnmtTable(loggedUser.user_id);

    if (!appointmentsTable) {
        content.innerHTML = "<h3>Programări Pacienti</h3><p>Nu există programări momentan.</p>";
        return;
    }

    content.innerHTML = "<h3>Programări Pacienti</h3>";
    content.appendChild(appointmentsTable);
}
async function createDocAppnmtTable(userId) {
    try {
        let table = document.createElement("table");
        table.className = "data-table";
        let thead = document.createElement("thead");
        thead.innerHTML = `<tr>
                    <th>Pacient</th>
                    <th>Data</th>
                    <th>Interval</th>
                    <th>Status</th>
                </tr>`;
        let tbody = document.createElement("tbody");

        const appointments = await getDoctorAppointments(userId);
        if (!appointments || appointments.length === 0) return null;

        tbody.innerHTML = appointments.map(ap =>
            `<tr data-patientid="${ap.patient_id}" data-patientname="${ap.p_name}" class="appointment-row">
                <td>${ap.p_name}</td>
                <td>${formatDateString(ap.date)}</td>
                <td>${ap.start_hour} - ${ap.end_hour}</td>
                <td>${ap.status}</td>
            </tr>`
        ).join('');

        table.appendChild(thead);
        table.appendChild(tbody);

        const previousView = table; 

        tbody.querySelectorAll(".appointment-row").forEach(row => {
            row.addEventListener("click", async () => {
                const patientId = row.dataset.patientid;
                const patientName = row.dataset.patientname;

                const user = { user_id: patientId, username: patientName, role: "patient" };

                let profileWrapper = document.createElement("div");
                profileWrapper.className = "patient-dashboard";

                let sidebar = document.createElement("div");
                sidebar.className = "patient-sidebar";

                let mainContent = document.createElement("div");
                mainContent.className = "patient-main";

                let flashCard = await createUserFlashcard(user);
                let history = await createMedHistoryTable(patientId, profileWrapper);
                sidebar.innerHTML = "<h3>Detalii pacient</h3>"
                sidebar.appendChild(flashCard);

                let backBtn = document.createElement("button");
                backBtn.textContent = "« Înapoi la listă";
                backBtn.className = "btn-secondary"; 
                backBtn.style.width = "100%";
                backBtn.addEventListener("click", () => {
                    content.innerHTML = "<h3>Programări Pacienti</h3>";
                    content.appendChild(previousView);
                });
                sidebar.appendChild(backBtn);

                mainContent.innerHTML = "<h3>Istoric Medical</h3>";
                if (history) {
                    mainContent.appendChild(history);
                } else {
                    mainContent.innerHTML += "<p>Nu există istoric pentru acest pacient.</p>";
                }

                profileWrapper.appendChild(sidebar);
                profileWrapper.appendChild(mainContent);

                content.innerHTML = "";
                content.appendChild(profileWrapper);
            });
        });

        return table; // <--- ACESTA lipsea și bloca afișarea!

    } catch (err) {
        console.error("Eroare la crearea tabelului de programări:", err);
        return null;
    }
}

async function renderMedicalHistory() {
    
    content.innerHTML = "";

    let medHistory = await createMedHistoryTable(loggedUser.user_id);

    if(!medHistory)
    {
        content.innerHTML = "<p>Nu există istoric medical disponibil</p>";
        return;
    }

    content.innerHTML += "<h3>Istoric Medical</h3>";
    content.appendChild(medHistory);
}

async function createMedHistoryTable(userId, previousView = null)
{
    try {
        let table = document.createElement("table");
        table.className = "data-table";
        let thead = document.createElement("thead");
        thead.innerHTML = `<tr>
                    <th>Diagnostic</th>
                    <th>Doctor</th>
                    <th>Note</th>
                    <th>Data</th>
                    <th>Acțiuni</th>
                </tr>`;
        let tbody = document.createElement("tbody");

        const history = await getPatientMedicalHistory(userId);

        if(!history || history.length === 0) return null;

        tbody.innerHTML = history.map(mh => `<tr>
                <td>${mh.diagnosis}</td>
                <td>${mh.doctor}</td>
                <td>${mh.notes}</td>
                <td>${formatDateString(mh.created_at)}</td>
                <td><button class="view-presc-btn" data-recordid="${mh.id}">Vezi Rețetă</button></td>
            </tr>`
        ).join('');
        
        table.appendChild(thead);
        table.appendChild(tbody);

        tbody.querySelectorAll(".view-presc-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const recordId = btn.dataset.recordid;

                if(previousView == null) viewPrescriptionList(recordId, table);
                else viewPrescriptionList(recordId, previousView);
            })
        })

        return table;

    } catch (err) {
        console.error("Error: history could not be found", err);
    }
}

async function viewPrescriptionList(recordId, previousView) {

    try {
        let table = document.createElement("table");
        table.className = "data-table";
        let thead = document.createElement("thead");
        thead.innerHTML = `<tr>
                    <th>Medicament</th>
                    <th>Instrucțiuni</th>
                    <th>Doctor</th>
                </tr>`;

        let tbody = document.createElement("tbody");
        
        const prescriptions = await getPatientPrescriptions(recordId);
        
        tbody.innerHTML = prescriptions.map(p => `<tr>
                <td>${p.medicament}</td>
                <td>${p.instructiuni}</td>
                <td>${p.doctor}</td>
            </tr>`
        ).join('');

        table.appendChild(thead);
        table.appendChild(tbody);

        let button = document.createElement("button");
        button.textContent = "Inapoi la istoric";
        button.addEventListener("click", (e) => {
            content.innerHTML = "";
            content.appendChild(previousView);
        })

        content.innerHTML = "<h3>Prescriptii</h3>";
        content.appendChild(table);
        content.appendChild(button);

    } catch (err) {  
        content.innerHTML = "<p>Nu ai prescriptii</p>"; 
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

        const schedules = await getDoctorSchedules(loggedUser.user_id);

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

setupNav();
renderHome();
