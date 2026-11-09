// Menentukan nama tempat data disimpan di local storage
const KUNCI_STORAGE = 'E_REPORT_DATA';

// variabel global untuk menyimpan data laporan
let daftarLaporan = [];

// warna kategori 
const warnaKategori = {
    'AC': 'cat-yellow',
    'Komputer': 'cat-blue',
    'Furnitur': 'cat-green',
    'Kelistrikan': 'cat-yellow',
    'Sanitasi': 'cat-blue',
    'Lainnya': 'cat-pink'
};

const warnaAvatar = ['av-pink', 'av-yellow', 'av-blue', 'av-green'];

// dijalankan setelah halaman html selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    muatData();

    const form = document.getElementById('facility-report-form');
    if (form) form.addEventListener('submit', handelFormSubmit);
});

//mengambil data dari data.js
function muatData() {
    // UBAH: cek localStorage dulu
    const dataTersimpan = localStorage.getItem(KUNCI_STORAGE);

    if (dataTersimpan) {
        // kalau ada data di localStorage, pakai itu
        daftarLaporan = JSON.parse(dataTersimpan);
    } else {
        // kalau belum ada, pakai data awal dari data.js lalu simpan
        daftarLaporan = typeof dataAwalLaporan !== 'undefined' ? [...dataAwalLaporan] : [];
        simpanData();
    }
    // console.log(daftarLaporan);
    tampilkanDataTabel();
}

// menampilkan data ke halaman web 
function tampilkanDataTabel() {
    const tabelBody = document.getElementById('reports-table-body');
    if (!tabelBody) return;

    // memastikan tabel body kosong 
    tabelBody.innerHTML = '';

    // menampilkan baris data 
    daftarLaporan.forEach((laporan, index) => {
        tabelBody.appendChild(buatBarisLaporan(laporan, index));
    });
}

// membuat satu baris <tr> utnuk satu laporan
// UBAH: tambah parameter index
function buatBarisLaporan(laporan, index) {
    // membuat tr baru
    const baris = document.createElement('tr');

    // cek apakah laporan sudah selesai
    const selesai = laporan.status === 'Selesai';
    if (selesai) baris.classList.add('done');

    // byat warna, kategori, & inisial
    const kelasKategori = warnaKategori[laporan.kategori] || 'cat-pink';
    const kelasAvatar = warnaAvatar[index % warnaAvatar.length];
    const avatar = laporan.avatar || laporan.pelapor.substring(0, 2).toUpperCase();

    baris.innerHTML = `
            <td>
            <div class="person"><span class="avatar ${kelasAvatar}">${avatar}</span>
            <div><strong>${laporan.pelapor}</strong><small>X RPL</small></div></div>
            </td> 
            
            <td>
            <span class="cat ${kelasKategori}">${laporan.kategori}</span>
            </td>
            
            <td>
            <p class="desc">${laporan.deskripsi}</p>
            </td>

            <td>
            <span class="status ${selesai ? 'ok' : 'wait'}">${laporan.status}</span>
            </td>

            <td>
            <a class="act ok" onclick="ubahStatus('${laporan.id}', 'Selesai')">Selesai</a>
            <a class="act cancel" onclick="ubahStatus('${laporan.id}', 'Menunggu')">Batal</a>
            <a class="act del" onclick="hapusLaporan('${laporan.id}')">Hapus</a>
            </td>
            `
            return baris;
}

// 3. create => menambahkan data laporan baru
function handelFormSubmit(event) {

    event.preventDefault(); //mencegah halaman refresh
    // mengambil isi form 
    const form = event.target
    const nama = form.reporter.value.trim();
    const kategori = form.category.value;
    const deskripsi = form.description.value.trim();

    // pengecekan value (validasi) => mengecek apakah smeua input terisi
   if(!nama || !kategori || !deskripsi) {
        return fireSwal({
            icon: 'warning',
            title: 'Data belum lengkap',
            text: 'Mohon isi nama pelapor, kategori, dan deskripsi kerusakan.',
            confirmButtonText: 'Oke',
            confirmButtonColor: '#c9619a'
        });
   }
    // membuat objek laporan baru
    const laporanBaru = {
        id: `rep-${Date.now()}`, //id unik berdasarkan waktu saat ini
        pelapor: nama,
        avatar: nama.substring(0, 2).toUpperCase(), //inisial dari nama
        kategori: kategori, 
        deskripsi: deskripsi,
        status: 'Menunggu'
    };
    // menambahkan laporan baru ke data lama 
    daftarLaporan.unshift(laporanBaru);
    // menyimpan ke dalam local storage 
    simpanData();

    // mengosongkan form
    form.reset();

    // sweet alert!
    fireSwal({
        icon: 'success',
        title: 'Laporan berhasil dikirim!',
        text: 'Laporan kamu sudah masuk ke dashboard dan sedang menunggu diproses.',
        confirmButtonText: 'Lihat Dashboard',
        confirmButtonColor: '#c9619a',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        window.location.href = 'dashboard.html';
    });
}
function fireSwal(opsi) {
    if (typeof Swal === 'undefined') {
        alert(opsi.title);
        return Promise.resolve();
    }
    return Swal.fire(opsi);
}

// mengubah status laporan
function ubahStatus(id, statusBaru) {
    const laporan = daftarLaporan.find((item) => item.id === id);
    if (laporan) {
        laporan.status = statusBaru;
        simpanData();          // simpan perubahan
        tampilkanDataTabel();  // tampilkan ulang tabel
    }
}

// untk menghapus lporan
function hapusLaporan(id) {
    daftarLaporan = daftarLaporan.filter((item) => item.id !== id);
    simpanData();
    tampilkanDataTabel();
}

// proses menyimpan data ke local storage 
function simpanData(){
localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarLaporan));
}