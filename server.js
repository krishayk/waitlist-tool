const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let waitlist = [];
if (fs.existsSync('waitlist.json')) {
    waitlist = JSON.parse(fs.readFileSync('waitlist.json'));
}

// Hardcoded TOTP secret
const totpSecret = 'IFMEETJOKJKVIVSXEZ5C653NKJLFK3R4NU4U463IOQ4VWLDDGVZQ';

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve the TOTP secret and QR code
app.get('/totp-secret', (req, res) => {
    qrcode.toDataURL(speakeasy.otpauthURL({
        secret: totpSecret,
        label: "Waitlist Tool Admin",
        issuer: "YourAppName"
    }), (err, data_url) => {
        if (err) {
            console.error('Error generating QR code:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json({ secret: totpSecret, qr: data_url });
    });
});

// Verify the TOTP token
app.post('/verify', (req, res) => {
    const { token, secret } = req.body;
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
    res.json({ verified });
});

// Sign up a new user, with duplicate email check
app.post('/signup', (req, res) => {
    const { name, email } = req.body;

    // Check for duplicate email
    if (waitlist.some(user => user.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    waitlist.push({ name, email });
    fs.writeFileSync('waitlist.json', JSON.stringify(waitlist, null, 2));
    res.json({ success: true });
});

// Get the waitlist
app.get('/waitlist', (req, res) => {
    res.json(waitlist);
});

// Remove a user from the waitlist
app.delete('/remove', (req, res) => {
    const { email } = req.body;
    waitlist = waitlist.filter(user => user.email !== email);
    fs.writeFileSync('waitlist.json', JSON.stringify(waitlist, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
