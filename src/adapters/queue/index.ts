import Queue from "bull";

interface RedisConfig {
  host: string;
  password: string;
  port: number;
  username: string;
}

export class QueueAdapter {
  private queue: Queue.Queue;
  private redisConfig: RedisConfig;
  constructor(redisConfig: RedisConfig) {
    this.redisConfig = redisConfig

    this.bootstrapQueue();
  }

  bootstrapQueue() {
    this.queue = new Queue("queue", {
      redis: this.redisConfig,
    });
    this.queue.on("active", () => console.log("Queue initiated"));
  }

  add(content: any, delay?: number) {
    this.queue.add(content, { delay });
  }

  process(callback: Queue.ProcessCallbackFunction<any>) {
    this.queue.process(callback);
  }
}
