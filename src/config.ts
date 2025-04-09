import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/**
 * Configuration interface for the application
 */
export interface Configuration {
  /**
   * Number of concurrent operations
   */
  concurrency: number;

  /**
   * Size of each batch
   */
  batchSize: number;

  /**
   * Mode of operation: 'query' or 'passage'
   */
  mode: "query" | "passage";

  /**
   * URL to connect to
   */
  url: string;

  /**
   * Model to use
   */
  model: string;

  /**
   * Number of requests to make
   */
  numRequests?: number;
}

/**
 * Parse command line arguments and environment variables to create configuration
 * @returns Configuration object
 */
export function getConfiguration(): Configuration {
  const argv = yargs(hideBin(process.argv))
    .options({
      concurrency: {
        type: "number",
        demandOption: true,
        describe: "Number of concurrent operations",
        alias: "c",
      },
      batchSize: {
        type: "number",
        demandOption: true,
        describe: "Size of each batch",
        alias: "b",
      },
      mode: {
        type: "string",
        choices: ["query", "passage"],
        demandOption: true,
        describe: "Mode of operation",
        alias: "m",
      },
      url: {
        type: "string",
        describe:
          "URL to connect to (can also be set via URL_ENDPOINT env var)",
        alias: "u",
      },
      model: {
        type: "string",
        describe: "Model to use (can also be set via MODEL_NAME env var)",
        alias: "M",
      },
      numRequests: {
        type: "number",
        describe: "Number of requests to make (default: 1000)",
        alias: "n",
      },
    })
    .help()
    .alias("help", "h")
    .parseSync();

  // Get URL from command line or environment variable
  const url = argv.url || process.env.URL_ENDPOINT;
  if (!url) {
    throw new Error(
      "URL must be provided via --url flag or URL_ENDPOINT environment variable",
    );
  }

  // Get model from command line or environment variable
  const model = argv.model || process.env.MODEL_NAME;
  if (!model) {
    throw new Error(
      "Model must be provided via --model flag or MODEL_NAME environment variable",
    );
  }

  return {
    concurrency: argv.concurrency,
    batchSize: argv.batchSize,
    mode: argv.mode as "query" | "passage",
    url,
    model,
    numRequests: argv.numRequests,
  };
}

/**
 * Example usage:
 *
 * import { getConfiguration } from './config';
 *
 * try {
 *   const config = getConfiguration();
 *   console.log('Configuration:', config);
 *   // Use config in your application
 * } catch (error) {
 *   console.error('Error:', error.message);
 *   process.exit(1);
 * }
 */
