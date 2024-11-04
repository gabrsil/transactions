import { chain, subtract } from "mathjs";
import { MongoDb } from "../../adapters/mongo";
import { Repository } from "../../utils/repository";

export class UserRepository extends Repository {
    constructor(database: MongoDb) {
        const collectionName = 'user'
        super(database, collectionName)
    }

    async findByCode(code: string) {
        const user = await this.findOne({ code })
        return user
    }

    async findByEmail(email: string){
        const user = await this.findOne({ email })
        return user
    }
    
    async updateUserBalance(amount: number, userId: string, operation: 'add' | 'subtract') {
        const user = await this.findById(userId)
        const operationObj = {
            add: (oldBalance: number, amount: number) =>  chain(oldBalance).add(amount).done(),
            subtract: (oldBalance: number, amount: number) =>  chain(oldBalance).subtract(amount).done()
        }
        const operationFunction = operationObj[operation]
        const calculatedBalance = operationFunction(user?.balance, amount)
        const updatedUser = await this.updateOne({ id: userId }, { $set: { balance: calculatedBalance } })
        return updatedUser
    }
}