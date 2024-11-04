
import { MongoDb } from "../adapters/mongo";
import { QueueAdapter } from "../adapters/queue";
import { SessionRepository } from "../modules/session/session.repository";
import { SessionResolver } from "../modules/session/session.resolver";
import { TransactionRepository } from "../modules/transaction/transaction.repository";
import { TransactionResolver } from "../modules/transaction/transaction.resolver";
import { UserRepository } from "../modules/user/user.repository";
import { UserResolver } from "../modules/user/user.resolver";
import JwtUtil from "../utils/jwtUtil";

interface Dependencies {
  mongoDb: MongoDb
  queueAdapter: QueueAdapter,
  jwtUtil: JwtUtil 
}

export const resolverFactory = (dependencies: Dependencies) => {
  const {
    queueAdapter,
    mongoDb,
    jwtUtil
  } = dependencies;

  const transactionRepository = new TransactionRepository(mongoDb)
  const userRepository = new UserRepository(mongoDb)
  const sessionRepository = new SessionRepository(mongoDb)

  const transactionResolver = new TransactionResolver(transactionRepository, queueAdapter, userRepository)
  const sessionResolver = new SessionResolver(sessionRepository, userRepository, jwtUtil)
  const userResolver = new UserResolver(userRepository, sessionRepository)

  const resolvers = {
    Query: {
      listUserTransactions: transactionResolver.listByUser,
      getUserInfoById: userResolver.getUserInfoById
    },
    Mutation: {
      createUser: userResolver.createUser,
      createTransaction: transactionResolver.sendTransaction,
      loginUser: sessionResolver.loginUser,
      logoutUser: sessionResolver.logoutUser
    },
  };

  return resolvers;
};

export const resolversGroup = {
  public: [
    "createUser",
    "loginUser"
  ],
  private: [
    "listUserTransactions",
    "getUserInfoById",    
    "createTransaction",
    "logoutUser"
  ]
}
