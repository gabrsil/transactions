interface Session {
    id: string,
    token: string,
    createdAt: Date,
    expiresAt: string
    userId: string
}