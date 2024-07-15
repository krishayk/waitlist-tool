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

// Remove this section since we're hardcoding the secret
// if (!totpSecret) {
//     const secret = speakeasy.generateSecret({ name: "Waitlist Tool Admin" });
//     totpSecret = secret.base32;
//     fs.appendFileSync('.env', `\nTOTP_SECRET=${totpSecret}`);
// }

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

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

app.post('/verify', (req, res) => {
    const { token, secret } = req.body;
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
    res.json({ verified });
});

app.post('/signup', (req, res) => {
    const { name, email } = req.body;
    waitlist.push({ name, email });
    fs.writeFileSync('waitlist.json', JSON.stringify(waitlist, null, 2));
    res.json({ success: true });
});

app.get('/waitlist', (req, res) => {
    res.json(waitlist);
});

app.delete('/remove', (req, res) => {
    const { email } = req.body;
    waitlist = waitlist.filter(user => user.email !== email);
    fs.writeFileSync('waitlist.json', JSON.stringify(waitlist, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
