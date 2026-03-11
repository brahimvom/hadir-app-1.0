// 1. الرابط ديال Google Deployment (تأكدي أنه الرابط الجديد اللي كيسالي بـ exec)
const googleURL = "https://script.google.com/macros/s/AKfycbyYQTUHT_CjB5qtA0fLGg1NF3-9J8uLWphMV4Yu4VEe_lbcWwCLsBsU9HswN4HwJ1sP5Q/exec";

// 2. إعدادات الكاميرا (فرض الكاميرا الخلفية)
const config = { 
    fps: 20, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    videoConstraints: {
        facingMode: "environment" // باش تشعل الكاميرا ديال اللور
    }
};

let html5QrcodeScanner = new Html5QrcodeScanner("reader", config, false);

// 3. الدالة اللي كتحل ملي كيسكاني الأستاذ القسم
function onScanSuccess(decodedText) {
    console.log(`تم مسح القسم: ${decodedText}`);
    
    // توقيف الكاميرا باش نفتحو اللائحة
    html5QrcodeScanner.clear().catch(err => console.error("Scanner clear failed", err));

    // جلب الطلاب من Google Sheets
    fetch(`${googleURL}?action=getStudents&classId=${decodedText}`, {
        method: 'GET',
        redirect: 'follow'
    })
    .then(res => res.json())
    .then(students => {
        // إخفاء الكاميرا وإظهار واجهة الحضور
        document.getElementById('reader').style.display = 'none';
        const attendanceView = document.getElementById('attendance-view');
        attendanceView.style.display = 'block';

        let listHTML = `<h2 style="text-align:center; color:#2c3e50;">القسم: ${decodedText}</h2>`;
        listHTML += `<ul style="list-style:none; padding:0; margin:20px 0;">`;

        if (!students || students.length === 0) {
            listHTML += "<li style='text-align:center; color:red;'>لم يتم العثور على طلاب في هذا القسم!</li>";
        } else {
            students.forEach(name => {
                listHTML += `
                    <li style="padding:15px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center; background:white; margin-bottom:5px; border-radius:8px;">
                        <span style="font-weight:bold;">${name}</span>
                        <button onclick="sendAttendance('${name}', '${decodedText}')" 
                                style="background:#e74c3c; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer;">
                            تسجيل غياب
                        </button>
                    </li>`;
            });
        }

        listHTML += `</ul>`;
        listHTML += `<button onclick="location.reload()" style="width:100%; padding:15px; background:#34495e; color:white; border:none; border-radius:10px; font-size:16px;">رجوع للماسح</button>`;
        
        attendanceView.innerHTML = listHTML;
    })
    .catch(err => {
        alert("خطأ في الاتصال بجوجل: تأكد من Deployment و 'Anyone'");
        console.error(err);
        location.reload();
    });
}

// 4. دالة إرسال الغياب لـ Google Sheets
function sendAttendance(studentName, classId) {
    const btn = event.target;
    const originalText = btn.innerText;
    
    btn.innerText = "جاري الحفظ...";
    btn.style.background = "#bdc3c7";
    btn.disabled = true;

    fetch(googleURL, {
        method: 'POST',
        mode: 'no-cors', // ضرورية لتفادي مشاكل CORS مع Google
        body: JSON.stringify({
            student_name: studentName,
            class_id: classId
        })
    })
    .then(() => {
        alert("✅ تم تسجيل غياب: " + studentName);
        btn.innerText = "تم التسجيل";
        btn.style.background = "#2ecc71";
    })
    .catch(err => {
        alert("❌ وقع خطأ أثناء الإرسال");
        btn.disabled = false;
        btn.innerText = originalText;
        btn.style.background = "#e74c3c";
    });
}

// تشغيل السكاير
html5QrcodeScanner.render(onScanSuccess);
