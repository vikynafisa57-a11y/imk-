// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        alert("Login Berhasil!");
        window.location.href = "dashboard.html";
    });
}

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

const editBtn = document.getElementById("editBtn");

if (editBtn) {

    editBtn.addEventListener("click", function () {

        let daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

        let index = localStorage.getItem("detailIndex");

        let tugas = daftarTugas[index];

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

        const semuaTask = document.querySelectorAll(".task");

        semuaTask.forEach(task => {

            if (task.innerText.toLowerCase().includes(keyword)) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }

        });

    });

}