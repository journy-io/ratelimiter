import { Duration } from "luxon";
import { RateLimitedResource } from "./RateLimitedResource";

describe("RateLimitedResource", () => {
  test("it throws error if name is empty", () => {
    expect(() => {
      new RateLimitedResource("", 10, Duration.fromObject({ seconds: 10 }));
    }).toThrowError();
  });

  test("it throws error if allowed calls is negative", () => {
    expect(() => {
      new RateLimitedResource("name", -1, Duration.fromObject({ seconds: 10 }));
    }).toThrowError();
  });

  test("it throws error if allowed calls is zero", () => {
    expect(() => {
      new RateLimitedResource("name", 0, Duration.fromObject({ seconds: 10 }));
    }).toThrowError();
  });

  test("it returns set values", () => {
    const resource = new RateLimitedResource(
      "name",
      20,
      Duration.fromObject({ seconds: 10 })
    );

    expect(resource.getUniqueName()).toEqual("name");
    expect(resource.getAllowedCalls()).toEqual(20);
    expect(resource.getWindow()).toEqual(Duration.fromObject({ seconds: 10 }));
  });
});
