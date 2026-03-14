
const googleURL = "https://script.google.com/macros/s/AKfycbycxy_LVVtdyNrvAXuommo-MuQjsV7y4q1uWMnKDYYzyq1JY0YRC3v1fE7bee-1PrgMfg/exec";


const config = { 
    fps: 20, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    videoConstraints: {
        facingMode: "environment"
    }
};

let html5QrcodeScanner = new Html5QrcodeScanner("reader", config, false);


function onScanSuccess(decodedText) {
    console.log(`تم مسح القسم: ${decodedText}`);
    html5QrcodeScanner.clear().catch(err => console.error(err));

    fetch(`${googleURL}?action=getStudents&classId=${encodeURIComponent(decodedText)}`, {
        method: 'GET',
        redirect: 'follow'
    })
    .then(res => res.json())
    .then(students => {
        document.getElementById('reader').style.display = 'none';
        const attendanceView = document.getElementById('attendance-view');
        attendanceView.style.display = 'block';

        //nigga 
        let listHTML = `<h2 style="text-align:center; color:#000000 !important; margin-bottom:20px;">القسم: ${decodedText}</h2>`;
        listHTML += `<ul style="list-style:none; padding:0; margin:0;">`;

        if (!students || students.length === 0) {
            listHTML += "<li style='text-align:center; color:red; padding:20px;'>⚠️ لم يتم العثور على تلاميذ!</li>";
        } else {
            students.forEach(name => {
                listHTML += `
                    <li style="padding:15px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items:center; background-color: #ffffff !important; margin-bottom:8px; border-radius:10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <span style="color: #000000 !important; font-weight: 800 !important; font-size:16px !important;">${name}</span>
                        <button onclick="sendAttendance('${name}', '${decodedText}')" 
                                style="background:#ff4d4d; color:#ffffff !important; border:none; padding:10px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">
                            تسجيل غياب
                        </button>
                    </li>`;
            });
        }

        listHTML += `</ul>`;
        listHTML += `<button onclick="location.reload()" style="width:100%; padding:15px; background:#333; color:white; border:none; border-radius:10px; margin-top:20px;">رجوع للماسح</button>`;
        
        attendanceView.innerHTML = listHTML;
    })
    .catch(err => {
        alert("خطأ فالتواصل مع جوجل");
        location.reload();
    });
}

// function li tatsift lghyab l goooooogl sheet
function sendAttendance(studentName, classId) {
    const btn = event.target;
    btn.innerText = "جاري الحفظ...";
    btn.style.background = "#999";
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
        alert(" تم تسجيل غياب: " + studentName);
        btn.innerText = "تم بنجاح";
        btn.style.background = "#2ecc71";
        btn.style.color = "#ffffff";
    })
    .catch(err => {
        alert(" فشل الإرسال");
        btn.disabled = false;
        btn.innerText = "حاول مرة أخرى";
    });
}

html5QrcodeScanner.render(onScanSuccess);
