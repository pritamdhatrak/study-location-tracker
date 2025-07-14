const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/study_tracker',
    nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = config;
