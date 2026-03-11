// 1. الرابط ديال Google Deployment (الجديد)
const googleURL = "https://script.google.com/macros/s/AKfycbycB5l4H-lwHDBTlDfDfvGVBn7bG4iOcBB6nvLg47jFbevgdvybY_T923KyYph40Ou3xQ/exec";

// 2. إعدادات الكاميرا والماسح
const config = { 
    fps: 20, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    videoConstraints: {
        facingMode: "environment" // استخدام الكاميرا الخلفية
    }
};

let html5QrcodeScanner = new Html5QrcodeScanner("reader", config, false);

// 3. الدالة التي تنفذ عند مسح الـ QR بنجاح
function onScanSuccess(decodedText) {
    console.log(`تم مسح القسم: ${decodedText}`);
    
    // توقيف السكاير وطلب البيانات
    html5QrcodeScanner.clear().catch(err => console.error("Scanner clear failed", err));

    fetch(`${googleURL}?action=getStudents&classId=${encodeURIComponent(decodedText)}`, {
        method: 'GET',
        redirect: 'follow'
    })
    .then(res => res.json())
    .then(students => {
        // إخفاء الكاميرا وإظهار قائمة الحضور
        document.getElementById('reader').style.display = 'none';
        const attendanceView = document.getElementById('attendance-view');
        attendanceView.style.display = 'block';

        let listHTML = `<h2 style="text-align:center; color:#2c3e50;">قائمة: ${decodedText}</h2>`;
        listHTML += `<ul style="list-style:none; padding:0; margin:20px 0;">`;

        if (!students || students.length === 0) {
            listHTML += "<li style='text-align:center; color:red; padding:20px;'>⚠️ لم يتم العثور على تلميذ في هذا القسم!</li>";
        } else {
            students.forEach(name => {
                listHTML += `
                    <li style="padding:15px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center; background:white; margin-bottom:5px; border-radius:8px;">
                        <span style="color: #000000; font-weight: bold; font-size:16px;">${name}</span>
                        <button onclick="sendAttendance('${name}', '${decodedText}')" 
                                style="background:#ff4d4d; color:white; border:none; padding:10px 18px; border-radius:6px; cursor:pointer; font-weight:bold;">
                            تسجيل غياب
                        </button>
                    </li>`;
            });
        }

        listHTML += `</ul>`;
        listHTML += `<button onclick="location.reload()" style="width:100%; padding:15px; background:#34495e; color:white; border:none; border-radius:10px; font-size:16px; cursor:pointer;">🔙 رجوع للماسح</button>`;
        
        attendanceView.innerHTML = listHTML;
    })
    .catch(err => {
        alert("❌ خطأ في الاتصال: تأكد من إعدادات Google Script");
        console.error(err);
        location.reload();
    });
}

// 4. دالة إرسال الغياب لـ Google Sheets
function sendAttendance(studentName, classId) {
    const btn = event.target;
    const originalText = btn.innerText;
    
    btn.innerText = "جاري الإرسال...";
    btn.style.background = "#95a5a6";
    btn.disabled = true;

    fetch(googleURL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({
            student_name: studentName,
            class_id: classId
        })
    })
    .then(() => {
        alert("✅ تم تسجيل غياب: " + studentName);
        btn.innerText = "تم التسجيل ✅";
        btn.style.background = "#2ecc71";
    })
    .catch(err => {
        alert("❌ فشل الإرسال");
        btn.disabled = false;
        btn.innerText = originalText;
        btn.style.background = "#ff4d4d";
    });
}

html5QrcodeScanner.render(onScanSuccess);
