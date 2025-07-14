const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send(\
<!DOCTYPE html>
<html>
<head>
    <title>Study Tracker</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial; margin: 20px; }
        .box { border: 1px solid #ccc; margin: 10px; padding: 15px; }
        .btn { display: inline-block; background: blue; color: white; padding: 8px 16px; margin: 5px; cursor: pointer; }
        canvas { border: 1px solid black; margin: 5px; }
    </style>
</head>
<body>
    <h1>Study Location Tracker</h1>
    
    <div class="box">
        <h3>Location</h3>
        <div id="loc">Ready</div>
        <span class="btn" id="locBtn">Get Location</span>
    </div>
    
    <div class="box">
        <h3>Timer</h3>
        <canvas id="canvas" width="300" height="200"></canvas><br>
        <span class="btn" id="start">Start</span>
        <span class="btn" id="stop">Stop</span>
        <div id="display">0:00</div>
    </div>
    
    <div class="box">
        <h3>History</h3>
        <div id="history">No sessions</div>
    </div>

    <script>
        console.log('Script starting...');
        
        var time = 0;
        var running = false;
        var position = null;
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        
        // Draw initial canvas
        function draw() {
            ctx.clearRect(0, 0, 300, 200);
            ctx.fillStyle = 'lightgray';
            ctx.fillRect(0, 0, 300, 200);
            
            // Timer circle
            ctx.beginPath();
            ctx.arc(100, 100, 50, 0, Math.PI * 2);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            if (time > 0) {
                var progress = (time % 60) / 60;
                ctx.beginPath();
                ctx.arc(100, 100, 50, -Math.PI/2, (-Math.PI/2) + (progress * Math.PI * 2));
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            var mins = Math.floor(time / 60);
            var secs = time % 60;
            ctx.fillText(mins + ':' + secs.toString().padStart(2, '0'), 100, 105);
            
            // Location map
            if (position) {
                ctx.fillStyle = 'lightblue';
                ctx.fillRect(200, 50, 80, 80);
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(240, 90, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.fillText('You', 240, 110);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillRect(200, 50, 80, 80);
                ctx.strokeRect(200, 50, 80, 80);
                ctx.fillStyle = 'gray';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('No Location', 240, 95);
            }
        }
        
        // Location button
        document.getElementById('locBtn').onclick = function() {
            console.log('Getting location...');
            document.getElementById('loc').innerHTML = 'Getting location...';
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    console.log('Location success:', pos);
                    position = pos;
                    var lat = pos.coords.latitude.toFixed(4);
                    var lon = pos.coords.longitude.toFixed(4);
                    document.getElementById('loc').innerHTML = 'Location: ' + lat + ', ' + lon;
                    draw();
                }, function(err) {
                    console.log('Location error:', err);
                    document.getElementById('loc').innerHTML = 'Error: ' + err.message;
                });
            } else {
                document.getElementById('loc').innerHTML = 'Not supported';
            }
        };
        
        // Start button
        document.getElementById('start').onclick = function() {
            console.log('Starting timer...');
            running = true;
            update();
        };
        
        // Stop button  
        document.getElementById('stop').onclick = function() {
            console.log('Stopping timer...');
            running = false;
            if (time > 0) save();
            time = 0;
            draw();
        };
        
        // Timer update
        function update() {
            if (running) {
                requestIdleCallback(function() {
                    time++;
                    var mins = Math.floor(time / 60);
                    var secs = time % 60;
                    document.getElementById('display').innerHTML = mins + ':' + secs.toString().padStart(2, '0');
                    draw();
                    setTimeout(update, 1000);
                });
            }
        }
        
        // Save session
        function save() {
            console.log('Saving...');
            if (!position) {
                document.getElementById('history').innerHTML = 'No location - saved locally';
                return;
            }
            
            var data = {
                duration: time,
                location: { lat: position.coords.latitude, lon: position.coords.longitude }
            };
            
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/sessions');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                console.log('Save response:', xhr.responseText);
                document.getElementById('history').innerHTML = 'Saved: ' + Math.floor(time/60) + ' min';
            };
            xhr.onerror = function() {
                console.log('Save failed');
                document.getElementById('history').innerHTML = 'Save failed - stored locally';
            };
            xhr.send(JSON.stringify(data));
        }
        
        // Initialize
        console.log('Initializing...');
        draw();
        
        // Auto get location
        setTimeout(function() {
            document.getElementById('locBtn').onclick();
        }, 2000);
        
        console.log('Script loaded successfully');
    </script>
</body>
</html>
    \);
});

app.post('/api/sessions', (req, res) => {
    console.log('Session received:', req.body);
    res.json({ success: true, message: 'Session saved' });
});

app.get('*', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));
