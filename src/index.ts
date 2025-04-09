import { runBenchmark, formatResults, formatResultsAsCsv } from "./benchmark";
import { getConfiguration } from "./config";
import * as fs from "fs";
import * as path from "path";

/**
 * Appends benchmark results to the CSV file
 * @param config The benchmark configuration
 * @param results The benchmark results
 */
function appendResultsToCsv(config: any, results: any): void {
  const csvFilePath = path.resolve(process.cwd(), "result.csv");
  const csvRow = formatResultsAsCsv(config, results);

  // Check if file exists
  const fileExists = fs.existsSync(csvFilePath);

  if (!fileExists) {
    // Create file with headers if it doesn't exist
    const headers =
      "Model,Tokens,Batch size,Concurrency,Min (ms),Median (ms),P90 (ms),P99 (ms),Max (ms),Throughput";
    fs.writeFileSync(csvFilePath, headers + "\n");
  }

  // Append the results
  fs.appendFileSync(csvFilePath, csvRow + "\n");
  console.log(`Results appended to ${csvFilePath}`);
}

async function main() {
  try {
    const config = getConfiguration();
    const results = await runBenchmark(config);

    // Fail if there are any unsuccessful requests
    if (results.failedRequests > 0) {
      console.error(
        `Error: ${results.failedRequests} out of ${results.totalRequests} requests failed.`,
      );
      process.exit(1);
    }

    // Print results to console
    console.log(formatResults(results));

    // Append results to CSV file
    appendResultsToCsv(config, results);
  } catch (error: unknown) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}
