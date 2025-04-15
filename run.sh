#!/bin/bash

# Check if configuration file is provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <conf_file>"
  exit 1
fi

CONF_FILE=$1

# Check if configuration file exists
if [ ! -f "$CONF_FILE" ]; then
  echo "Error: Configuration file '$CONF_FILE' not found"
  exit 1
fi

# Initialize variables
URL=""
MODEL=""
MODES=()
BATCH_SIZES=()
CONCURRENCIES=()

# Parse configuration file
while IFS= read -r line || [ -n "$line" ]; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi
  
  # Extract key and value
  key=$(echo "$line" | cut -d= -f1 | tr -d ' ')
  value=$(echo "$line" | cut -d= -f2-)
  
  case "$key" in
    URL)
      URL="$value"
      ;;
    MODEL)
      MODEL="$value"
      ;;
    MODE)
      # Convert space-separated string to array
      # First trim leading/trailing whitespace, then split on spaces
      trimmed_value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
      IFS=' ' read -r -a MODES <<< "$trimmed_value"
      ;;
    BATCH_SIZE)
      # Convert space-separated string to array
      # First trim leading/trailing whitespace, then split on spaces
      trimmed_value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
      IFS=' ' read -r -a BATCH_SIZES <<< "$trimmed_value"
      ;;
    CONCURRENCY)
      # Convert space-separated string to array
      # First trim leading/trailing whitespace, then split on spaces
      trimmed_value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
      IFS=' ' read -r -a CONCURRENCIES <<< "$trimmed_value"
      ;;
    *)
      echo "Warning: Unknown setting '$key' in configuration file"
      ;;
  esac
done < "$CONF_FILE"

if [ -z "$URL" ]; then
  echo "Error: URL is not set in configuration file"
  exit 1
fi

if [ -z "$MODEL" ]; then
  echo "Error: MODEL is not set in configuration file"
  exit 1
fi

# Use default values if arrays are empty
if [ ${#MODES[@]} -eq 0 ]; then
  MODES=("query" "passage")
fi

if [ ${#BATCH_SIZES[@]} -eq 0 ]; then
  BATCH_SIZES=(1 16 32 64)
fi

if [ ${#CONCURRENCIES[@]} -eq 0 ]; then
  CONCURRENCIES=(1 4 8 16)
fi

echo "Starting benchmark suite with:"
echo "  URL: $URL"
echo "  Model: $MODEL"
echo "  Modes: ${MODES[*]} (${#MODES[@]} modes)"
echo "  Batch Sizes: ${BATCH_SIZES[*]} (${#BATCH_SIZES[@]} sizes)"
echo "  Concurrencies: ${CONCURRENCIES[*]} (${#CONCURRENCIES[@]} concurrencies)"
echo "----------------------------------------"

# Function to run a single benchmark
run_benchmark() {
  local mode=$1
  local batch_size=$2
  local concurrency=$3

  echo "Running benchmark with mode='$mode', batchSize='$batch_size', concurrency='$concurrency'"
  npm run bench -- --url "$URL" --model "$MODEL" --mode "$mode" --batchSize "$batch_size" --concurrency "$concurrency"
  
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
