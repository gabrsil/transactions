import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeEach, describe, it } from "node:test";
import { MongoDb } from "../../adapters/mongo";
import { MongoClient } from "mongodb";
import { v4 } from 'uuid'
import assert from 'node:assert'
import { UserRepository } from "../user/user.repository";

describe("user tests", async () => {
  let mongoDb;  
  let userRepository: UserRepository
  const mockedUser = {
    id: v4(),
    email: 'testuser@gmail.com',      
    password: "1234567",
    name: 'Test User',
  }
  beforeEach(async () => {
    const mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    mongoDb = new MongoDb(MongoClient, uri);

    userRepository= new UserRepository(mongoDb)
    
  });

  it("should get user by id", async () => {
    await userRepository.create(mockedUser)
    const existingUser = await userRepository.findById(mockedUser.id)
    
    assert.equal(existingUser?.id, mockedUser?.id)
  });

  it("should get user by email", async () => {
    await userRepository.create(mockedUser)
    const existingUser = await userRepository.findByEmail(mockedUser.email)
    
    assert.equal(existingUser?.email, mockedUser?.email)
  });

  it('should create user with success', async () => {
   const createdUser = await userRepository.create(mockedUser)

   assert(!!createdUser.insertedId)
  })

});
