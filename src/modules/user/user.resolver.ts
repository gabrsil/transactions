import { UserRepository } from "./user.repository";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { v4 } from "uuid";
import { SessionRepository } from "../session/session.repository";
import { addDays } from "date-fns";
import ApiError from "../../utils/apiError";

interface CreateUserInput {
  params: {
    email: string;
    password: string;
    name: string;
  };
}

interface GetUserDataByUserIdInput {
  userId: string;
}

export class UserResolver {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  constructor(
    userRepository: UserRepository,
    sessionRepository: SessionRepository
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.createUser = this.createUser.bind(this);
    this.getUserInfoById = this.getUserInfoById.bind(this)
  }

  generateUniqueString() {
    const length = 6;
    const randomBytes = crypto.randomBytes(Math.ceil(length / 2));

    let uniqueString = randomBytes
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "");

    if (uniqueString.length > length) {
      uniqueString = uniqueString.slice(0, length);
    }

    return uniqueString;
  }

  private async hashUserPassword(rawPassword: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, passwordSalt);

    return passwordHash;
  }

  async createUser(_: any, input: CreateUserInput) {
    const { email, password, name } = input.params;

    const userExists = await this.userRepository.findByEmail(email);

    if (userExists?.id) {
      throw new Error("User already Exists by the provided data");
    }
    const defaultRole = "created";
    const defaultBalance = 0;
    const userData = {
      id: v4(),
      email,
      code: this.generateUniqueString(),
      password: await this.hashUserPassword(password),
      name,
      token: null,
      balance: defaultBalance,
      role: defaultRole,
    };

    const created = await this.userRepository.create(userData);
    const expiresAt = addDays(new Date(), 2);
    const session = await this.sessionRepository.create({
      userId: userData?.id,
      expiresAt,
    });

    return {
      id: userData?.id,
      email: userData?.email,
      name: userData?.name,
      code: userData?.code,
      role: userData?.role,
      balance: userData?.balance,
    };
  }

  async getUserInfoById(_: any, input: GetUserDataByUserIdInput) {
    const { userId } = input;

    const userExists = await this.userRepository.findById(userId ?? '');
    if (!userExists?.id) {
      throw new ApiError({
        code: 404,
        message: "The user does not exist by the provided id.",
      });
    }

    return {
      id: userExists?.id,
      name: userExists?.name,
      email: userExists?.email,
      balance: userExists?.balance,
      code: userExists?.code,
    };
  }
}
