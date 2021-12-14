import { Clock } from "@journyio/clock";
import { RateLimitedResource } from "./RateLimitedResource";
import { RateLimiter } from "./RateLimiter";
import { Redis } from "ioredis";

interface RedisWithCommands extends Redis {
  rateLimiterRemaining(
    key: string,
    nowInMilliseconds: number,
    windowInMilliseconds: number,
    allowedCalls: number
  ): Promise<number>;
  rateLimiterConsume(
    key: string,
    nowInMilliseconds: number,
    windowInMilliseconds: number,
    allowedCalls: number
  ): Promise<number>;
}

export class RateLimiterRedis implements RateLimiter {
  constructor(private readonly redis: Redis, private readonly clock: Clock) {
    this.redis.defineCommand("rateLimiterRemaining", {
      numberOfKeys: 1,
      lua: `
        local token = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])

        local clearBefore = now - window
        redis.call('ZREMRANGEBYSCORE', token, 0, clearBefore)
        local amount = redis.call('ZCARD', token)
        redis.call('EXPIRE', token, window)

        return limit - amount
      `,
    });
    this.redis.defineCommand("rateLimiterConsume", {
      numberOfKeys: 1,
      lua: `
        local token = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])

        local clearBefore = now - window
        redis.call('ZREMRANGEBYSCORE', token, 0, clearBefore)

        local amount = redis.call('ZCARD', token)
        if amount < limit then
            redis.call('ZADD', token, now, now)
        end
        redis.call('EXPIRE', token, window)

        return limit - amount
      `,
    });
  }

  async remaining(rateLimitedItem: RateLimitedResource): Promise<number> {
    return await (this.redis as RedisWithCommands).rateLimiterRemaining(
      this.getKey(rateLimitedItem),
      this.clock.getUTCTime().toMillis(),
      rateLimitedItem.getWindow().as("millisecond"),
      rateLimitedItem.getAllowedCalls()
    );
  }

  async reset(rateLimitedItem: RateLimitedResource): Promise<void> {
    await this.redis.del(this.getKey(rateLimitedItem));
  }

  // noinspection JSMethodCanBeStatic
  private getKey(rateLimitedItem: RateLimitedResource) {
    return `SlidingRateLimiterRedis(${rateLimitedItem.getUniqueName()})`;
  }

  async consume(rateLimitedItem: RateLimitedResource): Promise<boolean> {
    const remaining = await (
      this.redis as RedisWithCommands
    ).rateLimiterConsume(
      this.getKey(rateLimitedItem),
      this.clock.getUTCTime().toMillis(),
      rateLimitedItem.getWindow().as("millisecond"),
      rateLimitedItem.getAllowedCalls()
    );

    return remaining > 0;
  }
}
