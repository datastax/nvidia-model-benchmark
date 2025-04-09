declare module "autocannon" {
  import { IncomingHttpHeaders } from "http";

  namespace autocannon {
    interface Options {
      url: string;
      socketPath?: string;
      connections?: number;
      duration?: number | string;
      amount?: number;
      timeout?: number;
      pipelining?: number;
      bailout?: number;
      method?: string;
      title?: string;
      body?: string | Buffer;
      headers?: Record<string, string>;
      setupClient?: (client: any) => any;
      maxConnectionRequests?: number;
      maxOverallRequests?: number;
      connectionRate?: number;
      overallRate?: number;
      reconnectRate?: number;
      requests?: Request[];
      idReplacement?: boolean;
      forever?: boolean;
      servername?: string;
      excludeErrorStats?: boolean;
      workers?: number;
      sampleInt?: number;
      form?: string | object;
      initialContext?: object;
      verifyBody?: (body: any) => boolean;
      ignoreCoordinatedOmission?: boolean;
      har?: object;
      expectBody?: string;
      tlsOptions?: object;
      skipAggregateResult?: boolean;
      debug?: boolean;
    }

    interface Request {
      body?: string | Buffer;
      headers?: Record<string, string>;
      method?: string;
      path?: string;
      setupRequest?: (req: any) => any;
    }

    interface Instance {
      stop(): void;
      on(event: string, listener: (...args: any[]) => void): this;
    }

    interface Histogram {
      total: number;
      average: number;
      mean: number;
      stddev: number;
      min: number;
      max: number;
      p0_001: number;
      p0_01: number;
      p0_1: number;
      p1: number;
      p2_5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p97_5: number;
      p99: number;
      p99_9: number;
      p99_99: number;
      p99_999: number;
    }

    interface Result {
      title?: string;
      url: string;
      socketPath?: string;
      requests: Histogram & { sent: number };
      latency: Histogram;
      throughput: Histogram;
      duration: number;
      errors: number;
      timeouts: number;
      start: Date;
      finish: Date;
      connections: number;
      pipelining: number;
      non2xx: number;
      "1xx": number;
      "2xx": number;
      "3xx": number;
      "4xx": number;
      "5xx": number;
      mismatches: number;
      resets: number;
      statusCodeStats?: Record<string, { count?: number }>;
    }

    interface TrackingOptions {
      outputStream?: NodeJS.WritableStream;
      renderProgressBar?: boolean;
      renderResultsTable?: boolean;
      renderLatencyTable?: boolean;
      progressBarString?: string;
    }

    function track(instance: Instance, options?: TrackingOptions): void;
  }

  function autocannon(
    options: autocannon.Options,
    callback?: (err: Error | null, result: autocannon.Result) => void,
  ): autocannon.Instance;

  export = autocannon;
}
