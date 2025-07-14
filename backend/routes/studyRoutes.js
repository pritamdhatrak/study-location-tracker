const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');

router.post('/sessions', studyController.createSession);
router.get('/sessions', studyController.getSessions);
router.get('/sessions/:id', studyController.getSessionById);

module.exports = router;