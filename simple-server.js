const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// API endpoint
app.post('/api/sessions', (req, res) => {
    console.log('Session received:', req.body);
    res.json({ success: true, message: 'Session saved successfully' });
});

app.get('/api/sessions', (req, res) => {
    res.json([]);
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
