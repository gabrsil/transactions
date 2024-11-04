import { MongoDb } from "../../adapters/mongo";
import { Repository } from "../../utils/repository";

export class TransactionRepository extends Repository {
    constructor(database: MongoDb) {
        const collectionName = 'transaction'
        super(database, collectionName)
    }

    async findByOriginUser(userId: string) {
        return await this.findMany({ originId: userId })
    }
}