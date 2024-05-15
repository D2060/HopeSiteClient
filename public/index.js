document.getElementById("paymentForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const ticketType = formData.get("ticketType");
    const email = formData.get("email");
    const year = formData.get("year");
    let amount;

    switch (ticketType) {
        case "entry":
            amount = 20;
            break;
        case "entry_auditorium":
            amount = 30;
            break;
        case "premium":
            amount = 100;
            break;
        case "super_premium":
            amount = 120;
            break;
        default:
            amount = 0;
            break;
    }

    let userData = {
        year: year,
        email: email,
        ticketType: ticketType,
        amount: amount
    };

    try {
        const response = await fetch('/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        'pavanrapolu16@gmail.com'
        const data = await response.json();
        if (response.ok) {
            console.log('Order created', data);
            userData.orderID = data.order_id;
        } else {
            console.log("Unable to create order!")
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }

    const options = {
        key: "rzp_test_uvjbdK5ihnCJM0",
        amount: amount * 100,
        currency: "INR",
        name: "Hope House",
        description: "E-ticket Payment",
        image: "https://rb.gy/fr7saw",
        order_id: userData.orderID,
        handler: function(response) {
            console.log("Payment completed :)");
            let paymentId = response["razorpay_payment_id"];
            userData.paymentId = paymentId;
            displayQRCode(paymentId, userData);
            sendMail(userData);
            saveToDB(userData);
        },
        prefill: {
            email: email,
        },
        notes: {
            ticketType: ticketType,
        },
        theme: {
            color: "#F37254",
        },
    };

    const rzp = new Razorpay(options);
    rzp.open();
    rzp.on("payment.failed", function(response) {
        console.log(response.error.description);
        alert("Payment Failed");
    });
});

function generateQRCodeURL(text, size) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${text}`;
}

async function displayQRCode(paymentId, userData) {
    let qrCodeImageUrl = generateQRCodeURL(paymentId, 200);

    const qrCodeImg = document.createElement("img");
    qrCodeImg.src = qrCodeImageUrl;
    qrCodeImg.alt = "QR Code";

    let qrdiv = document.querySelector("#qr");
    qrdiv.classList.add("qr");
    let paymentform = document.querySelector("#paymentForm");
    paymentform.classList.add("hide");

    qrdiv.appendChild(qrCodeImg);

    var anchor = document.createElement('a');
    var download = document.createElement('div');
    download.innerText = "Download Now";
    anchor.href = `/generate-pdf?email=${userData.email}&ticket_type=${userData.ticketType}&amount=${userData.amount}&paymentId=${userData.paymentId}&paymentRefId=${userData.orderID}`;
    qrdiv.appendChild(anchor);
    anchor.appendChild(download);
}

function downloadQRCode(qrCodeImageUrl, paymentId) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        var dataURL = canvas.toDataURL('image/jpeg');
        var link = document.createElement('a');
        link.href = dataURL;
        link.download = `HopeHouseTicket_${paymentId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.src = qrCodeImageUrl;
}

async function saveToDB(userData) {
    try {
        const response = await fetch('/savetodb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('Response from server:', response);

        const data = await response.json();
        console.log('User data saved:', data);
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}


async function sendMail(userData) {
    try {
        const response = await fetch('/sendMail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('Response from server:', response);

        const data = await response.json();
        console.log('User data saved:', data);
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function createOrder(userData) {
    try {
        const response = await fetch('/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Order created', data);
    } catch (error) {
        console.error('Error creating order:', error);
    }
}
