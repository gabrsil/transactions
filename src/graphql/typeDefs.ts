export const typeDefs = [
    /* GraphQL */ `
    schema {
      query: Query
      mutation: Mutation
    }
    
    input CreateTransactionInput {
      amount: Int!
      originId: String!
      destinationCode: String!
    }
  
    input CreateAccountInput {
      email: String!
      password: String!
      name: String!
    }

    type LoginReturn {
      token: String!
    }

    type LogoutReturn {
      loggedOut: Boolean
    }
  
    type Mutation {
      createUser(params: CreateAccountInput): User
      loginUser(email: String!, password: String!): LoginReturn
      logoutUser(userId: String!): LogoutReturn
      createTransaction(params: CreateTransactionInput): Transaction,
    }

    type CheckUserReturn {
      userExists: Boolean,
      userId: String
    }
   
    type Query {
      listUserTransactions(userId: ID!): [Transaction]
      accounts: String
      getUserInfoById(userId: ID!): User
      checkUserByCode(userCode: String): CheckUserReturn
    }
    
    type Transaction {
      id: ID
      amount: Int!
      originId: ID!
      destinationId: ID!,
      createdAt: String!,
      status: String!
    }
  
    type User {
      id: ID
      password: String!
      name: String!
      code: String!
      email: String!
      role: String!
      balance: Int!
    }
    `,
  ]