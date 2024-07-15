document.getElementById('adminButton').addEventListener('click', function() {
    const password = prompt('Please enter the admin password:');
    if (password === 'pizza') {
        window.location.href = 'admin.html';
    } else {
        alert('Incorrect password.');
    }
});

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    fetch('/api/waitlist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('signupForm').reset();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
