import { Template } from "./Template";

describe("Template", () => {
  test("it works", () => {
    expect(new Template().hello()).toEqual("world");
  });
});
