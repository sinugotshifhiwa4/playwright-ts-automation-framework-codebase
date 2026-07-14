import { test as baseTest, expect, type TestInfo } from "@playwright/test";
import { EnvironmentResolver } from "../src/config/environment/resolution/resolver/environmentResolver.js";

interface TestFixtures {
  testInfo: TestInfo;

  environmentResolver: EnvironmentResolver;

  // Pages
}

export const test = baseTest.extend<TestFixtures>({
  testInfo: async ({}, use, testInfo: TestInfo) => {
    await use(testInfo);
  },

  // Configuration

  environmentResolver: async ({}, use) => {
    await use(new EnvironmentResolver());
  },
});

export { expect };
