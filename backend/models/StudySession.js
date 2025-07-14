const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
    duration: {
        type: Number,
        required: true
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        accuracy: {
            type: Number,
            required: true
        }
    },
    address: {
        type: String
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudySession', studySessionSchema);