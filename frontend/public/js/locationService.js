class LocationService {
    constructor() {
        this.watchId = null;
        this.currentPosition = null;
        this.geoOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
    }

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    this.currentPosition = position;
                    resolve(position);
                },
                error => reject(error),
                this.geoOptions
            );
        });
    }

    watchLocation(callback) {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported');
        }

        this.watchId = navigator.geolocation.watchPosition(
            position => {
                this.currentPosition = position;
                callback(position);
            },
            error => console.error('Location error:', error),
            this.geoOptions
        );
    }

    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    async reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }
}