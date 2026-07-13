import * as os from "os";
import DateFormatter from "../../utils/shared/dateFormatter.js";
import EnvironmentDetector from "../resolution/detector/environmentDetector.js";
import type { OrtoniReportConfig } from "ortoni-report";

// The Ortoni report is generated once — locally per run, or in CI during the
// merge phase from the combined blob reports — so it always uses a single,
// non-sharded output location.
export const reportConfig: OrtoniReportConfig = {
  open: EnvironmentDetector.isCI() ? "never" : "always",
  folderPath: "ortoni-report",
  filename: "index.html",
  title: "<Project Name> Automation Report",
  projectName: "<Project Name>",
  testType: `${(process.env.TEST_TAGS ?? "Functional").replace(/^@/, "")} tests`,
  authorName: os.userInfo().username,
  base64Image: false,
  stdIO: false,
  meta: {
    "Test Cycle": DateFormatter.formatMonthYear(),
    version: "1.0.0",
    platform: os.type(),
  },
};
