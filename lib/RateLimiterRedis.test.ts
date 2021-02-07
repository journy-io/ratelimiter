import { ClockFixed } from "@journyio/clock";
import Client, { Redis } from "ioredis";
import { DateTime, Duration } from "luxon";
import { RateLimitedResource } from "./RateLimitedResource";
import { RateLimiterRedis } from "./RateLimiterRedis";

function random() {
  return Math.random().toString(36).substr(2, 9);
}

describe("RateLimiterRedis", () => {
  let redis: Redis;

  beforeEach(async () => {
    if (!process.env.REDIS_URL) {
      throw new Error("process.env.REDIS_URL is missing");
    }
    redis = new Client(process.env.REDIS_URL);
  });

  test("it works", async () => {
    const clock = new ClockFixed(DateTime.utc());
    const limiter = new RateLimiterRedis(redis, clock);
    const resource = new RateLimitedResource(
      random(),
      3,
      Duration.fromObject({ minute: 1 })
    );

    expect(await limiter.remaining(resource)).toEqual(3);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(true);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.remaining(resource)).toEqual(2);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(true);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.remaining(resource)).toEqual(1);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(true);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.remaining(resource)).toEqual(0);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(false);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(false);
    clock.advance(Duration.fromObject({ seconds: 30 }));
    expect(await limiter.remaining(resource)).toEqual(0);
    clock.advance(Duration.fromObject({ seconds: 32 }));
    expect(await limiter.consume(resource)).toEqual(true);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.remaining(resource)).toEqual(2);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(true);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(true);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    expect(await limiter.consume(resource)).toEqual(false);
    clock.advance(Duration.fromObject({ milliseconds: 1 }));
    await limiter.reset(resource);
    expect(await limiter.consume(resource)).toEqual(true);
  });

  afterEach(async () => {
    await redis.quit();
  });
});
