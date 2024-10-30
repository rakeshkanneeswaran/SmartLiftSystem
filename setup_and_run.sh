#!/bin/bash

# Change directory to raspberry_frontend
cd rapberry_frontend || { echo "Directory not found! Exiting."; exit 1; }

# Pull the latest changes from the main branch
echo "Pulling the latest changes from GitHub..."
git pull origin main

# Run the development server
echo "Running the development server..."
npm run dev
