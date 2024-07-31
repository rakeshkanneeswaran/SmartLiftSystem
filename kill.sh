#!/bin/bash

# Function to check and kill process running on specific ports
kill_port() {
  PORT=$1
  PID=$(lsof -t -i:$PORT)
  if [ ! -z "$PID" ]; then
    echo "Killing process on port $PORT (PID: $PID)"
    kill -9 $PID
  else
    echo "No process running on port $PORT"
  fi
}

# Check and kill processes on ports 3000, 3001, 3002
for PORT in 3000 3001 3002; do
  kill_port $PORT
done