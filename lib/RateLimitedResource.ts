import { Duration } from "luxon";

export class RateLimitedResource {
  constructor(
    private readonly uniqueName: string,
    private readonly allowedCalls: number,
    private readonly window: Duration
  ) {
    if (!this.uniqueName) {
      throw new Error("Unique name cannot be empty!");
    }

    if (this.allowedCalls <= 0) {
      throw new Error("Allowed calls needs to be an integer higher than zero!");
    }
  }

  getUniqueName() {
    return this.uniqueName;
  }

  getAllowedCalls() {
    return this.allowedCalls;
  }

  getWindow() {
    return this.window;
  }
}
