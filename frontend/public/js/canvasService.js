class CanvasService {
    constructor() {
        this.timerCanvas = document.getElementById('timerCanvas');
        this.locationCanvas = document.getElementById('locationCanvas');
        this.timerCtx = this.timerCanvas.getContext('2d');
        this.locationCtx = this.locationCanvas.getContext('2d');
    }

    drawTimer(seconds) {
        const ctx = this.timerCtx;
        const width = this.timerCanvas.width;
        const height = this.timerCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 15;
        ctx.stroke();

        const progress = (seconds % 3600) / 3600;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI/2, (-Math.PI/2) + (progress * Math.PI * 2));
        ctx.strokeStyle = '#1a73e8';
        ctx.stroke();

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        ctx.fillStyle = '#333';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(${minutes}:, centerX, centerY);
    }

    drawLocationMap(position) {
        if (!position) return;

        const ctx = this.locationCtx;
        const width = this.locationCanvas.width;
        const height = this.locationCanvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 3; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, i * 30, 0, Math.PI * 2);
            ctx.fillStyle = gba(26, 115, 232, );
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#1a73e8';
        ctx.fill();

        if (position.coords.accuracy) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(26, 115, 232, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}
