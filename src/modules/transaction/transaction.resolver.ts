import { QueueAdapter } from "../../adapters/queue";
import ApiError from "../../utils/apiError";
import { UserRepository } from "../user/user.repository";
import { TransactionRepository } from "./transaction.repository";
import { chain, isNegative } from "mathjs";

interface SendTransactionInput {
  params: {
    originId: string;
    destinationCode: string;
    amount: number;
    scheduledDate: Date;
  };
}

export class TransactionResolver {
  private transactionRepository: TransactionRepository;
  private userRepository: UserRepository;
  queue: QueueAdapter;
  constructor(
    transactionRepository: TransactionRepository,
    queueAdapter: QueueAdapter,
    userRepository: UserRepository
  ) {
    this.transactionRepository = transactionRepository;
    this.userRepository = userRepository;
    this.queue = queueAdapter;
    this.sendTransaction = this.sendTransaction.bind(this);
    this.listByUser = this.listByUser.bind(this);

    this.processTransaction();
  }

  async processTransaction() {
    this.queue.process(async (job) => {
      console.log("job consumed", JSON.stringify(job));
      const data: SendTransactionInput["params"] = job.data;
      const { amount, destinationCode, originId, scheduledDate } = data;
      const destinationUser = await this.userRepository.findByCode(
        destinationCode
      );
      const defaultStatus = "sended";
      const params = {
        amount,
        originId,
        createdAt: new Date(),
        destinationId: destinationUser?.id,
        status: defaultStatus,
      };
      destinationUser?.id && (await this.transactionRepository.create(params));

      //update origin user balance
      destinationUser?.id &&
        (await this.userRepository.updateUserBalance(
          data?.amount,
          data?.originId,
          "subtract"
        ));
      //update destination user balance
      await this.userRepository.updateUserBalance(
        data?.amount,
        destinationUser?.id,
        "add"
      );
    });
  }

  async queueTransaction(transactionData: any, delay?: number) {
    this.queue.add(transactionData, delay);
  }

  async listByUser(_: any, input: { userId: string }) {
    console.log(input);
    const { userId } = input;

    const user = await this.userRepository.findById(userId);
    if (user?.id === undefined) {
      throw new Error("The user does not exist by the provided id.");
    }

    const transactions = await this.transactionRepository.findByOriginUser(
      userId
    );

    return transactions;
  }

  async sendTransaction(_: any, input: SendTransactionInput) {
    const { amount, destinationCode, originId, scheduledDate } = input.params;

    const userOrigin = await this.userRepository.findById(originId);
    if (userOrigin?.id === undefined) {
      throw new ApiError({
        message: "The origin user does not exist by the provided id.",
      });
    }

    const destinationUser = await this.userRepository.findByCode(
      destinationCode
    );
    if (destinationUser?.id === undefined) {
      throw new ApiError({
        message: "The destination user does not exist by the provided id.",
      });
    }

    if (destinationCode === userOrigin?.code) {
      throw new ApiError({
        message: "Cannot send money to yourself."
    });
    }

    const balanceDifference = chain(userOrigin?.balance)
      .subtract(amount)
      .done();
    //checks user negative balance
    if (isNegative(balanceDifference)) {
      throw new Error("The user does not have enough balance to transfer.");
    }

    this.queueTransaction({
      originId,
      destinationCode,
      amount,
      scheduledDate,
    });
  }
}
