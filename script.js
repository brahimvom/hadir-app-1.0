// 1. حط الرابط الجديد ديال الـ Deployment هنا
const googleURL = "https://script.google.com/macros/s/AKfycbzdSxXcaKUFVwimB0x-nv4llxsDvYSnyKYCu136MEfBSmnmdePMMfScitIJ1Ly9bOTH_w/exec";

function onScanSuccess(decodedText, decodedResult) {
    // توقيف الكاميرا
    html5QrcodeScanner.clear();

    // اهتزاز بسيط للتأكيد
    if (navigator.vibrate) navigator.vibrate(100);

    // --- الكود اللي سولتيني عليه كيتحط هنا ---
    fetch(`${googleURL}?action=getStudents&classId=${decodedText}`)
    .then(res => res.json())
    .then(students => {
        document.getElementById('reader').style.display = 'none';
        const attendanceView = document.getElementById('attendance-view');
        attendanceView.style.display = 'block';

        // بناء اللائحة (HTML)
        let listHTML = `<h2 style="text-align:center;">قائمة القسم: ${decodedText}</h2><ul style="list-style:none; padding:0;">`;
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
        listHTML += `</ul><button onclick="location.reload()" style="margin-top:20px; width:100%; padding:10px; background:#555; color:white; border:none; border-radius:5px;">رجوع للماسح</button>`;
        
        attendanceView.innerHTML = listHTML;
    })
    .catch(err => {
        alert("خطأ في جلب البيانات: تأكد من اسم القسم في Google Sheets");
        location.reload();
    });
}

// 2. دالة إرسال الغياب (doPost)
function sendAttendance(studentName, classId) {
    // تغيير شكل الزرار باش يبان بلي راه كيصيفط
    event.target.innerText = "جاري الإرسال...";
    event.target.style.background = "#888";

    fetch(googleURL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({
            student_name: studentName,
            class_id: classId
        })
    }).then(() => {
        alert(" تم تسجيل غياب " + studentName + " بنجاح");
        // نرجعو الزرار لأصله بعد النجاح
        event.target.innerText = "تم التسجيل";
    }).catch(err => {
        alert(" فشل الإرسال");
    });
}

// إعدادات الكاميرا
let html5QrcodeScanner = new Html5QrcodeScanner("reader", config, false);


html5QrcodeScanner.render(onScanSuccess, (err) => {
    
const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { 
  const config = { 
    fps: 15, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
};
