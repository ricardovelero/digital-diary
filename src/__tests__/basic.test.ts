import { beforeAll, expect, test } from "vitest";

test("Jest is working", () => {
  expect(1 + 1).toBe(2);
});

beforeAll(() => {
  console.log("Before all tests");
});
