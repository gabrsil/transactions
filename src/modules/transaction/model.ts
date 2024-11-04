
type TransactionStatus = 'created' | 'sended' | 'not-sended'

interface Transaction {
    id: string
    amount: number
    originId: string
    destinationId: string,
    createdAt: Date,
    status: TransactionStatus
}