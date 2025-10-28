// گلوبل ویری ایبلز
let currentFile = null;

// ڈاکیومنٹ لوڈ ہونے پر
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const loading = document.getElementById('loading');

    // ایونٹ لسٹنرز سیٹ کریں
    setupEventListeners();

    function setupEventListeners() {
        // فائل انپٹ پر تبدیلی
        fileInput.addEventListener('change', handleFileSelect);
        
        // اپلوڈ ایریا پر کلک
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // پروسس بٹن
        processBtn.addEventListener('click', processImage);
        
        // ڈاؤنلوڈ بٹن
        downloadBtn.addEventListener('click', downloadImage);
        
        // ری سیٹ بٹن
        resetBtn.addEventListener('click', resetApp);
        
        // ڈریگ اینڈ ڈراپ ایونٹس
        setupDragAndDrop();
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            validateAndLoadFile(file);
        }
    }

    function validateAndLoadFile(file) {
        // فائل ٹائپ چیک کریں
        if (!file.type.startsWith('image/')) {
            showError('براہ کرم صرف امیج فائلز اپلوڈ کریں (JPEG, PNG, JPG)');
            return;
        }

        // فائل سائز چیک کریں (16MB)
        if (file.size > 16 * 1024 * 1024) {
            showError('فائل کا سائز 16MB سے کم ہونا چاہیے');
            return;
        }

        currentFile = file;
        displayPreview(file);
    }

    function displayPreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const originalPreview = document.getElementById('originalPreview');
            originalPreview.src = e.target.result;
            
            // پیش نظارہ سیکشن دکھائیں
            previewSection.style.display = 'block';
            
            // ری سیٹ کریں
            document.getElementById('resultPreview').style.display = 'none';
            document.getElementById('resultPlaceholder').style.display = 'block';
            downloadBtn.style.display = 'none';
            
            // اسکرول کو پیش نظارہ پر لے جائیں
            previewSection.scrollIntoView({ behavior: 'smooth' });
        };
        
        reader.readAsDataURL(file);
    }

    async function processImage() {
        if (!currentFile) {
            showError('براہ کرم پہلے ایک امیج اپلوڈ کریں');
            return;
        }

        // لوڈنگ دکھائیں
        loading.style.display = 'block';
        processBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('image', currentFile);

            const response = await fetch('/remove-background', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'پروسسنگ ناکام ہوئی');
            }

            // نتیجہ حاصل کریں
            const blob = await response.blob();
            const resultUrl = URL.createObjectURL(blob);
            
            // نتیجہ دکھائیں
            displayResult(resultUrl);
            
        } catch (error) {
            showError('ایرر: ' + error.message);
        } finally {
            // لوڈنگ چھپائیں
            loading.style.display = 'none';
            processBtn.disabled = false;
        }
    }

    function displayResult(resultUrl) {
        const resultPreview = document.getElementById('resultPreview');
        const resultPlaceholder = document.getElementById('resultPlaceholder');
        
        resultPreview.src = resultUrl;
        resultPreview.style.display = 'block';
        resultPlaceholder.style.display = 'none';
        
        // ڈاؤنلوڈ بٹن دکھائیں
        downloadBtn.style.display = 'block';
        downloadBtn.dataset.downloadUrl = resultUrl;
        
        // اسکرول کو نتیجہ پر لے جائیں
        resultPreview.scrollIntoView({ behavior: 'smooth' });
    }

    function downloadImage() {
        const downloadUrl = downloadBtn.dataset.downloadUrl;
        if (downloadUrl) {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `no-background-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    function resetApp() {
        // سب کچھ ری سیٹ کریں
        fileInput.value = '';
        currentFile = null;
        previewSection.style.display = 'none';
        downloadBtn.style.display = 'none';
        loading.style.display = 'none';
        processBtn.disabled = false;
        
        // اسکرول کو اوپر لے جائیں
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        // ڈریگ اوور
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        // ڈریگ لیو
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });

        // ڈراپ
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                validateAndLoadFile(files[0]);
            }
        });
    }

    function showError(message) {
        // ایرر میسج دکھائیں
        alert(message);
    }
}

// ہیلتھ چیک
async function checkServerHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('سرور سٹیٹس:', data.status);
    } catch (error) {
        console.error('سرور کنیکٹیویٹی ایرر:', error);
    }
}

// ایپ شروع ہونے پر سرور ہیلتھ چیک کریں
checkServerHealth();
