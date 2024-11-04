import { MongoDb } from "../../adapters/mongo";
import { Repository } from "../../utils/repository";

export class SessionRepository extends Repository{
    constructor(database: MongoDb) {
        const collectionName = 'session'
        super(database, collectionName)
    }

}