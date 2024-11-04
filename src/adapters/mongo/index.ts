import { Db, MongoClient } from "mongodb"

export class MongoDb {
    mongoClient: typeof MongoClient
    dbUri: string 
    database: Db
    constructor(
        mongoDep: typeof MongoClient,
        uri: string) {
        this.mongoClient = mongoDep
        this.dbUri = uri

        this.initDb()
    }

    initDb(){
        const dbName = process.env.DB_NAME
        const client = new this.mongoClient(this.dbUri);
        this.database = client.db(dbName);        
    }

    getCollection(collectionName: string) {
        const collection = this.database.collection(collectionName);
        return collection
    }
}