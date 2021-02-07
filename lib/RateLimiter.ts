import { RateLimitedResource } from "./RateLimitedResource";

export interface RateLimiter {
  remaining(item: RateLimitedResource): Promise<number>;
  consume(item: RateLimitedResource): Promise<boolean>;
  reset(item: RateLimitedResource): Promise<void>;
}
