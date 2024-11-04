import { UserRepository } from "../user/user.repository";
import { SessionRepository } from "./session.repository";
import bcrypt from "bcrypt";
import ApiError from "../../utils/apiError";
import JwtUtil from "../../utils/jwtUtil";
import { addDays } from "date-fns";
import { Context } from "koa";

interface LoginUserInput {
  email: string;
  password: string;
}

interface LogoutUserInput {
  userId: string;
}

export class SessionResolver {
  sessionRepository: SessionRepository;
  userRepository: UserRepository;
  jwtUtil: JwtUtil;
  constructor(
    sessionRepository: SessionRepository,
    userRepository: UserRepository,
    jwtUtil: JwtUtil
  ) {
    this.sessionRepository = sessionRepository;
    this.userRepository = userRepository;
    this.jwtUtil = jwtUtil;
    this.loginUser = this.loginUser.bind(this);
    this.logoutUser = this.logoutUser.bind(this);
  }

  async loginUser(_: any, input: LoginUserInput, context: { ctx: Context }) {
    const { email, password } = input;

    const user = await this.userRepository.findByEmail(email);
    if (!user?.id) {
      throw new Error("The user does not exist by the provided email");
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      throw new ApiError({
        code: 404,
        message: "The user data is incorrect.",
        userMessage: "Usuário ou senha inválidos.",
      });
    }

    const token = this.jwtUtil.sign({ email });

    const expireAt = addDays(new Date(), 2);

    await this.sessionRepository.updateOne(
      { userId: user?.id },
      { $set: { token, expireAt } }
    );

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000

    const cookieConfig = {
      // httpOnly: true,
      // secure: true,
      maxAge: oneDayInMilliseconds,
      sameSite: true,
      httpOnly: false,
    }

    context.ctx.cookies.set("token", token, cookieConfig);

    context.ctx.cookies.set("userId", user?.id, cookieConfig);

    return { token };
  }

  async logoutUser(_: any, input: LogoutUserInput, context: { ctx: Context }) {
    const { userId } = input;

    const user = await this.userRepository.findById(userId);
    if (!user?.id) {
      throw new Error("The user does not exist by the provided id");
    }

    await this.sessionRepository.updateOne(
      { userId: user?.id },
      { $set: { token: null, expireAt: null } }
    );

    context.ctx.cookies.set("token", '', {});

    context.ctx.cookies.set("userId", '', {});

    return { loggedOut: true };
  }
}
