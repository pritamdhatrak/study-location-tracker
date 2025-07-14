const StudySession = require('../models/StudySession');

exports.createSession = async (req, res) => {
    try {
        const session = await StudySession.create(req.body);
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await StudySession.find()
            .sort({ startTime: -1 })
            .limit(10);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const session = await StudySession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};