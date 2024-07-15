document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/waitlist')
        .then(response => response.json())
        .then(data => {
            const waitlistContainer = document.getElementById('waitlistContainer');
            waitlistContainer.innerHTML = '';
            data.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.className = 'user-entry';
                userDiv.innerHTML = `
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <button class="delete-btn" data-email="${user.email}">Delete</button>
                `;
                waitlistContainer.appendChild(userDiv);
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const email = this.getAttribute('data-email');
                    fetch(`/api/waitlist/${email}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        location.reload();
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                });
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});
