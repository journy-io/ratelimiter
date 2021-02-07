[![journy.io](banner.png)](https://journy.io/?utm_source=github&utm_content=readme-ratelimiter)

# Rate limiter

![npm](https://img.shields.io/npm/v/@journyio/ratelimiter?color=%234d84f5&style=flat-square)

A sliding rate limiter using Redis. This package depends on [moment/luxon](https://github.com/moment/luxon) and [luin/ioredis](https://github.com/luin/ioredis).

We don't recommend consuming this package in plain JavaScript (to be able to use interfaces).

Inspired by these blogposts:
* https://engagor.github.io/blog/2017/05/02/sliding-window-rate-limiter-redis/
* https://engagor.github.io/blog/2018/09/11/error-internal-rate-limit-reached/

## 💾 Installation

You can use your package manager (`npm` or `yarn`) to install:

```bash
npm install --save @journyio/ratelimiter
```
or
```bash
yarn add @journyio/ratelimiter
```

## 🔌 Getting started

```ts
import { Duration } from "luxon";
import { RateLimitedResource } from "./RateLimitedResource";
import { RateLimiterRedis } from "./RateLimiterRedis";

const redis = new Client(process.env.REDIS_URL)
const rateLimiter = new RateLimiterRedis(redis);
const resource = new RateLimitedResource("API-calls-user-1313", 100, Duration.fromObject({ minute: 1 }));

const remainingCalls = await rateLimiter.remaining(resource);
const allowed = await rateLimiter.consume(resource);
await rateLimiter.reset(resource);
```

## 💯 Tests

To run the tests:

```bash
npm run test
```

(assuming redis runs on port 6379)

## 🔒 Security

If you discover any security related issues, please email hans at journy io instead of using the issue tracker.
