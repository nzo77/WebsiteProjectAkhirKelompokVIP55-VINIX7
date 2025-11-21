// Inisialisasi data jika belum ada
function initializeData() {
    // Cek dan migrate data lama ke struktur baru
    const oldData = localStorage.getItem('mahasiswaData');
    if (oldData) {
        const data = JSON.parse(oldData);
        // Jika data masih pakai nim, convert ke universitas
        const needsMigration = data.length > 0 && data[0].nim;
        
        if (needsMigration) {
            const migratedData = data.map(item => ({
                universitas: item.universitas || 'universitas',
                nama: item.nama,
                prodi: item.prodi,
                semester: item.semester,
                status: item.status
            }));
            localStorage.setItem('mahasiswaData', JSON.stringify(migratedData));
            console.log('Data migrated from nim to universitas');
        }
    } else {
        // Data baru
        const initialData = [
            { 
                universitas: 'Universitas Indonesia', 
                nama: 'Ahmad Fauzi', 
                prodi: 'Sistem Informasi', 
                semester: '5', 
                status: 'Aktif' 
            },
            { 
                universitas: 'Institut Teknologi Bandung', 
                nama: 'Siti Rahma', 
                prodi: 'Teknik Informatika', 
                semester: '6', 
                status: 'Aktif' 
            },
            { 
                universitas: 'Universitas Gadjah Mada', 
                nama: 'Budi Santoso', 
                prodi: 'Manajemen Informatika', 
                semester: '4', 
                status: 'Non-Aktif' 
            }
        ];
        localStorage.setItem('mahasiswaData', JSON.stringify(initialData));
    }
    
    // Inisialisasi data lainnya...
    if (!localStorage.getItem('pendaftaranData')) {
        localStorage.setItem('pendaftaranData', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('upgradeData')) {
        localStorage.setItem('upgradeData', JSON.stringify([]));
    }
}

// User Authentication State Management
const AuthManager = {
    // Check if user is logged in
    isLoggedIn: function() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // Get user data
    getUserData: function() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    // Login function
    login: function(userData) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        this.updateUI();
        this.updateMenuAccess();
    },

    // Logout function
    logout: function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        this.updateUI();
        this.updateMenuAccess();
        showPage('dashboard');
        alert('Anda telah logout dari sistem.');
    },

    // Update UI based on login state
    updateUI: function() {
        const loggedOutSection = document.querySelector('.auth-buttons-logged-out');
        const loggedInSection = document.querySelector('.auth-buttons-logged-in');
        const usernameDisplay = document.getElementById('usernameDisplay');
        const userAvatar = document.getElementById('userAvatar');

        if (this.isLoggedIn()) {
            const userData = this.getUserData();
            
            // Show logged in section, hide logged out section
            if (loggedOutSection) loggedOutSection.style.display = 'none';
            if (loggedInSection) loggedInSection.style.display = 'flex';
            
            // Update user info
            if (usernameDisplay && userData) {
                usernameDisplay.textContent = userData.username || 'User';
            }
            if (userAvatar && userData && userData.avatar) {
                userAvatar.src = userData.avatar;
            }
        } else {
            // Show logged out section, hide logged in section
            if (loggedOutSection) loggedOutSection.style.display = 'flex';
            if (loggedInSection) loggedInSection.style.display = 'none';
        }
    },

    // Update menu access based on login status
    updateMenuAccess: function() {
        const protectedMenus = document.querySelectorAll('.nav-link[data-page]:not([data-page="dashboard"])');
        
        if (this.isLoggedIn()) {
            // User is logged in - enable all menus
            protectedMenus.forEach(menu => {
                menu.style.opacity = '1';
                menu.style.cursor = 'pointer';
                menu.classList.remove('locked');
            });
        } else {
            // User is not logged in - disable protected menus
            protectedMenus.forEach(menu => {
                menu.style.opacity = '0.6';
                menu.style.cursor = 'not-allowed';
                menu.classList.add('locked');
            });
        }
    },

    // Initialize auth state
    init: function() {
        this.updateUI();
        this.updateMenuAccess();
        
        // Add event listener for logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
};

// Sample login function (untuk testing)
function simulateLogin() {
    const userData = {
        username: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3498db&color=fff&size=128',
        email: 'john.doe@example.com'
    };
    AuthManager.login(userData);
}

// Sample logout function (untuk testing)
function simulateLogout() {
    AuthManager.logout();
}

// Fungsi untuk menampilkan halaman tertentu
function showPage(pageId) {
    // Sembunyikan semua halaman
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update judul halaman
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = getPageTitle(pageId);
    }
}

// Fungsi untuk mendapatkan judul halaman
function getPageTitle(pageId) {
    const titles = {
        'dashboard': 'Dashboard',
        'pendaftaran-mbkm': 'Pendaftaran MBKM',
        'upgrade-paket': 'Upgrade Paket MBKM',
        'masterdata': 'Master Data',
        'laporan': 'Laporan',
        'logout': 'Logout'
    };
    return titles[pageId] || 'Dashboard';
}

// File Upload Functionality dengan Delete
function initFileUpload() {
    const fileInput = document.getElementById('bukti_pembayaran');
    const uploadArea = document.getElementById('uploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const deleteBtn = document.getElementById('deleteBtn');
    const uploadBtn = uploadArea?.querySelector('.upload-btn');

    if (!fileInput || !uploadArea) return;

    // Click event untuk upload area
    uploadArea.addEventListener('click', function(e) {
        if (!e.target.closest('.delete-btn')) {
            fileInput.click();
        }
    });

    // Click event untuk upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            fileInput.click();
        });
    }

    // Delete button event
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteFile();
        });
    }

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    // File input change event
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        // Validate file type
        if (file.type !== 'application/pdf') {
            showError('Hanya file PDF yang diizinkan');
            resetFileInput();
            return;
        }

        // Validate file size (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showError('File terlalu besar. Maksimal 10 MB');
            resetFileInput();
            return;
        }

        // Display file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.classList.add('show');
        uploadArea.classList.add('success');
        
        // Clear any previous errors
        hideError();
    }

    function deleteFile() {
        // Reset file input
        fileInput.value = '';
        
        // Reset display
        fileInfo.classList.remove('show');
        uploadArea.classList.remove('success');
        fileName.textContent = 'Belum ada file dipilih';
        fileSize.textContent = '-';
        
        // Clear any errors
        hideError();
        
        // Optional: Show confirmation message
        showTempMessage('File berhasil dihapus', 'success');
    }

    function showError(message) {
        let errorElement = document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            uploadArea.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // Reset display
        fileInfo.classList.remove('show');
        uploadArea.classList.remove('success');
    }

    function hideError() {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    function resetFileInput() {
        fileInput.value = '';
        fileInfo.classList.remove('show');
        uploadArea.classList.remove('success');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Fungsi untuk menampilkan pesan sementara
    function showTempMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `temp-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            messageElement.style.background = '#27ae60';
        } else if (type === 'error') {
            messageElement.style.background = '#e74c3c';
        } else {
            messageElement.style.background = '#3498db';
        }
        
        document.body.appendChild(messageElement);
        
        // Hapus pesan setelah 3 detik
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// Load Mahasiswa Data
function loadMahasiswaData() {
    const data = JSON.parse(localStorage.getItem('mahasiswaData') || '[]');
    const tableBody = document.getElementById('mahasiswaTableBody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.universitas || 'Data tidak tersedia'}</td>
                <td>${item.nama || '-'}</td>
                <td>${item.prodi || '-'}</td>
                <td>${item.semester || '-'}</td>
                <td><span class="status-badge ${item.status === 'Aktif' ? 'active' : 'inactive'}">${item.status || '-'}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const pendaftaranData = JSON.parse(localStorage.getItem('pendaftaranData') || '[]');
    const mahasiswaData = JSON.parse(localStorage.getItem('mahasiswaData') || '[]');
    
    // Calculate pendaftaran minggu ini
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const pendaftaranMingguIni = pendaftaranData.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= oneWeekAgo;
    }).length;
    
    // Update card numbers
    const cards = document.querySelectorAll('.card .number');
    if (cards.length >= 3) {
        // Program MBKM Aktif
        cards[0].textContent = '5'; // Hardcoded for demo
        
        // Mahasiswa Terdaftar
        cards[1].textContent = mahasiswaData.length;
        
        // Pendaftaran Baru
        cards[2].textContent = pendaftaranMingguIni;
    }
}

// Sidebar functionality
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    if (!sidebar || !toggleSidebar) return;

    // Toggle sidebar on button click
    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.add('active');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close sidebar on close button click
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeSidebarFunc);
    }

    // Close sidebar on overlay click
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebarFunc);
    }

    function closeSidebarFunc() {
        sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close sidebar when clicking on nav links (mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebarFunc();
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebarFunc();
        }
    });
}

// WhatsApp widget functionality
function initWhatsAppWidget() {
    const whatsappButton = document.getElementById('whatsappButton');
    const whatsappPopup = document.getElementById('whatsappPopup');
    const closePopup = document.getElementById('closePopup');

    if (!whatsappButton || !whatsappPopup) return;

    // Toggle popup
    whatsappButton.addEventListener('click', function() {
        whatsappPopup.classList.toggle('active');
    });

    // Close popup
    if (closePopup) {
        closePopup.addEventListener('click', function() {
            whatsappPopup.classList.remove('active');
        });
    }

    // Close WhatsApp popup when clicking outside
    document.addEventListener('click', function(e) {
        if (whatsappPopup && whatsappPopup.classList.contains('active')) {
            if (!whatsappPopup.contains(e.target) && !whatsappButton.contains(e.target)) {
                whatsappPopup.classList.remove('active');
            }
        }
    });
}

// Main DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    AuthManager.init();
    
    // Initialize all components
    initSidebar();
    initFileUpload();
    initWhatsAppWidget();
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            
            // Check if menu is locked (not logged in)
            if (this.classList.contains('locked') && pageId !== 'dashboard') {
                alert('Silakan login terlebih dahulu untuk mengakses menu ini!');
                return;
            }
            
            // Jika bukan logout, tampilkan halaman
            if (pageId !== 'logout') {
                showPage(pageId);
                
                // Update menu aktif
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            } else {
                // Untuk logout, langsung tampilkan halaman logout
                showPage('logout');
            }
        });
    });
    
    // Pendaftaran Form
    const pendaftaranForm = document.getElementById('pendaftaranForm');
    if (pendaftaranForm) {
        pendaftaranForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nama: formData.get('nama') || '',
                universitas: formData.get('universitas') || '',
                prodi: formData.get('prodi') || '',
                semester: formData.get('semester') || '',
                email: formData.get('email') || '',
                no_hp: formData.get('no_hp') || '',
                jenis_mbkm: formData.get('jenis_mbkm') || '',
                dosen_pembimbing: formData.get('dosen_pembimbing') || '',
                alasan: formData.get('alasan') || '',
                timestamp: new Date().toISOString(),
                id: 'PD' + Date.now()
            };
            
            // Validasi required fields
            if (!data.universitas) {
                alert('Universitas harus diisi!');
                return;
            }

            // Save to localStorage
            const existingData = JSON.parse(localStorage.getItem('pendaftaranData') || '[]');
            existingData.push(data);
            localStorage.setItem('pendaftaranData', JSON.stringify(existingData));

            // Reset form
            this.reset();
            
            // Show success message
            alert('Pendaftaran berhasil disimpan!');
            updateDashboardStats();
        });
    }
    
    // Upgrade Form
    const upgradeForm = document.getElementById('upgradeForm');
    if (upgradeForm) {
        upgradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value || '';
            });
            
            // Add timestamp
            data.timestamp = new Date().toISOString();
            data.id = 'UP' + Date.now();
            
            // Save to localStorage
            const existingData = JSON.parse(localStorage.getItem('upgradeData') || '[]');
            existingData.push(data);
            localStorage.setItem('upgradeData', JSON.stringify(existingData));
            
            // Reset form
            this.reset();
            
            // Show success message
            alert('Permintaan upgrade berhasil diajukan!');
        });
    }
    
    // Logout functionality
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');
    
    if (confirmLogout) {
        confirmLogout.addEventListener('click', function() {
            AuthManager.logout();
        });
    }
    
    if (cancelLogout) {
        cancelLogout.addEventListener('click', function() {
            // Navigate back to dashboard
            showPage('dashboard');
            navLinks.forEach(nav => nav.classList.remove('active'));
            document.querySelector('.nav-link[data-page="dashboard"]').classList.add('active');
        });
    }
    
    // Laporan functionality
    const generateLaporan = document.getElementById('generateLaporan');
    const lihatProgress = document.getElementById('lihatProgress');
    
    if (generateLaporan) {
        generateLaporan.addEventListener('click', function() {
            const pendaftaranData = JSON.parse(localStorage.getItem('pendaftaranData') || '[]');
            const mahasiswaData = JSON.parse(localStorage.getItem('mahasiswaData') || '[]');
            
            alert(`Laporan berhasil digenerate!\n\nTotal Pendaftar: ${pendaftaranData.length}\nTotal Mahasiswa: ${mahasiswaData.length}`);
        });
    }
    
    if (lihatProgress) {
        lihatProgress.addEventListener('click', function() {
            alert('Fitur lihat progress akan segera tersedia.');
        });
    }
    
    // Initialize dashboard
    showPage('dashboard');
    updateDashboardStats();
    
    // Load master data if on masterdata page
    if (document.getElementById('masterdata')?.classList.contains('active')) {
        loadMahasiswaData();
    }
});

// Global functions for testing
window.simulateLogin = simulateLogin;
window.simulateLogout = simulateLogout;

// Fungsi untuk handle login
function handleLogin(email, password) {
    // Validasi credentials (dalam implementasi real, ini akan request ke server)
    const validAccounts = {
        'admin@vinix7.com': { password: 'admin123', username: 'Admin Vinix7', role: 'Administrator' },
        'mahasiswa@example.com': { password: 'mahasiswa123', username: 'John Doe', role: 'Mahasiswa' },
        'dosen@example.com': { password: 'dosen123', username: 'Dr. Smith', role: 'Dosen' }
    };

    if (validAccounts[email] && validAccounts[email].password === password) {
        const userData = {
            username: validAccounts[email].username,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(validAccounts[email].username)}&background=3498db&color=fff&size=128`,
            role: validAccounts[email].role
        };
        
        AuthManager.login(userData);
        return true;
    }
    
    return false;
}

// Fungsi untuk check login status dan redirect
function checkLoginStatus() {
    if (AuthManager.isLoggedIn()) {
        // User sudah login, redirect ke index.html jika di login page
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // User belum login, redirect ke login.html jika mencoba akses halaman terproteksi
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('register.html')) {
            // window.location.href = 'login.html'; // Uncomment jika ingin auto-redirect
        }
    }
}