const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/api/sessions', (req, res) => {
    console.log('Session saved:', req.body);
    res.json({ 
        success: true, 
        id: Date.now(), 
        data: req.body,
        message: 'Session saved successfully'
    });
});

app.get('/api/sessions', (req, res) => {
    res.json({ sessions: [], message: 'Session history endpoint' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
