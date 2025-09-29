const {MongoClient} = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017'
const dbName = 'library';
const {ObjectId} = require('mongodb');
let database;
async function getDatabase(){
    if(database){
        return database;
    }
    const client = new MongoClient(uri);
    await client.connect();
    database = client.db(dbName);
        console.log('Database Connected', dbName);
    return database;
}

module.exports = { getDatabase, ObjectId };