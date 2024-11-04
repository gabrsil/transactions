import {
  makeExecutableSchema,
  GraphQLSchemaWithContext,
} from "@graphql-tools/schema";
import Router from "@koa/router";
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendResult,
  shouldRenderGraphiQL,
} from "graphql-helix";
import Koa, { Context } from "koa";
import { MongoDb } from "./adapters/mongo";
import { typeDefs } from "./graphql/typeDefs";
import { bodyParser } from "@koa/bodyparser";
import cors from "@koa/cors";
import { parseCookie } from "koa-cookies";
import { applyMiddleware } from "graphql-middleware";
import { resolversGroup } from "./resolvers";
import ApiError from "./utils/apiError";

type ResolverType = {
  Query: any;
  Mutation: any;
};

type ResolversGroupType = typeof resolversGroup;

export class Server extends Koa {
  mongoDb: MongoDb;
  router: Router<Koa.DefaultState, Koa.DefaultContext>;
  schema: GraphQLSchemaWithContext<{}>;
  resolvers: ResolverType;
  resolversGroup: ResolversGroupType;
  constructor(
    resolvers: ResolverType,
    mongoDb: MongoDb,
    resolversGroup: ResolversGroupType
  ) {
    super();
    this.resolvers = resolvers;
    this.resolversGroup = resolversGroup;
    this.mongoDb = mongoDb;
    this.bootstrapRouter();
  }

  bootstrapRouter() {
    this.router = new Router();
    this.use(bodyParser());
    this.makeSchema();
    console.log("bootstrap router");
  }

  makeSchema() {
    const authMiddlewareFunction = async (
      resolve,
      root,
      args,
      context: { ctx: Context },
      info
    ) => {
      const token = context.ctx.cookies.get("token");
      const operationName = info?.operation?.name?.value;
      const isPrivate = this.resolversGroup.private.some(
        (item) => item === operationName
      );
      if (isPrivate && !token) {
        throw new ApiError({
          code: 404,
          message: "Unauthorized.",
        });
      }
      const result = await resolve(root, args, context, info);
      return result;
    };

    this.schema = applyMiddleware(
      makeExecutableSchema({ typeDefs, resolvers: this.resolvers }),
      authMiddlewareFunction
    );
    this.graphqlHandler();
    console.log("make schema");
  }

  graphqlHandler() {
    this.router.options("/graphql", (ctx, next) => {
      ctx.body = "Sucess";
      next();
    });

    this.router.all("/graphql", async (ctx, next) => {
      const request = {
        body: ctx.request?.body,
        headers: ctx.request.headers,
        method: ctx.request.method,
        query: ctx.request.query,
      };

      if (shouldRenderGraphiQL(request)) {
        ctx.response.body = renderGraphiQL();
      } else {
        const { operationName, query, variables } =
          getGraphQLParameters(request);
        const result = await processRequest({
          operationName,
          query,
          contextFactory: () => ({ ctx }),
          variables,
          request,
          schema: this.schema,
        });

        sendResult(result, ctx.res);
        next();
      }
    });
    this.utilities();
  }

  utilities() {
    this.on("error", (err) => {
      console.error("server error", err);
    });

    this.use(
      cors({
        credentials: true,
      })
    );

    this.use(parseCookie());

    this.use(async (ctx, next) => {
      await next();
      const rt = ctx.response.get("X-Response-Time");
      console.log(`${ctx.method} ${ctx.url} - ${rt}`);
    });

    this.use(this.router.routes());

    this.use(this.router.allowedMethods());
  }
}
