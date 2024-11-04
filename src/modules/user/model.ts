
type UserRole = 'created' | 'user' | 'blocked'

interface User {
    id: string
    name: string
    email: string
    password: string
    token: string,
    role: string
    balance: number
}