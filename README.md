# nvidia-model-benchmark

Performance benchmark for NVIDIA embedding models.

## Overview

This tool benchmarks NVIDIA embedding models by sending requests with various configurations and measuring performance metrics such as latency and throughput.

## Usage

### Running with a Configuration File

The benchmark suite now requires a configuration file to configure the benchmark parameters:

```bash
./run.sh my_bench.conf
```

Where `my_bench.conf` is a configuration file containing the benchmark parameters.

#### Configuration File Format

The configuration file uses a simple key-value format:

```
# Required parameters
URL=http://localhost:8000
MODEL=nvidia/nv-embed-base

# Optional parameters (comment out to use defaults)
# Space-separated values for arrays
MODE=query passage
BATCH_SIZE=1 16 32 64
CONCURRENCY=1 4 8 16
```

##### Required Parameters

- `URL`: The URL of the embedding service
- `MODEL`: The model name to use for embeddings

##### Optional Parameters

- `MODE`: Space-separated list of modes to test (default: "query passage")
- `BATCH_SIZE`: Space-separated list of batch sizes to test (default: "1 16 32 64")
- `CONCURRENCY`: Space-separated list of concurrency levels to test (default: "1 4 8 16")

An example configuration file is provided in `example.conf`.

## Results

Results are saved to `result.csv` in the current directory, with the following columns:

- Model: The model name
- Tokens: Number of tokens per chunk
- Batch size: Size of each batch
- Concurrency: Number of concurrent operations
- Min (ms): Minimum latency in milliseconds
- Median (ms): Median latency in milliseconds
- P90 (ms): 90th percentile latency in milliseconds
- P99 (ms): 99th percentile latency in milliseconds
- Max (ms): Maximum latency in milliseconds
- Throughput: Requests per second
