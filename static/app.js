// TypoDetector JavaScript Functions
let currentInputMethod = 'file';
let selectedFile = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');

    // Click to upload
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File selection
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Auto-resize textarea
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    selectedFile = file;
    
    // Validasi file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showAlert(
            'File Terlalu Besar', 
            `Ukuran file ${formatFileSize(file.size)} melebihi batas maksimal 10MB.`, 
            'warning'
        );
        return;
    }
    
    // Validasi format
    const allowedFormats = ['.txt', '.docx', '.pdf'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedFormats.includes(fileExtension)) {
        showAlert(
            'Format File Tidak Didukung', 
            `Format ${fileExtension.toUpperCase()} tidak didukung.`, 
            'warning',
            'Gunakan file dengan format TXT, DOCX, atau PDF'
        );
        return;
    }
    
    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').classList.remove('hidden');
    
    showSuccessToast(`File ${file.name} berhasil dipilih`);
}

function removeFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('fileUploadArea').classList.remove('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function toggleInputMethod() {
    const textSection = document.getElementById('textInputSection');
    const toggleBtn = document.getElementById('toggleInput');
    const fileSection = document.querySelector('.file-upload-section');
    
    if (currentInputMethod === 'file') {
        currentInputMethod = 'text';
        textSection.classList.remove('hidden');
        fileSection.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-file-upload"></i> Upload File';
    } else {
        currentInputMethod = 'file';
        textSection.classList.add('hidden');
        fileSection.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-keyboard"></i> Ketik Manual';
    }
}

async function checkTypo() {
    let textToCheck = '';
    
    if (currentInputMethod === 'file') {
        if (!selectedFile) {
            showAlert('File Tidak Dipilih', 'Silakan pilih file terlebih dahulu!', 'warning');
            return;
        }
        
        // Upload dan baca file
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            // Show loading
            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('resultsSection').classList.add('hidden');
            
            const response = await fetch('/upload_file', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            document.getElementById('loading').classList.add('hidden');
            
            if (response.ok) {
                displayResults(data);
                showSuccessToast(`File ${data.file_type} berhasil diproses!`);
            } else {
                // Handle error dengan custom alert
                showAlert(
                    'Error Memproses File', 
                    data.error, 
                    'error', 
                    data.suggestion || null
                );
            }
            return;
            
        } catch (error) {
            document.getElementById('loading').classList.add('hidden');
            showAlert(
                'Kesalahan Koneksi', 
                'Terjadi kesalahan saat memproses file. Silakan coba lagi.', 
                'error'
            );
            console.error('Error:', error);
            return;
        }
    } else {
        const textInput = document.getElementById('textInput');
        textToCheck = textInput.value.trim();
        
        if (!textToCheck) {
            showAlert('Teks Kosong', 'Silakan masukkan teks terlebih dahulu!', 'warning');
            return;
        }
    }

    // Proses teks manual
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');

    try {
        const response = await fetch('/check_typo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: textToCheck })
        });

        const data = await response.json();
        document.getElementById('loading').classList.add('hidden');
        
        if (response.ok) {
            displayResults(data);
            if (data.total_typos > 0) {
                showSuccessToast(`Ditemukan ${data.total_typos} potensi typo`);
            } else {
                showSuccessToast('Tidak ada typo yang terdeteksi!');
            }
        } else {
            showAlert('Error Pemeriksaan', data.error, 'error');
        }
    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        showAlert(
            'Kesalahan Koneksi', 
            'Terjadi kesalahan saat memeriksa typo. Silakan coba lagi.', 
            'error'
        );
        console.error('Error:', error);
    }
}

function displayResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    if (data.total_typos === 0) {
        resultsContent.innerHTML = `
            <div class="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                <i class="fas fa-check-circle text-5xl text-green-600 mb-4"></i>
                <h3 class="text-xl font-semibold text-green-800 mb-2">Selamat!</h3>
                <p class="text-green-700">Tidak ada typo yang terdeteksi dalam ${currentInputMethod === 'file' ? 'file' : 'teks'} Anda!</p>
            </div>
        `;
    } else {
        let html = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex items-center gap-2">
                    <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                    <p class="text-yellow-800 font-medium">${data.message}</p>
                </div>
            </div>
            <div class="space-y-4">
        `;
        
        data.typos.forEach(typo => {
            html += `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3 mb-3">
                            <i class="fas fa-times-circle text-red-500 text-lg"></i>
                            <strong class="text-red-800 text-lg">"${typo.word}"</strong>
                        </div>
                    </div>
                    <div class="ml-8">
                        ${typo.suggestions.length > 0 ? 
                            `<span class="text-gray-700 font-medium">Saran: </span>
                             <div class="flex flex-wrap gap-2 mt-2">
                                ${typo.suggestions.map(s => 
                                    `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors text-sm" onclick="replaceSuggestion('${typo.word}', '${s}')">${s}</span>`
                                ).join('')}
                             </div>` : 
                            '<span class="text-gray-500 italic">Tidak ada saran tersedia</span>'
                        }
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        resultsContent.innerHTML = html;
    }
    
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function replaceSuggestion(oldWord, newWord) {
    if (currentInputMethod === 'text') {
        const textInput = document.getElementById('textInput');
        const regex = new RegExp('\\b' + oldWord + '\\b', 'gi');
        textInput.value = textInput.value.replace(regex, newWord);
        alert(`Kata "${oldWord}" telah diganti dengan "${newWord}"`);
    } else {
        alert('Untuk mengganti kata, silakan gunakan mode input teks manual.');
    }
}

function clearAll() {
    // Clear file
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    
    // Clear text
    document.getElementById('textInput').value = '';
    
    // Hide results
    document.getElementById('resultsSection').classList.add('hidden');
    
    showSuccessToast('Semua data berhasil dihapus');
}

// Custom Alert Functions
function showAlert(title, message, type = 'info', suggestion = null) {
    const alertModal = document.getElementById('customAlert');
    const alertIcon = document.getElementById('alertIcon');
    const alertIconClass = document.getElementById('alertIconClass');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertSuggestion = document.getElementById('alertSuggestion');
    const alertSuggestionText = document.getElementById('alertSuggestionText');
    
    // Set content
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    
    // Set icon and colors based on type
    switch(type) {
        case 'error':
            alertIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-red-100';
            alertIconClass.className = 'fas fa-exclamation-triangle text-2xl text-red-600';
            break;
        case 'success':
            alertIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-green-100';
            alertIconClass.className = 'fas fa-check-circle text-2xl text-green-600';
            break;
        case 'warning':
            alertIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100';
            alertIconClass.className = 'fas fa-exclamation-circle text-2xl text-yellow-600';
            break;
        default: // info
            alertIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-blue-100';
            alertIconClass.className = 'fas fa-info-circle text-2xl text-blue-600';
    }
    
    // Show/hide suggestion
    if (suggestion) {
        alertSuggestionText.textContent = suggestion;
        alertSuggestion.classList.remove('hidden');
    } else {
        alertSuggestion.classList.add('hidden');
    }
    
    // Show modal with animation
    alertModal.classList.remove('hidden');
    setTimeout(() => {
        alertModal.querySelector('.transform').classList.remove('scale-95');
        alertModal.querySelector('.transform').classList.add('scale-100');
    }, 10);
}

function closeAlert() {
    const alertModal = document.getElementById('customAlert');
    const modalContent = alertModal.querySelector('.transform');
    
    // Hide with animation
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    
    setTimeout(() => {
        alertModal.classList.add('hidden');
    }, 300);
}

function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    const successMessage = document.getElementById('successMessage');
    
    successMessage.textContent = message;
    
    // Show toast
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
        toast.classList.add('translate-x-0');
    }, 10);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Close modal when clicking outside
document.getElementById('customAlert').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAlert();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAlert();
    }
});