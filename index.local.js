require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` })

const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const cors = require('cors');
const log = require('./LoggerFactory')("index");
const app = express();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_NAME = process.env.MONGODB_NAME;
const API_BASE_URL = process.env.API_BASE_URL;
const API_PORT = process.env.API_PORT;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const CORS_OPTIONS = {
    origin: CORS_ORIGIN,
    optionsSuccessStatus: 200,
    credentials: true
};

let dbConnection = null;

(async () => {
    log.info('The following profile is active: ' + process.env.NODE_ENV);
    log.info('The logger level is set to: ' + process.env.LOG_LEVEL);
    await connectToDB();

    process.on('SIGINT', () => {
        log.info('Closing DB connection');
        app.get('dbClient').close();
        process.exit();
    });

    app.use(express.json());
    app.use(cors(CORS_OPTIONS));
    app.use(pathLogger);
    
    app.get(API_BASE_URL+'/', (req, res) => {
        res.send("Welcome!");
    })
    app.use(API_BASE_URL+'/notes', require('./NotesController'));
    
    app.use(errorLogger);
    app.use(defaultErrorHandler)

    app.listen(API_PORT, function() {
        log.info('Server started, listening on port ' + API_PORT);
    });
})();

async function connectToDB() {
    if(!dbConnection) {
        dbConnection = MongoClient.connect(
            MONGODB_URI, 
            { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10 }, 
            null
        );
    }
    try {
        let result = await dbConnection;
        app.set('db', await result.db(MONGODB_NAME, null));
        app.set('dbClient', result);
        log.info('Connected to database successfully');
    } catch(e) {
        log.error('Database connection failed');
        log.error(e.stack);
        process.exit(1);
    }
}

function pathLogger(req, res, next) {
    log.info(req.method.toUpperCase() + " " + req.path);
    next();
}

function errorLogger(err, req, res, next) {
    log.error('An error has occurred');
    log.error(err.stack);
    next(err);
}

function defaultErrorHandler(err, req, res, next) {
    log.error('Default error handler invoked');
    res.status(500).send({'error': 'Something went wrong on our end'});
}