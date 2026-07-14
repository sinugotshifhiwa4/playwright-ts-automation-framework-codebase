import { test as configTest, expect } from "./config.fixtures.js";
import AuthenticationSkipEvaluator from "../src/config/authentication/evaluators/authenticationSkipEvaluator.js";
import AuthenticationFileManager from "../src/config/authentication/storage/authenticationFileManager.js";
import { AuthenticationStateManager } from "../src/layers/ui/authentication/authenticationStateManager.js";
import { LoginCoordinator } from "../src/layers/ui/authentication/loginCoordinator.js";
import { PageActionsContainer } from "../src/layers/ui/base/internal/pageActionsContainer.js";
import { BrowserContextManager } from "../src/layers/ui/context/browserContextManager.js";
import { TestContext } from "../src/layers/ui/context/testContext.js";

interface TestFixtures {
  // Context
  testContext: TestContext;
  browserContextManager: BrowserContextManager;

  // Authentication
  authenticationStateManager: AuthenticationStateManager;
  loginCoordinator: LoginCoordinator;
}

export const test = configTest.extend<TestFixtures>({
  // Context

  testContext: async ({}, use) => {
    await use(new TestContext());
  },

  browserContextManager: async ({ browser }, use) => {
    await use(new BrowserContextManager(browser));
  },

  // Authentication

  authenticationStateManager: async ({}, use) => {
    await use(new AuthenticationStateManager());
  },

  loginCoordinator: async (
    { page, environmentResolver, authenticationStateManager },
    use,
  ) => {
    const { navigation } = new PageActionsContainer(page);

    await use(
      new LoginCoordinator(
        page,
        navigation,
        environmentResolver,
        authenticationStateManager,
      ),
    );
  },

  /**
   * Resolves the storage state file path for the current test.
   * Returns undefined if the test is tagged with @skip-auth, otherwise returns the shared auth file path.
   */
  storageState: async ({}, use, testInfo) => {
    const shouldSkipAuth = AuthenticationSkipEvaluator.shouldSkipAuthentication(testInfo);

    if (shouldSkipAuth) {
      await use(undefined);
      return;
    }

    await use(AuthenticationFileManager.getFilePath());
  },
});

export { expect };
