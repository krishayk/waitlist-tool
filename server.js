const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

let waitlist = [];

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

// Load waitlist from JSON file if it exists
if (fs.existsSync('waitlist.json')) {
    const data = fs.readFileSync('waitlist.json', 'utf-8');
    waitlist = JSON.parse(data);
}

// Endpoint to get the waitlist
app.get('/api/waitlist', (req, res) => {
    res.json(waitlist);
});

// Endpoint to add a user to the waitlist
app.post('/api/waitlist', (req, res) => {
    const user = req.body;
    waitlist.push(user);

    fs.writeFile('waitlist.json', JSON.stringify(waitlist, null, 2), (err) => {
        if (err) {
            res.status(500).json({ message: 'Error saving data.' });
        } else {
            res.json({ message: 'User added successfully!' });
        }
    });
});

// Endpoint to delete a user from the waitlist
app.delete('/api/waitlist/:email', (req, res) => {
    const email = req.params.email;
    waitlist = waitlist.filter(user => user.email !== email);

    fs.writeFile('waitlist.json', JSON.stringify(waitlist, null, 2), (err) => {
        if (err) {
            res.status(500).json({ message: 'Error deleting data.' });
        } else {
            res.json({ message: 'User deleted successfully!' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
