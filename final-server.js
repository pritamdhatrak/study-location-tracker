const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/api/sessions', (req, res) => {
    console.log('Session saved:', req.body);
    res.json({ success: true, data: req.body });
});

app.get('/api/sessions', (req, res) => {
    res.json([]);
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
    console.log('Open: http://localhost:5000/index.html');
});
