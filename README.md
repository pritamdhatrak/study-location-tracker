# Study Location Tracker

A full-stack web application that helps students track their study sessions with location data and visual timers. Built using modern Web APIs including Geolocation, Canvas, and Background Tasks APIs.

## 🌐 Live Demo

**[View Live Application](https://study-location-tracker.onrender.com)**

## 📋 Features

- **📍 Automatic Location Detection** - Gets your current location when the app loads
- **⏰ Visual Study Timer** - Interactive circular timer with canvas animations
- **🗺️ Location Visualization** - Real-time location mapping with accuracy indicators
- **📊 Session Tracking** - Records study duration with location data
- **🔄 Continuous Location Tracking** - Option to track location changes during study
- **💾 Data Persistence** - Sessions saved via backend API
- **📱 Responsive Design** - Works on desktop and mobile devices

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive styling with Flexbox
- **Vanilla JavaScript** - ES6+ features, no frameworks

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **RESTful API** - Session data endpoints

### Deployment
- **Render** - Backend hosting
- **Git/GitHub** - Version control

## 🚀 Web APIs Implemented

### 1. Geolocation API
- `navigator.geolocation.getCurrentPosition()` - Get current location
- `navigator.geolocation.watchPosition()` - Track location changes
- High accuracy positioning with error handling
- Reverse geocoding for address display

### 2. Canvas API
- **Study Timer Visualization** - Circular progress indicator
- **Location Map** - Visual representation of user position
- Real-time animations and updates
- Custom drawing with 2D context

### 3. Background Tasks API
- `requestIdleCallback()` - Efficient timer updates
- Non-blocking UI updates
- Optimized performance for smooth animations

## 🔧 Installation & Local Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or yarn package manager
- **Git** - [Download here](https://git-scm.com/)

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/pritamdhatrak/study-location-tracker.git
cd study-location-tracker


## 📁 Project Structure

study-location-tracker/ ├── index.html # Main application interface ├── simple-server.js # Express.js backend server ├── package.json # Dependencies and scripts ├── .env # Environment variables ├── .gitignore # Git ignore rules └── README.md # Project documentation
