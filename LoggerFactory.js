let LOG_LEVEL = process.env.LOG_LEVEL;

function getLogger(filename) {
    const log = require('pino')();
    log.level = LOG_LEVEL; 
    return log.child({'filename': filename});
}

module.exports = getLogger;