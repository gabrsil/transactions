import { Collection, Document, Filter, ObjectId } from "mongodb";
import { MongoDb } from "../adapters/mongo";

export class Repository {
    collectionName: string
    private collection: Collection<Document>
    private database: MongoDb

    constructor(database: MongoDb, collectionName: string) {
        this.collectionName = collectionName
        this.database = database
        this.collection = database.getCollection(collectionName);
    }

    async create(data: any){
        const inserted = await this.collection.insertOne(data)
        return inserted
    }

    async findMany(filter: Filter<Document>){
        const results = await this.collection.find(filter).sort({ createdAt: -1 }).toArray()
        return results
    }

    async findById(id: string){
        const result = await this.collection.findOne({ id })
        return result
    }

    async findOne(filter: Filter<Document>) {
        const result = await this.collection.findOne(filter)
        return result
    }

    async updateOne(filter: Filter<Document>, data: any) {
        const updated = await this.collection.updateOne(filter, data)
        return updated
    }
}