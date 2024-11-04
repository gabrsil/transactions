import { MongoClient } from "mongodb"
import { MongoDb } from "./src/adapters/mongo"
import { Server } from "./src/server"
import { QueueAdapter } from "./src/adapters/queue"
import { resolverFactory, resolversGroup } from "./src/resolvers"
import JwtUtil from "./src/utils/jwtUtil"

const MONGODB_URL = process.env.MONGO_URI ?? ''

const mongoDb = new MongoDb(MongoClient, MONGODB_URL)

const jwtSecret = process.env.JWT_SECRET ?? ''
const jwtUtil = new JwtUtil(jwtSecret)

const redisConfig = {
  host: process.env.REDIS_HOST ?? "",
  password: process.env.REDIS_PASS ?? "",
  port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : 0,
  username: process.env.REDIS_USER ?? "",
}

const queueAdapter = new QueueAdapter(redisConfig)

const resolvers = resolverFactory({  
  jwtUtil,
  mongoDb,
  queueAdapter
})

const app = new Server(resolvers, mongoDb, resolversGroup)

const PORT = 3000
const HOST = process.env.HOST ?? '127.0.0.1'

app.listen(PORT, HOST);