// 1. الرابط ديال Google Deployment
const googleURL = "https://script.google.com/macros/s/AKfycbwZ56TRvHCCIMLwMu45gADi-u4SkeMRT-kNjMy1ay8SNmJAwYr-tsko24z91ESZr5V0SQ/exec";

// 2. الدالة اللي كتنفذ ملي كيسكاني الأستاذ الـ QR
function onScanSuccess(decodedText) {
    // توقيف السكاني
    html5QrcodeScanner.clear();
    console.log(`تم مسح القسم: ${decodedText}`);

    // جلب السميات من Google Sheets
    fetch(`${googleURL}?action=getStudents&classId=${decodedText}`)
    .then(res => res.json())
    .then(students => {
        // غبر الكاميرا وبين اللائحة
        document.getElementById('reader').style.display = 'none';
        const attendanceView = document.getElementById('attendance-view');
        attendanceView.style.display = 'block';

        // بناء اللائحة HTML
        let listHTML = `<h2 style="text-align:center;">قائمة القسم: ${decodedText}</h2><ul style="list-style:none; padding:0;">`;
        
        if (students.length === 0) {
            listHTML += "<li style='text-align:center; padding:20px;'>لا توجد أسماء في هذا القسم!</li>";
        } else {
            students.forEach(name => {
                listHTML += `
                    <li style="padding:15px; border-bottom:1px solid #444; display:flex; justify-content:space-between; align-items:center;">
                        <span>${name}</span>
                        <button onclick="sendAttendance('${name}', '${decodedText}')" 
                                style="background:#ff4d4d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">
                            تسجيل غياب
                        </button>
                    </li>`;
            });
        }
        
        listHTML += `</ul><button onclick="location.reload()" style="margin-top:20px; width:100%; padding:12px; background:#555; color:white; border:none; border-radius:10px;">رجوع للماسح</button>`;
        attendanceView.innerHTML = listHTML;
    })
    .catch(err => {
        alert("خطأ: تأكد من أن اسم القسم في Google Sheets مطابق للـ QR");
        console.error(err);
        location.reload();
    });
}

// 3. دالة إرسال الغياب لـ Google Sheets
function sendAttendance(studentName, classId) {
    const btn = event.target;
    btn.innerText = "جاري الإرسال...";
    btn.style.background = "#888";
    btn.disabled = true;

    fetch(googleURL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({
            student_name: studentName,
            class_id: classId
        })
    }).then(() => {
        alert("✅ تم تسجيل غياب " + studentName);
        btn.innerText = "تم التسجيل";
        btn.style.background = "#2ecc71";
    }).catch(err => {
        alert("❌ فشل في الإرسال");
        btn.disabled = false;
        btn.innerText = "حاول مرة أخرى";
    });
} // <--- هاد القوس كان ناقص عندك!

// 4. إعدادات الكاميرا والماسح (معدل للكاميرا الخلفية)
const config = { 
    fps: 20, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    videoConstraints: {
        facingMode: "environment" // هادي هي اللي كتشعل كاميرا اللور
    }
};

let html5QrcodeScanner = new Html5QrcodeScanner("reader", config, false);
html5QrcodeScanner.render(onScanSuccess);
