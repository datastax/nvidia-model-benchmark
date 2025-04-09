import { Configuration } from "./config";
import { getChunksFromUrl } from "./chunks";
import autocannon from "autocannon";

/**
 * Interface for benchmark results
 */
export interface BenchmarkResult {
  totalRequests: number;
  failedRequests: number;
  minLatency: number;
  medianLatency: number;
  p90Latency: number;
  p99Latency: number;
  maxLatency: number;
  requestsPerSecond: number;
}

/**
 * Generates chunks based on the mode
 * @param mode The mode ('query' or 'passage')
 * @returns An array of chunks
 */
async function generateChunks(mode: "query" | "passage"): Promise<string[]> {
  return getChunksFromUrl(
    "https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/",
    mode === "query" ? 20 : 300,
  );
}

/**
 * Generates a random batch of chunks
 * @param chunks The array of all available chunks
 * @param batchSize The size of the batch to generate
 * @returns A random batch of chunks
 */
function generateRandomBatch(chunks: string[], batchSize: number): string[] {
  const batch: string[] = [];
  for (let i = 0; i < batchSize; i++) {
    const randomIndex = Math.floor(Math.random() * chunks.length);
    batch.push(chunks[randomIndex]);
  }
  return batch;
}

/**
 * Runs the benchmark with the specified configuration
 * @param config The configuration
 * @returns A promise that resolves to the benchmark results
 */
export async function runBenchmark(
  config: Configuration,
): Promise<BenchmarkResult> {
  const numRequests = config.numRequests || 1000;

  console.log(`Starting benchmark with configuration:`);
  console.log(`  URL: ${config.url}/v1/embeddings`);
  console.log(`  Model: ${config.model}`);
  console.log(`  Mode: ${config.mode}`);
  console.log(`  Batch Size: ${config.batchSize}`);
  console.log(`  Concurrency: ${config.concurrency}`);
  console.log(`  Number of Requests: ${numRequests}`);

  // Generate chunks based on the mode
  const chunks = await generateChunks(config.mode);
  console.log(`Generated ${chunks.length} chunks for ${config.mode} mode`);

  const fullUrl = `${config.url}/v1/embeddings`;

  const cannonConfig: autocannon.Options = {
    connections: config.concurrency,
    amount: numRequests,
    url: fullUrl,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    requests: [
      {
        setupRequest: (req: any) => {
          req.body = JSON.stringify({
            input: generateRandomBatch(chunks, config.batchSize),
            model: config.model,
            input_type: config.mode,
            encoding_format: "float",
          });

          return req;
        },
      },
    ],
  };

  console.log(`Running benchmark with ${numRequests} requests...`);
  console.log(`Generating a new random batch for each request...`);

  // Run the benchmark
  const results = await new Promise<autocannon.Result>((resolve, reject) => {
    const instance = autocannon(
      cannonConfig,
      (err: Error | null, result: autocannon.Result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      },
    );

    // Track progress
    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: false,
      renderLatencyTable: false,
    });

    // This will fire if autocannon is cancelled
    process.once("SIGINT", () => {
      instance.stop();
    });
  });

  return {
    totalRequests: results.requests.total,
    failedRequests: results.non2xx,
    minLatency: results.latency.min,
    medianLatency: results.latency.p50,
    p90Latency: results.latency.p90,
    p99Latency: results.latency.p99,
    maxLatency: results.latency.max,
    requestsPerSecond: results.requests.average,
  };
}

/**
 * Formats the benchmark results for display
 * @param results The benchmark results
 * @returns A formatted string with the results
 */
export function formatResults(results: BenchmarkResult): string {
  return `
Benchmark Results:
-----------------
Total Requests: ${results.totalRequests}
Failed Requests: ${results.failedRequests}
Fail Rate: ${((results.failedRequests / results.totalRequests) * 100).toFixed(2)}%

Latency:
  Min: ${results.minLatency} ms
  Median: ${results.medianLatency.toFixed(2)} ms
  P90: ${results.p90Latency.toFixed(2)} ms
  P99: ${results.p99Latency.toFixed(2)} ms
  Max: ${results.maxLatency} ms

Throughput:
  Requests per second: ${results.requestsPerSecond.toFixed(2)}
`;
}

/**
 * Formats the benchmark results as a CSV row
 * @param config The benchmark configuration
 * @param results The benchmark results
 * @returns A CSV-formatted string with the results
 */
export function formatResultsAsCsv(
  config: Configuration,
  results: BenchmarkResult,
): string {
  // Calculate number of tokens based on mode and batch size
  // This is an approximation - in a real system you might want to calculate this more precisely
  const tokensPerChunk = config.mode === "query" ? 20 : 300;
  const numberOfTokens = tokensPerChunk * config.batchSize;

  // Format: model name, number of tokens, batch size, concurrency, min latency, median latency, p90 latency, p99 latency, max latency, throughput
  return `${config.model},${numberOfTokens},${config.batchSize},${config.concurrency},${results.minLatency},${results.medianLatency.toFixed(2)},${results.p90Latency.toFixed(2)},${results.p99Latency.toFixed(2)},${results.maxLatency},${results.requestsPerSecond.toFixed(2)}`;
}

// Example of how to use the exported runBenchmark function:
//
// import { runBenchmark, formatResults } from './benchmark';
// import { getConfiguration } from './config';
//
// async function main() {
//   try {
//     const config = getConfiguration();
//     // Set number of requests if needed
//     config.numRequests = 100;
//     const results = await runBenchmark(config);
//     console.log(formatResults(results));
//   } catch (error: unknown) {
//     console.error(
//       "Error:",
//       error instanceof Error ? error.message : String(error)
//     );
//     process.exit(1);
//   }
// }
//
// if (require.main === module) {
//   main();
// }
