class StudyTracker {
    constructor() {
        this.apiService = new ApiService();
        this.locationService = new LocationService();
        this.canvasService = new CanvasService();
        this.studyTimer = 0;
        this.timerRunning = false;
        this.timerInterval = null;

        this.initializeEventListeners();
        this.loadInitialData();
    }

    initializeEventListeners() {
        document.getElementById('updateLocation').addEventListener('click', () => this.updateLocation());
        document.getElementById('watchLocation').addEventListener('click', () => this.startWatchingLocation());
        document.getElementById('stopWatching').addEventListener('click', () => this.stopWatchingLocation());
        document.getElementById('startTimer').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('stopTimer').addEventListener('click', () => this.stopTimer());
    }

    async loadInitialData() {
        await this.updateLocation();
        await this.loadStudySessions();
        this.canvasService.drawTimer(0);
    }

    async updateLocation() {
        try {
            const position = await this.locationService.getCurrentLocation();
            await this.displayLocation(position);
            this.canvasService.drawLocationMap(position);
        } catch (error) {
            this.handleLocationError(error);
        }
    }

    async displayLocation(position) {
        const { latitude, longitude, accuracy, speed } = position.coords;
        
        document.getElementById('currentLocation').textContent = 
            Location: °, °;
        document.getElementById('locationAccuracy').textContent = 
            Accuracy:  meters;
        document.getElementById('locationSpeed').textContent = 
            speed !== null ? Speed:  m/s : 'Speed: Not available';

        const address = await this.locationService.reverseGeocode(latitude, longitude);
        if (address) {
            document.getElementById('locationAddress').textContent = Address: ;
        }
    }

    handleLocationError(error) {
        let message = 'Location error: ';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message += 'Permission denied';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Position unavailable';
                break;
            case error.TIMEOUT:
                message += 'Request timed out';
                break;
            default:
                message += 'Unknown error';
        }
        document.getElementById('currentLocation').textContent = message;
    }

    startWatchingLocation() {
        this.locationService.watchLocation(position => {
            this.displayLocation(position);
            this.canvasService.drawLocationMap(position);
        });
        
        document.getElementById('watchLocation').disabled = true;
        document.getElementById('stopWatching').disabled = false;
    }

    stopWatchingLocation() {
        this.locationService.stopWatching();
        document.getElementById('watchLocation').disabled = false;
        document.getElementById('stopWatching').disabled = true;
    }

    startTimer() {
        if (!this.timerRunning) {
            this.timerRunning = true;
            this.updateTimer();
        }
    }

    pauseTimer() {
        this.timerRunning = false;
    }

    async stopTimer() {
        this.timerRunning = false;
        if (this.studyTimer > 0) {
            await this.saveStudySession();
            this.studyTimer = 0;
            this.canvasService.drawTimer(0);
            document.getElementById('studyTime').textContent = 'Time: 0:00';
        }
    }

    updateTimer() {
        if (this.timerRunning) {
            requestIdleCallback(() => {
                this.studyTimer++;
                this.canvasService.drawTimer(this.studyTimer);
                document.getElementById('studyTime').textContent = 
                    Time: :;
                this.updateTimer();
            });
        }
    }

    async saveStudySession() {
        const position = this.locationService.currentPosition;
        if (!position) {
            alert('Location not available. Please update location first.');
            return;
        }

        const sessionData = {
            duration: this.studyTimer,
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            },
            endTime: new Date()
        };

        try {
            await this.apiService.createSession(sessionData);
            await this.loadStudySessions();
        } catch (error) {
            console.error('Error saving session:', error);
            alert('Failed to save study session');
        }
    }

    async loadStudySessions() {
        try {
            const sessions = await this.apiService.getSessions();
            const historyDiv = document.getElementById('studyHistory');
            historyDiv.innerHTML = '';
            
            sessions.forEach(session => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = 
                    <strong>Date:</strong> <br>
                    <strong>Duration:</strong>  minutes  seconds<br>
                    <strong>Location:</strong> °, °<br>
                    <strong>Accuracy:</strong>  meters
                ;
                historyDiv.appendChild(historyItem);
            });
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }
}

const studyTracker = new StudyTracker();
