import type { Credentials } from "../../../../config/authentication/types/credentials.types.js";

/**
 * The contract the login page object fulfils for the orchestrator.
 *
 * The orchestrator used to take `loginFn` and `validateFn` as bare callbacks. Both had
 * the type `() => Promise<void>`, so passing the failure validator to the success path
 * compiled cleanly — and nothing tied the two functions to the same page object. Naming
 * the contract makes both mistakes impossible to express.
 */
export interface LoginExecutor {
  /**
   * Performs the login interaction with the supplied credentials.
   * @param credentials - The username and password to submit.
   * @returns A promise that resolves once the credentials have been submitted.
   */
  login(credentials: Credentials): Promise<void>;

  /**
   * Asserts that the login succeeded.
   * @returns A promise that resolves when a successful login has been confirmed.
   */
  validateSuccess(): Promise<void>;

  /**
   * Asserts that the login was rejected.
   * @returns A promise that resolves when a rejected login has been confirmed.
   */
  validateFailure(): Promise<void>;
}

/** Which outcome a login flow expects, and therefore which validation it runs. */
export type LoginOutcome = "success" | "failure";
