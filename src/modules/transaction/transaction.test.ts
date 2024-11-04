import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeEach, describe, it } from "node:test";
import { MongoDb } from "../../adapters/mongo";
import { MongoClient } from "mongodb";
import { TransactionRepository } from "./transaction.repository";
import { v4 } from "uuid";
import assert from "node:assert";
import * as mathjs from "mathjs";
import { UserRepository } from "../user/user.repository";

describe("transaction tests", async () => {
  let mongoDb;
  let transactionRepository: TransactionRepository;
  let userRepository: UserRepository;
  const originUser = {
    id: v4(),
    email: "testuser@gmail.com",
    password: "1234567",
    balance: 100,
    name: "Test User",
  };
  const destinationUser = {
    id: v4(),
    email: "destinationuser@gmail.com",
    password: "1234567",
    balance: 100,
    name: "Destination User",
  };

  beforeEach(async () => {
    const mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    mongoDb = new MongoDb(MongoClient, uri);

    transactionRepository = new TransactionRepository(mongoDb);
    userRepository = new UserRepository(mongoDb);
  });

  it("should create a transaction with success", async () => {
    await userRepository.create(originUser);
    await userRepository.create(destinationUser);

    const destinationUserCode = await userRepository.findById(
      destinationUser.id
    );
    const mockedTransaction = {
      id: v4(),
      originId: originUser?.id,
      destinationCode: destinationUserCode?.code,
      amount: 10,
    };

    const createdTransaction = await transactionRepository.create(
      mockedTransaction
    );

    assert(!!createdTransaction.insertedId);
  });

  it("should update user origin and destination balance", async () => {
    await userRepository.create(originUser);
    await userRepository.create(destinationUser);

    const createdDestinationUser = await userRepository.findById(
      destinationUser.id
    );
    const transactionAmount = 10;
    const mockedTransaction = {
      id: v4(),
      originId: originUser?.id,
      destinationCode: createdDestinationUser?.code,
      amount: transactionAmount,
    };

    const createdOriginUser = await userRepository.findById(originUser?.id);
    //update user balances
    //origin
    await userRepository.updateUserBalance(
      mockedTransaction.amount,
      originUser?.id,
      "subtract"
    );
    //destination
    await userRepository.updateUserBalance(
      mockedTransaction.amount,
      destinationUser?.id,
      "add"
    );

    const originUserNewBalance = mathjs
      .chain(createdOriginUser?.balance)
      .subtract(transactionAmount)
      .done();
    const destinationUserNewBalance = mathjs
      .chain(createdDestinationUser?.balance)
      .add(transactionAmount)
      .done();

    const updateBalanceOrigin = await userRepository.findById(originUser?.id);
    const updateBalanceDestination = await userRepository.findById(destinationUser?.id);

    assert.equal(updateBalanceOrigin?.balance, originUserNewBalance);
    assert.equal(updateBalanceDestination?.balance, destinationUserNewBalance);
  });
});
