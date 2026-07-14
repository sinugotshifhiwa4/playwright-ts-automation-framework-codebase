import type { TestInfo } from "@playwright/test";

/**
 * Tags that mark a test as not needing authentication setup.
 * Declared lowercase, because extractTags normalizes every tag to lowercase before matching.
 */
const AUTH_SKIP_TAGS = new Set(["@skip-auth"]);

/** Matches an `@tag` token anywhere in a test's title path. */
const TAG_PATTERN = /@\S+/g;

/**
 * Evaluates whether authentication setup should be skipped for a test run.
 */
export default class AuthenticationSkipEvaluator {
  /**
   * Determines if authentication should be skipped for a test based on its tags.
   * @param testInfo - Playwright TestInfo object.
   * @returns True if authentication setup should be skipped, otherwise false.
   */
  public static shouldSkipAuthentication(testInfo: TestInfo): boolean {
    return this.extractTags(testInfo).some((tag) => AUTH_SKIP_TAGS.has(tag));
  }

  /**
   * Extracts normalized tags from Playwright metadata and title text.
   * Both sources are read because a tag may be declared in the test's `tag` option
   * or written inline in its title, and either must skip authentication.
   * @param testInfo - Playwright TestInfo object.
   * @returns Lowercased unique tag values for the current test.
   */
  private static extractTags(testInfo: TestInfo): string[] {
    const titleTokens = testInfo.titlePath.join(" ").match(TAG_PATTERN) ?? [];

    return [...new Set([...testInfo.tags, ...titleTokens])].map((tag) =>
      tag.toLowerCase(),
    );
  }
}
