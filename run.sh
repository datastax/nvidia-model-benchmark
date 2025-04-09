#!/bin/bash

# Check if URL and MODEL environment variables are set
if [ -z "$URL" ]; then
  echo "Error: URL environment variable is not set"
  exit 1
fi

if [ -z "$MODEL" ]; then
  echo "Error: MODEL environment variable is not set"
  exit 1
fi

echo "Starting benchmark suite with:"
echo "  URL: $URL"
echo "  Model: $MODEL"
echo "----------------------------------------"

# Define parameter arrays
MODES=("query" "passage")
BATCH_SIZES=(1 16 32 64)
CONCURRENCIES=(1 4 8 16)

# Function to run a single benchmark
run_benchmark() {
  local mode=$1
  local batch_size=$2
  local concurrency=$3
  
  # Run the benchmark
  npm run bench -- --mode "$mode" --batchSize "$batch_size" --concurrency "$concurrency"
  
  # Check if benchmark was successful
  if [ $? -eq 0 ]; then
    echo "SUCCESS"
  else
    echo "FAILED"
  fi
}

# Run benchmarks for all combinations
TOTAL_RUNS=$((${#MODES[@]} * ${#BATCH_SIZES[@]} * ${#CONCURRENCIES[@]}))
CURRENT_RUN=0

echo "Total benchmark combinations to run: $TOTAL_RUNS"
echo "----------------------------------------"

for mode in "${MODES[@]}"; do
  for batch_size in "${BATCH_SIZES[@]}"; do
    for concurrency in "${CONCURRENCIES[@]}"; do
      CURRENT_RUN=$((CURRENT_RUN + 1))
      echo ""
      echo "----------------------------------------"
      echo "Run $CURRENT_RUN of $TOTAL_RUNS"
      run_benchmark "$mode" "$batch_size" "$concurrency"
    done
  done
done

echo "----------------------------------------"
echo "Benchmark suite completed!"
