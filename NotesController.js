const NotesController = require('express').Router();
const log = require('./LoggerFactory')("NotesController");
const ObjectId = require('mongodb').ObjectId;

NotesController.post('/', async (req, res, next) => {
    let body = req.body;
    let db = req.app.get('db');
    let collection = db.collection('notes');

    let creationDate = Date.now();
    body.creationDate = creationDate;
    body.updatedDate = creationDate;

    let result = await collection.insertOne(body);
    log.info('Insert successful, body: ' + JSON.stringify(body, null, 4));

    res.send(result.ops[0]);
});

NotesController.get('/', async (req, res, next) => {
    let db = req.app.get('db');
    let collection = db.collection('notes');

    let notesCursor = await collection.find({}, null);
    let notes = await notesCursor.toArray();

    log.info('Retrieve successful, object: ' + JSON.stringify(notes, null, 4));
    res.send(notes);
});

NotesController.patch('/:id', async (req, res, next) => {
    let body = req.body;
    let db = req.app.get('db');
    let collection = db.collection('notes');   

    let updatedDoc = await collection.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: body },
        { returnOriginal: false }
    );
    updatedDoc = updatedDoc.value;

    log.info('Update successful, object: ' + JSON.stringify(updatedDoc, null, 4));
    res.send(updatedDoc);
});

NotesController.delete('/:id', async (req, res, next) => {
    let id = req.params.id;
    let db = req.app.get('db');
    let collection = db.collection('notes');
    
    await collection.deleteOne({ _id: new ObjectId(id) }, null);
    log.info('Delete successful');
    res.send({"message": "Delete successful"});
});

module.exports = NotesController;