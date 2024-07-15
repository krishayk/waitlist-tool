document.addEventListener('DOMContentLoaded', function() {
    fetch('/totp-secret')
    .then(response => response.json())
    .then(data => {
        document.getElementById('qrcode').src = data.qr;
        localStorage.setItem('totp-secret', data.secret);
    });

    document.getElementById('authForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const token = document.getElementById('token').value;
        const secret = localStorage.getItem('totp-secret');

        fetch('/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, secret })
        })
        .then(response => response.json())
        .then(data => {
            if (data.verified) {
                document.getElementById('authDiv').style.display = 'none';
                document.getElementById('adminContent').style.display = 'block';
                loadWaitlist();
            } else {
                alert('Authentication failed');
            }
        });
    });

    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = '/';
    });
});

function loadWaitlist() {
    fetch('/waitlist')
    .then(response => response.json())
    .then(data => {
        const waitlistElement = document.getElementById('waitlist');
        waitlistElement.innerHTML = '';
        data.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = `${user.name} (${user.email})`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                fetch('/remove', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadWaitlist();
                    }
                });
            });
            listItem.appendChild(deleteButton);
            waitlistElement.appendChild(listItem);
        });
    });
}
