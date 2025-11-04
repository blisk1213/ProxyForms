import { test, expect } from "vitest";
import { slugify } from "./slugify";

test("slugify", () => {
  expect(slugify("John Doe")).toBe("john-doe");
  expect(slugify("John Doe 123")).toBe("john-doe-123");
  expect(slugify("John Doe 123!")).toBe("john-doe-123");
  expect(slugify("John Doe 123!@#$%^&*()")).toBe("john-doe-123");
  expect(slugify("hello/world/test")).toBe("hello-world-test");
});
