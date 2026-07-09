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

togglePassword("password", "toggleRegisterPassword");
togglePassword("konfirmasi", "toggleRegisterConfirm");
togglePassword("loginPassword", "toggleLoginPassword");
togglePassword("newPassword", "togglePassword");
togglePassword("confirmPassword", "toggleConfirm");

// ================= HELPER TANGGAL (dipakai di banyak halaman) =================

const NAMA_BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function formatTanggal(tanggal) {

    if (!tanggal) return "Tanpa deadline";

    const d = new Date(tanggal + "T00:00:00");

    if (isNaN(d)) return tanggal;

    return `${String(d.getDate()).padStart(2, "0")} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;

}

function infoDeadline(tanggal) {

    if (!tanggal) return { label: "Tanpa deadline", kelas: "nanti" };

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const target = new Date(tanggal + "T00:00:00");

    const selisih = Math.round((target - hariIni) / 86400000);

    if (selisih < 0) return { label: "Terlewat", kelas: "telat" };
    if (selisih === 0) return { label: "Hari ini", kelas: "hari-ini" };
    if (selisih === 1) return { label: "Besok", kelas: "besok" };

    return { label: `H-${selisih}`, kelas: "nanti" };

}

// Dipakai untuk urutkan gabungan tugas & proyek berdasarkan deadline terdekat
function waktuUrut(tanggal) {
    if (!tanggal) return Infinity;
    const t = new Date(tanggal + "T00:00:00").getTime();
    return isNaN(t) ? Infinity : t;
}

// ================= REFRESH SEMUA TAMPILAN (dipanggil setelah tambah/ubah/hapus) =================

function refreshSemua() {
    if (document.getElementById("dashboardList")) renderDashboard();
    if (document.getElementById("taskList")) renderTugasPage();
    if (document.getElementById("projectList")) renderProyekPage();
}

// ================= TAMBAH TUGAS =================

const taskForm = document.getElementById("taskForm");

if (taskForm) {

    taskForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const kategoriEl = document.getElementById("kategoriTugas");
        const reminderEl = document.getElementById("reminderTugas");

        const tugas = {
            id: Date.now(),
            judul: document.getElementById("judul").value,
            deskripsi: document.getElementById("deskripsi").value,
            kategori: kategoriEl ? kategoriEl.value : "",
            tanggal: document.getElementById("tanggal").value,
            status: document.getElementById("status").value,
            reminder: reminderEl ? reminderEl.value : ""
        };

        let daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

        daftarTugas.push(tugas);

        localStorage.setItem("tugas", JSON.stringify(daftarTugas));

        alert("Tugas berhasil ditambahkan!");

        window.location.href = "tugas.html";

    });

}

// ================= HALAMAN TUGAS (list dinamis + filter + toggle selesai) =================

let filterTugasAktif = "semua";

function renderTugasPage() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    const daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

    // Tempelkan index asli sebelum difilter, supaya toggle/hapus tetap kena data yang benar
    let ditampilkan = daftarTugas.map((item, idx) => Object.assign({}, item, { idxAsli: idx }));

    const hariIniStr = new Date().toISOString().split("T")[0];

    if (filterTugasAktif === "hariini") {
        ditampilkan = ditampilkan.filter(t => t.tanggal === hariIniStr);
    } else if (filterTugasAktif === "selesai") {
        ditampilkan = ditampilkan.filter(t => t.status === "Selesai");
    }

    if (ditampilkan.length === 0) {

        taskList.innerHTML = `
        <p style="text-align:center;color:gray;padding:30px 10px;">
            Belum ada tugas${filterTugasAktif !== "semua" ? " pada kategori ini" : ""}.
        </p>
        `;

        return;
    }

    taskList.innerHTML = ditampilkan.map(item => {

        const selesai = item.status === "Selesai";
        const warnaStatus = selesai ? "green" : (item.status === "Proses" ? "orange" : "");
        const dl = infoDeadline(item.tanggal);

        return `
        <div class="task ${selesai ? "selesai" : ""}">

            <div class="status ${warnaStatus}"></div>

            <div class="task-info">
                <h3>${item.judul}</h3>
                ${item.kategori ? `<span class="tag-pill"><i class="fa-solid fa-tag"></i> ${item.kategori}</span>` : ""}
                <p>
                    <span class="deadline-badge ${dl.kelas}">
                        <i class="fa-regular fa-calendar"></i>
                        ${formatTanggal(item.tanggal)} &middot; ${dl.label}
                    </span>
                </p>
            </div>

            <div class="aksi-tugas">
                <button class="check ${selesai ? "done" : ""}" onclick="toggleTugas(${item.idxAsli})" title="Tandai selesai">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="hapus-btn" onclick="hapusTugas(${item.idxAsli})">Hapus</button>
            </div>

        </div>
        `;

    }).join("");

}

function toggleTugas(index) {

    let daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

    const item = daftarTugas[index];

    if (!item) return;

    item.status = item.status === "Selesai" ? "Belum" : "Selesai";

    daftarTugas[index] = item;

    localStorage.setItem("tugas", JSON.stringify(daftarTugas));

    refreshSemua();

}

function hapusTugas(index) {

    if (confirm("Yakin ingin menghapus tugas ini?")) {

        let daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

        daftarTugas.splice(index, 1);

        localStorage.setItem("tugas", JSON.stringify(daftarTugas));

        refreshSemua();

    }

}

// Tombol filter Semua / Hari Ini / Selesai di halaman Tugas

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
        filterTugasAktif = "semua";
        renderTugasPage();
    });
}

if (btnHariIni) {
    btnHariIni.addEventListener("click", () => {
        resetButton();
        btnHariIni.classList.add("aktif");
        filterTugasAktif = "hariini";
        renderTugasPage();
    });
}

if (btnSelesai) {
    btnSelesai.addEventListener("click", () => {
        resetButton();
        btnSelesai.classList.add("aktif");
        filterTugasAktif = "selesai";
        renderTugasPage();
    });
}

if (document.getElementById("taskList")) {
    renderTugasPage();
}

// ================= DASHBOARD (gabungan tugas + proyek) =================

function renderDashboard() {

    const dashboardList = document.getElementById("dashboardList");

    if (!dashboardList) return;

    const daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];
    const daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

    let gabungan = [];

    daftarTugas.forEach((item, idx) => {
        gabungan.push({
            tipe: "tugas",
            idxAsli: idx,
            judul: item.judul,
            sub: item.kategori || "Tugas",
            tanggal: item.tanggal,
            selesai: item.status === "Selesai",
            warnaStatus: item.status === "Selesai" ? "green" : (item.status === "Proses" ? "orange" : "")
        });
    });

    daftarProyek.forEach((item, idx) => {
        gabungan.push({
            tipe: "proyek",
            idxAsli: idx,
            judul: item.nama,
            sub: item.jenis ? `Proyek ${item.jenis}` : "Proyek",
            tanggal: item.deadline,
            selesai: item.status === "Selesai",
            warnaStatus: item.status === "Selesai" ? "green" : "orange"
        });
    });

    // Urutkan: yang belum selesai & deadline terdekat naik ke atas
    gabungan.sort((a, b) => {
        if (a.selesai !== b.selesai) return a.selesai ? 1 : -1;
        return waktuUrut(a.tanggal) - waktuUrut(b.tanggal);
    });

    if (gabungan.length === 0) {

        dashboardList.innerHTML = `
        <p style="text-align:center;color:gray;padding:20px;">
            Belum ada tugas atau proyek. Yuk tambahkan lewat menu Tugas / Proyek!
        </p>
        `;

    } else {

        dashboardList.innerHTML = gabungan.map(item => {

            const dl = infoDeadline(item.tanggal);

            const onToggle = item.tipe === "tugas"
                ? `toggleTugas(${item.idxAsli})`
                : `toggleProyek(${item.idxAsli})`;

            const onHapus = item.tipe === "tugas"
                ? `hapusTugas(${item.idxAsli})`
                : `hapusProyek(${item.idxAsli})`;

            return `
            <div class="task ${item.selesai ? "selesai" : ""}">

                <div class="status ${item.warnaStatus}"></div>

                <div class="task-info">
                    <h3>
                        <span class="tipe-badge ${item.tipe}">${item.tipe === "tugas" ? "Tugas" : "Proyek"}</span>
                        ${item.judul}
                    </h3>
                    <p>${item.sub}</p>
                    <p>
                        <span class="deadline-badge ${dl.kelas}">
                            <i class="fa-regular fa-calendar"></i>
                            ${formatTanggal(item.tanggal)} &middot; ${dl.label}
                        </span>
                    </p>
                </div>

                <div class="aksi-tugas">
                    <button class="check ${item.selesai ? "done" : ""}" onclick="${onToggle}" title="Tandai selesai">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="hapus-btn" onclick="${onHapus}">Hapus</button>
                </div>

            </div>
            `;

        }).join("");

    }

    const totalTask = document.getElementById("totalTask");
    const selesaiTask = document.getElementById("selesaiTask");
    const pendingTask = document.getElementById("pendingTask");

    const totalSelesai = gabungan.filter(g => g.selesai).length;

    if (totalTask) totalTask.textContent = gabungan.length;
    if (selesaiTask) selesaiTask.textContent = totalSelesai;
    if (pendingTask) pendingTask.textContent = gabungan.length - totalSelesai;

}

if (document.getElementById("dashboardList")) {
    renderDashboard();
}

// ================= Profil =================

const profilNama = document.getElementById("nama");

// Buat username default dari email (bagian sebelum @) jika user belum punya username
function buatUsernameDariEmail(email) {
    if (!email) return "";
    return email.split("@")[0];
}

if (profilNama) {

    const userLogin = JSON.parse(localStorage.getItem("userLogin"));

    if (userLogin) {

        const username = userLogin.username || buatUsernameDariEmail(userLogin.email);

        document.getElementById("nama").innerText = userLogin.nama;
        document.getElementById("username").innerText = username;
        document.getElementById("email").innerText = userLogin.email;

        document.getElementById("namaInfo").innerText = userLogin.nama;
        document.getElementById("usernameInfo").innerText = username;
        document.getElementById("emailInfo").innerText = userLogin.email;
        document.getElementById("hpInfo").innerText = userLogin.hp || "-";

        if (userLogin.foto) {
            document.getElementById("fotoProfil").src = userLogin.foto;
        }

    }

}

// ---- Ganti foto profil ----

const fotoInput = document.getElementById("fotoInput");

if (fotoInput) {

    fotoInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {

            const base64 = e.target.result;

            document.getElementById("fotoProfil").src = base64;

            let userLogin = JSON.parse(localStorage.getItem("userLogin")) || {};
            userLogin.foto = base64;
            localStorage.setItem("userLogin", JSON.stringify(userLogin));

            let users = JSON.parse(localStorage.getItem("users")) || [];
            const idx = users.findIndex(u => u.email === userLogin.email);

            if (idx !== -1) {
                users[idx].foto = base64;
                localStorage.setItem("users", JSON.stringify(users));
            }

            alert("Foto profil berhasil diperbarui!");

        };

        reader.readAsDataURL(file);

    });

}

// ---- Edit nama, username, email, no HP ----

const editBtn = document.getElementById("editBtn");

if (editBtn) {

    editBtn.addEventListener("click", () => {

        let nama = prompt("Masukkan Nama Baru", document.getElementById("nama").innerText);

        if (nama == null) return;

        let username = prompt("Masukkan Username Baru", document.getElementById("username").innerText);

        if (username == null) return;

        username = username.trim().replace(/\s+/g, "").toLowerCase();

        let email = prompt("Masukkan Email", document.getElementById("email").innerText);

        if (email == null) return;

        let hp = prompt("Masukkan Nomor HP", document.getElementById("hpInfo").innerText);

        if (hp == null) return;

        let userLogin = JSON.parse(localStorage.getItem("userLogin")) || {};
        const emailLama = userLogin.email;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const dipakaiUserLain = users.find(u => u.username === username && u.email !== emailLama);

        if (username && dipakaiUserLain) {
            alert("Username sudah digunakan, silakan pilih username lain.");
            return;
        }

        document.getElementById("nama").innerText = nama;
        document.getElementById("username").innerText = username;
        document.getElementById("email").innerText = email;

        document.getElementById("namaInfo").innerText = nama;
        document.getElementById("usernameInfo").innerText = username;
        document.getElementById("emailInfo").innerText = email;
        document.getElementById("hpInfo").innerText = hp;

        userLogin.nama = nama;
        userLogin.username = username;
        userLogin.email = email;
        userLogin.hp = hp;

        localStorage.setItem("userLogin", JSON.stringify(userLogin));

        const idx = users.findIndex(u => u.email === emailLama);

        if (idx !== -1) {
            users[idx].nama = nama;
            users[idx].username = username;
            users[idx].email = email;
            users[idx].hp = hp;
            localStorage.setItem("users", JSON.stringify(users));
        }

        alert("Profil berhasil diperbarui!");

    });

}

const logoutBtn = document.querySelector(".logout");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        let keluar = confirm("Yakin ingin keluar?");

        if (keluar) {
            window.location.href = "index.html";
        }

    });

}

// ================= USER LOGIN (welcome di dashboard) =================

const welcomeUser = document.getElementById("welcomeUser");

if (welcomeUser) {

    const user = JSON.parse(localStorage.getItem("userLogin"));

    if (user) {
        welcomeUser.textContent = `Selamat Datang, ${user.nama} 👋`;
    }

}

// ================= SEARCH (dashboard & tugas) =================

const search = document.querySelector(".search-box input");

if (search) {

    search.addEventListener("keyup", function () {

        const keyword = this.value.toLowerCase();

        document.querySelectorAll(".task").forEach(task => {
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
        refreshSemua();
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

// ================= PROYEK =================

const projectForm = document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const progressInput = document.getElementById("progressProyek");
        const jenisEl = document.getElementById("jenisProyek");
        const deadlineEl = document.getElementById("deadlineProyek");
        const penanggungEl = document.getElementById("penanggungProyek");
        const reminderEl = document.getElementById("reminderProyek");

        const proyek = {
            id: Date.now(),
            nama: document.getElementById("namaProyek").value,
            deskripsi: document.getElementById("deskripsiProyek").value,
            jenis: jenisEl ? jenisEl.value : "",
            deadline: deadlineEl ? deadlineEl.value : "",
            penanggungJawab: penanggungEl ? penanggungEl.value : "",
            progress: progressInput ? (Number(progressInput.value) || 0) : 0,
            reminder: reminderEl ? reminderEl.value : "",
            status: "Berjalan"
        };

        let daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

        daftarProyek.push(proyek);

        localStorage.setItem("proyek", JSON.stringify(daftarProyek));

        alert("Proyek berhasil ditambahkan!");

        window.location.href = "proyek.html";

    });

}

function renderProyekPage() {

    const projectList = document.getElementById("projectList");

    if (!projectList) return;

    let daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

    if (daftarProyek.length === 0) {

        projectList.innerHTML = `
        <p style="text-align:center;color:gray;padding:30px 10px;">
            Belum ada proyek. Yuk tambahkan proyek baru!
        </p>
        `;

    } else {

        projectList.innerHTML = daftarProyek.map((item, index) => {

            const selesai = item.status === "Selesai";
            const progress = item.progress || 0;
            const dl = infoDeadline(item.deadline);

            return `
            <div class="task ${selesai ? "selesai" : ""}">

                <div class="status ${selesai ? "green" : "orange"}"></div>

                <div class="task-info">
                    <h3>${item.nama}</h3>
                    <span class="tag-pill"><i class="fa-solid fa-people-group"></i> ${item.jenis || "-"}</span>
                    ${item.penanggungJawab ? `<p><i class="fa-solid fa-user"></i> ${item.penanggungJawab}</p>` : ""}
                    <p>
                        <span class="deadline-badge ${dl.kelas}">
                            <i class="fa-regular fa-calendar"></i>
                            ${formatTanggal(item.deadline)} &middot; ${dl.label}
                        </span>
                    </p>
                    <div class="progress">
                        <div class="progress-fill" style="width:${progress}%"></div>
                    </div>
                    <p style="margin-top:6px;font-size:11px;">Progress ${progress}%</p>
                </div>

                <div class="aksi-tugas">
                    <button class="check ${selesai ? "done" : ""}" onclick="toggleProyek(${index})" title="Tandai selesai">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="hapus-btn" onclick="hapusProyek(${index})">Hapus</button>
                </div>

            </div>
            `;

        }).join("");

    }

    const totalProyek = document.getElementById("totalProyek");
    const selesaiProyek = document.getElementById("selesaiProyek");
    const berjalanProyek = document.getElementById("berjalanProyek");

    const jumlahSelesai = daftarProyek.filter(p => p.status === "Selesai").length;

    if (totalProyek) totalProyek.textContent = daftarProyek.length;
    if (selesaiProyek) selesaiProyek.textContent = jumlahSelesai;
    if (berjalanProyek) berjalanProyek.textContent = daftarProyek.length - jumlahSelesai;

}

function toggleProyek(index) {

    let daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

    const item = daftarProyek[index];

    if (!item) return;

    item.status = item.status === "Selesai" ? "Berjalan" : "Selesai";

    daftarProyek[index] = item;

    localStorage.setItem("proyek", JSON.stringify(daftarProyek));

    refreshSemua();

}

function hapusProyek(index) {

    if (confirm("Yakin ingin menghapus proyek ini?")) {

        let daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

        daftarProyek.splice(index, 1);

        localStorage.setItem("proyek", JSON.stringify(daftarProyek));

        refreshSemua();

    }

}

if (document.getElementById("projectList")) {
    renderProyekPage();
}

// ================= DARK MODE (global) =================

const darkModeToggle = document.getElementById("darkModeToggle");

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

// ================= CALENDAR (terhubung ke deadline tugas & proyek) =================

document.addEventListener("DOMContentLoaded", function () {

    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) return;

    let catatanManual = JSON.parse(localStorage.getItem("calendarEvents")) || [];
    const daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];
    const daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];

    function bangunEvents() {

        let events = [];

        catatanManual.forEach(ev => {
            events.push({
                title: ev.title,
                start: ev.start,
                color: "#2ecc71",
                extendedProps: { manual: true }
            });
        });

        daftarTugas.forEach(t => {
            if (t.tanggal) {
                events.push({
                    title: `📌 ${t.judul}`,
                    start: t.tanggal,
                    color: "#6C63FF",
                    extendedProps: { manual: false, jenis: "Tugas" }
                });
            }
        });

        daftarProyek.forEach(p => {
            if (p.deadline) {
                events.push({
                    title: `📁 ${p.nama}`,
                    start: p.deadline,
                    color: "#f39c12",
                    extendedProps: { manual: false, jenis: "Proyek" }
                });
            }
        });

        return events;

    }

    const calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: "dayGridMonth",
        locale: "id",

        height: "auto",
        contentHeight: "auto",
        expandRows: true,

        headerToolbar: {
            left: "prev,next",
            center: "title",
            right: "today"
        },

        dayHeaderContent: function (arg) {

            const hari = {
                Sun: "M", Mon: "S", Tue: "S", Wed: "R", Thu: "K", Fri: "J", Sat: "S"
            };

            return hari[arg.text] || arg.text;

        },

        events: bangunEvents(),

        dateClick: function (info) {

            let note = prompt("Masukkan catatan / deadline manual untuk tanggal ini");

            if (note) {

                let event = { title: note, start: info.dateStr };

                catatanManual.push(event);

                localStorage.setItem("calendarEvents", JSON.stringify(catatanManual));

                calendar.addEvent({
                    title: event.title,
                    start: event.start,
                    color: "#2ecc71",
                    extendedProps: { manual: true }
                });

            }

        },

        eventClick: function (info) {

            if (!info.event.extendedProps.manual) {
                alert(`${info.event.extendedProps.jenis || "Deadline"} ini otomatis muncul dari halaman ${info.event.extendedProps.jenis === "Proyek" ? "Proyek" : "Tugas"}. Untuk mengubahnya, edit langsung di halaman tersebut.`);
                return;
            }

            if (confirm("Hapus catatan ini?")) {

                info.event.remove();

                catatanManual = catatanManual.filter(e =>
                    !(e.title === info.event.title && e.start === info.event.startStr)
                );

                localStorage.setItem("calendarEvents", JSON.stringify(catatanManual));

            }

        }

    });

    calendar.render();

});

// ================= REMINDER & NOTIFIKASI DEADLINE =================
// Opsional: memakai Notification API browser. Jika tidak didukung / tidak diizinkan,
// akan gagal secara diam-diam tanpa mengganggu fitur lain.

const OFFSET_REMINDER = {
    "30menit": 30 * 60 * 1000,
    "1jam": 1 * 60 * 60 * 1000,
    "3jam": 3 * 60 * 60 * 1000,
    "12jam": 12 * 60 * 60 * 1000,
    "1hari": 24 * 60 * 60 * 1000,
    "2hari": 48 * 60 * 60 * 1000
};

function kirimNotifikasi(judul, isi) {

    try {

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(judul, { body: isi, icon: "https://cdn-icons-png.flaticon.com/512/906/906334.png" });
        } else {
            console.log(`[Reminder] ${judul} - ${isi}`);
        }

    } catch (err) {
        console.log("Notifikasi tidak tersedia:", err);
    }

}

function cekReminderDeadline() {

    try {

        const daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];
        const daftarProyek = JSON.parse(localStorage.getItem("proyek")) || [];
        let sudahDikirim = JSON.parse(localStorage.getItem("reminderTerkirim")) || [];

        const sekarang = new Date();

        function proses(list, ambilJudul, ambilTanggal, ambilStatus, keyPrefix) {

            list.forEach((item, idx) => {

                const tanggal = ambilTanggal(item);
                const reminder = item.reminder;
                const status = ambilStatus(item);

                if (!tanggal || !reminder || reminder === "tidak" || reminder === "" || status === "Selesai") return;

                const offset = OFFSET_REMINDER[reminder];

                if (!offset) return;

                // Anggap deadline jatuh tempo di akhir hari (23:59) pada tanggal yang dipilih
                const batasWaktu = new Date(tanggal + "T23:59:59");
                const waktuIngatkan = new Date(batasWaktu.getTime() - offset);

                const kunci = `${keyPrefix}-${idx}-${reminder}-${tanggal}`;

                if (sekarang >= waktuIngatkan && sekarang < batasWaktu && !sudahDikirim.includes(kunci)) {

                    kirimNotifikasi(
                        "⏰ Pengingat Deadline TaskFlow",
                        `${ambilJudul(item)} akan jatuh tempo pada ${formatTanggal(tanggal)}.`
                    );

                    sudahDikirim.push(kunci);

                }

            });

        }

        proses(daftarTugas, t => t.judul, t => t.tanggal, t => t.status, "tugas");
        proses(daftarProyek, p => p.nama, p => p.deadline, p => p.status, "proyek");

        localStorage.setItem("reminderTerkirim", JSON.stringify(sudahDikirim));

    } catch (err) {
        console.log("Gagal memeriksa reminder:", err);
    }

}

if ("Notification" in window && Notification.permission === "default") {
    try { Notification.requestPermission(); } catch (err) {}
}

// Cek langsung saat halaman dibuka, lalu ulangi tiap menit
cekReminderDeadline();
setInterval(cekReminderDeadline, 60 * 1000);