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

# Navigate to backend folder and start the backend server in detached mode
echo "Starting backend server..."
cd backend
nohup npm run start &

# Navigate back to root
cd ..

# Navigate to operatorapp folder and start the development server in detached mode
echo "Starting operatorapp development server..."
cd operatorapp
nohup npm run dev &

# Navigate back to root
cd ..

# Navigate to liftapp folder and start the development server in detached mode
echo "Starting liftapp development server..."
cd liftapp
nohup npm run dev &

# Navigate back to root
cd ..
