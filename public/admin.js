const hardcodedTOTPSecret = 'IFMEETJOKJKVIVSXEZ5C653NKJLFK3R4NU4U463IOQ4VWLDDGVZQ';

document.addEventListener('DOMContentLoaded', function() {
    // Handle the authentication form submission
    document.getElementById('authForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const token = document.getElementById('token').value;

        fetch('/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, secret: hardcodedTOTPSecret })
        })
        .then(response => response.json())
        .then(data => {
            if (data.verified) {
                document.getElementById('authDiv').style.display = 'none';
                document.getElementById('adminContent').style.display = 'block';
                loadWaitlist(); // Load the waitlist after successful authentication
            } else {
                alert('Authentication failed');
            }
        });
    });

    // Handle the back button click
    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = '/';
    });

    // Handle the add user form submission
    document.getElementById('signupForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadWaitlist(); // Reload waitlist on successful sign-up
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
            } else {
                alert(data.message); // Show error message
            }
        });
    });
});

// Function to load the waitlist
function loadWaitlist() {
    fetch('/waitlist')
    .then(response => response.json())
    .then(data => {
        const waitlistElement = document.getElementById('waitlist');
        waitlistElement.innerHTML = ''; // Clear existing waitlist items

        // Populate the waitlist
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
                        loadWaitlist(); // Reload waitlist after deletion
                    }
                });
            });
            listItem.appendChild(deleteButton);
            waitlistElement.appendChild(listItem);
        });
    });
}
