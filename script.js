// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {

            localStorage.setItem("login", "true");
            localStorage.setItem("userLogin", JSON.stringify(user));

            alert("Login berhasil!");
            window.location.href = "dashboard.html";

        } else {

            alert("Email atau password salah!");

        }

    });
}

// ================= REGISTER =================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const message = document.getElementById("registerMessage");

    registerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        message.className = "";
        message.innerHTML = "";

        const nama = document.getElementById("nama").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const konfirmasi = document.getElementById("konfirmasi").value;

        if (password.length < 8) {
            message.classList.add("error");
            message.innerHTML = "Password minimal 8 karakter.";
            return;
        }

        const regex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

        if (!regex.test(password)) {
            message.classList.add("error");
            message.innerHTML = "Password harus mengandung huruf dan angka.";
            return;
        }

        if (password !== konfirmasi) {
            message.classList.add("error");
            message.innerHTML = "Konfirmasi password tidak sama.";
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const cek = users.find(user => user.email === email);

        if (cek) {
            message.classList.add("error");
            message.innerHTML = "Email sudah digunakan.";
            return;
        }

        users.push({ nama, email, password });

        localStorage.setItem("users", JSON.stringify(users));

        message.classList.add("success");
        message.innerHTML = "Registrasi berhasil! Mengalihkan ke halaman login...";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    });

}

// ================= SHOW / HIDE PASSWORD (dipakai di semua halaman) =================

function togglePassword(inputId, iconId) {

    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!input || !icon) return;

    icon.addEventListener("click", function () {

        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }

    });

}

// Daftarkan semua toggle password yang mungkin ada di halaman ini
togglePassword("password", "toggleRegisterPassword");
togglePassword("konfirmasi", "toggleRegisterConfirm");
togglePassword("loginPassword", "toggleLoginPassword");
togglePassword("newPassword", "togglePassword");
togglePassword("confirmPassword", "toggleConfirm");

// ================= TAMBAH TUGAS =================

const taskForm = document.getElementById("taskForm");

if (taskForm) {

    taskForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const tugas = {
            judul: document.getElementById("judul").value,
            deskripsi: document.getElementById("deskripsi").value,
            proyek: document.getElementById("proyek").value,
            tanggal: document.getElementById("tanggal").value,
            anggota: document.getElementById("anggota").value,
            status: document.getElementById("status").value
        };

        let daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

        daftarTugas.push(tugas);

        localStorage.setItem("tugas", JSON.stringify(daftarTugas));

        alert("Tugas berhasil ditambahkan!");

        window.location.href = "dashboard.html";

    });

}

// ================= DASHBOARD =================

const taskList = document.getElementById("taskList");

if (taskList) {
    tampilkanTugas();
}

function tampilkanTugas() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    const daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

    taskList.innerHTML = "";

    let selesai = 0;
    let belum = 0;

    if (daftarTugas.length === 0) {

        taskList.innerHTML = `
        <p style="text-align:center;color:gray;padding:20px;">
            Belum ada tugas
        </p>
        `;

    } else {

        daftarTugas.forEach((item, index) => {

            let warna = "";

            if (item.status === "Selesai") {
                warna = "green";
                selesai++;
            } else if (item.status === "Proses") {
                warna = "orange";
                belum++;
            } else {
                warna = "red";
                belum++;
            }

            taskList.innerHTML += `
            <div class="task" onclick="lihatDetail(${index})">
                <div>
                    <h4>${item.judul}</h4>
                    <p>${item.proyek}</p>
                    <small>${item.anggota}</small><br>
                    <span class="status ${warna}">
                        ${item.status}
                    </span>
                </div>
                <div class="aksi-tugas">
                    <span class="today">${item.tanggal}</span>
                    <br><br>
                    <button class="hapus-btn"
                    onclick="event.stopPropagation();hapusTugas(${index})">
                    Hapus
                    </button>
                </div>
            </div>
            `;

        });

    }

    // Statistik
    const totalTask = document.getElementById("totalTask");
    const selesaiTask = document.getElementById("selesaiTask");
    const pendingTask = document.getElementById("pendingTask");

    if (totalTask) totalTask.textContent = daftarTugas.length;
    if (selesaiTask) selesaiTask.textContent = selesai;
    if (pendingTask) pendingTask.textContent = belum;

}

// ================= Profil =================

const editBtn = document.getElementById("editBtn");

if (editBtn) {

    editBtn.addEventListener("click", () => {

        let nama = prompt("Masukkan Nama Baru", document.getElementById("nama").innerText);

        if(nama == null) return;

        let email = prompt("Masukkan Email", document.getElementById("email").innerText);

        if(email == null) return;

        let hp = prompt("Masukkan Nomor HP", document.getElementById("hpInfo").innerText);

        if(hp == null) return;

        document.getElementById("nama").innerText = nama;
        document.getElementById("email").innerText = email;

        document.getElementById("namaInfo").innerText = nama;
        document.getElementById("emailInfo").innerText = email;
        document.getElementById("hpInfo").innerText = hp;

        alert("Profil berhasil diperbarui!");

    });

}

const logoutBtn = document.querySelector(".logout");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        let keluar = confirm("Yakin ingin keluar?");

        if(keluar){
            window.location.href="index.html";
        }

    });

}

// ================= USER LOGIN (welcome) =================

const welcomeUser = document.getElementById("welcomeUser");

if (welcomeUser) {

    const user = JSON.parse(localStorage.getItem("userLogin"));

    if (user) {
        welcomeUser.textContent = `Selamat Datang, ${user.nama} 👋`;
    }

}

// ================= DETAIL =================

function lihatDetail(index) {
    localStorage.setItem("detailIndex", index);
    window.location.href = "detail.html";
}

const detailJudul = document.getElementById("detailJudul");

if (detailJudul) {

    const daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];
    const index = localStorage.getItem("detailIndex");
    const tugas = daftarTugas[index];

    if (tugas) {
        document.getElementById("detailJudul").textContent = tugas.judul;
        document.getElementById("detailDeskripsi").textContent = tugas.deskripsi;
        document.getElementById("detailProyek").textContent = tugas.proyek;
        document.getElementById("detailTanggal").textContent = tugas.tanggal;
        document.getElementById("detailAnggota").textContent = tugas.anggota;
    }

}

// ================= EDIT =================

const taskEditBtn = document.getElementById("editBtn");

if (taskEditBtn) {

    taskEditBtn.addEventListener("click", function () {

        let daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];
        let index = localStorage.getItem("detailIndex");
        let tugas = daftarTugas[index];

        if (!tugas) return;

        let judul = prompt("Judul", tugas.judul);
        if (judul === null) return;

        let deskripsi = prompt("Deskripsi", tugas.deskripsi);
        if (deskripsi === null) return;

        tugas.judul = judul;
        tugas.deskripsi = deskripsi;

        daftarTugas[index] = tugas;

        localStorage.setItem("tugas", JSON.stringify(daftarTugas));

        alert("Tugas berhasil diperbarui!");

        location.reload();

    });

}

// ================= HAPUS =================

function hapusTugas(index) {

    if (confirm("Yakin ingin menghapus tugas ini?")) {

        let daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

        daftarTugas.splice(index, 1);

        localStorage.setItem("tugas", JSON.stringify(daftarTugas));

        tampilkanTugas();

    }

}

// ================= SEARCH =================

const search = document.querySelector(".search-box input");

if (search) {

    search.addEventListener("keyup", function () {

        const keyword = this.value.toLowerCase();

        const semuaTaskSearch = document.querySelectorAll(".task");

        semuaTaskSearch.forEach(task => {
            task.style.display = task.innerText.toLowerCase().includes(keyword) ? "flex" : "none";
        });

    });

}

// ================= SETTING =================

const namaUser = document.getElementById("namaUser");

if (namaUser) {

    const user = JSON.parse(localStorage.getItem("userLogin"));

    if (user) {
        namaUser.textContent = user.nama;
        const emailUserEl = document.getElementById("emailUser");
        if (emailUserEl) emailUserEl.textContent = user.email;
    }

}

function logout() {

    if (confirm("Yakin ingin logout?")) {
        localStorage.removeItem("login");
        localStorage.removeItem("userLogin");
        window.location.href = "index.html";
    }

}

function hapusSemuaTugas() {

    if (confirm("Hapus semua tugas?")) {
        localStorage.removeItem("tugas");
        alert("Semua tugas berhasil dihapus.");
    }

}

function tentangApp() {

    alert(
`TaskFlow

Versi 1.0

Aplikasi Manajemen Tugas

Dibuat menggunakan HTML, CSS, JavaScript dan LocalStorage.`
    );

}

// Toggle dark mode versi halaman Setting (checkbox id="darkMode")
const darkMode = document.getElementById("darkMode");

if (darkMode) {

    darkMode.checked = localStorage.getItem("darkMode") === "on";

    darkMode.addEventListener("change", function () {

        if (this.checked) {
            document.body.classList.add("dark");
            localStorage.setItem("darkMode", "on");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("darkMode", "off");
        }

    });

}

// ================= RESET PASSWORD =================

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    const message = document.getElementById("message");

    forgotPasswordForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.getElementById("resetEmail").value.trim();
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        message.className = "";
        message.innerHTML = "";

        if (newPassword.length < 8) {
            message.classList.add("error");
            message.innerHTML = "Password minimal 8 karakter.";
            return;
        }

        const regex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

        if (!regex.test(newPassword)) {
            message.classList.add("error");
            message.innerHTML = "Password harus mengandung huruf dan angka.";
            return;
        }

        if (newPassword !== confirmPassword) {
            message.classList.add("error");
            message.innerHTML = "Konfirmasi password tidak sama.";
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const index = users.findIndex(user => user.email === email);

        if (index === -1) {
            message.classList.add("error");
            message.innerHTML = "Email tidak ditemukan.";
            return;
        }

        users[index].password = newPassword;

        localStorage.setItem("users", JSON.stringify(users));

        message.classList.add("success");
        message.innerHTML = "Password berhasil diubah. Mengalihkan ke login...";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    });
}

// ================= FILTER TUGAS (Semua / Hari Ini / Selesai) =================

const btnSemua = document.getElementById("btnSemua");
const btnHariIni = document.getElementById("btnHariIni");
const btnSelesai = document.getElementById("btnSelesai");

function resetButton() {
    if (btnSemua) btnSemua.classList.remove("aktif");
    if (btnHariIni) btnHariIni.classList.remove("aktif");
    if (btnSelesai) btnSelesai.classList.remove("aktif");
}

if (btnSemua) {
    btnSemua.addEventListener("click", () => {
        resetButton();
        btnSemua.classList.add("aktif");
        document.querySelectorAll(".task").forEach(task => {
            task.style.display = "flex";
        });
    });
}

if (btnHariIni) {
    btnHariIni.addEventListener("click", () => {
        resetButton();
        btnHariIni.classList.add("aktif");
        document.querySelectorAll(".task").forEach(task => {
            task.style.display = task.classList.contains("hariini") ? "flex" : "none";
        });
    });
}

if (btnSelesai) {
    btnSelesai.addEventListener("click", () => {
        resetButton();
        btnSelesai.classList.add("aktif");
        document.querySelectorAll(".task").forEach(task => {
            task.style.display = task.classList.contains("selesai") ? "flex" : "none";
        });
    });
}

// ================= PROYEK =================

const projectForm = document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const progressInput = document.getElementById("progressProyek");

        const proyek = {
            nama: document.getElementById("namaProyek").value,
            deskripsi: document.getElementById("deskripsiProyek").value,
            progress: progressInput ? Number(progressInput.value) || 0 : 0
        };

        let daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

        daftarProyek.push(proyek);

        localStorage.setItem("proyek", JSON.stringify(daftarProyek));

        alert("Proyek berhasil ditambahkan!");

        window.location.href = "proyek.html";

    });

}

function tampilkanProyek() {

    const projectList = document.getElementById("projectList");

    if (!projectList) return;

    let daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

    projectList.innerHTML = "";

    if (daftarProyek.length === 0) {

        projectList.innerHTML = "<p>Belum ada proyek.</p>";

    } else {

        daftarProyek.forEach((item, index) => {

            const progress = item.progress || 0;

            projectList.innerHTML += `
            <div class="project-card">
                <h3>${item.nama}</h3>
                <p>${item.deskripsi}</p>
                <div class="progress">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
                <p style="margin-top:10px;">Progress ${progress}%</p>
                <button class="hapus-btn" onclick="hapusProyek(${index})">Hapus</button>
            </div>
            `;

        });

    }

}

tampilkanProyek();

function hapusProyek(index) {

    let daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

    daftarProyek.splice(index, 1);

    localStorage.setItem("proyek", JSON.stringify(daftarProyek));

    tampilkanProyek();

}

// ================= DARK MODE (global, checkbox id="darkModeToggle") =================

const darkModeToggle = document.getElementById("darkModeToggle");

// Terapkan preferensi dark mode saat halaman dibuka
if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark");
}

if (darkModeToggle) {

    darkModeToggle.checked = localStorage.getItem("darkMode") === "on";

    darkModeToggle.addEventListener("change", function () {

        if (this.checked) {
            document.body.classList.add("dark");
            localStorage.setItem("darkMode", "on");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("darkMode", "off");
        }

    });

}

document.addEventListener("DOMContentLoaded", function () {

    const calendarEl = document.getElementById("calendar");

    let events = JSON.parse(localStorage.getItem("calendarEvents")) || [];

    const calendar = new FullCalendar.Calendar(calendarEl, {

        locale: "id",
        initialView: "dayGridMonth",
        height: "auto",

        headerToolbar: {
            left: "prev,next",
            center: "title",
            right: "today"
        },

        events: events,

        dateClick: function(info){

            const note = prompt("Masukkan catatan");

            if(note){

                const event = {
                    title: note,
                    start: info.dateStr
                };

                events.push(event);

                localStorage.setItem(
                    "calendarEvents",
                    JSON.stringify(events)
                );

                calendar.addEvent(event);
            }
        },

        eventClick: function(info){

            if(confirm("Hapus catatan ini?")){

                info.event.remove();

                events = events.filter(e =>
                    !(e.title === info.event.title &&
                      e.start === info.event.startStr)
                );

                localStorage.setItem(
                    "calendarEvents",
                    JSON.stringify(events)
                );
            }
        }

    });

    calendar.render();

});