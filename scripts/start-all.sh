#!/bin/bash

# Start both frontend and backend servers

echo "🚀 Starting Solvance Development Environment..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting Backend (Bun.js)..."
cd backend
bun run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend (Next.js)..."
pnpm dev &
FRONTEND_PID=$!

echo ""
echo "✅ All servers started!"
echo ""
echo "📡 Backend:  http://localhost:3001"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for all background jobs
wait
