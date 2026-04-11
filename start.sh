#!/usr/bin/env bash
# Start both MindMirror services concurrently

set -e

echo "Starting MindMirror..."

# Start Python TRIBE v2 sidecar in background
echo "  → Starting TRIBE v2 sidecar on :8000"
cd brain-service
python main.py &
BRAIN_PID=$!
cd ..

# Give the sidecar a moment to begin loading the model
sleep 2

# Start Next.js frontend
echo "  → Starting Next.js on :3000"
npm run dev &
NEXT_PID=$!

echo ""
echo "MindMirror running:"
echo "  Frontend: http://localhost:3000"
echo "  Brain API: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop both services."

# Wait and forward SIGINT/SIGTERM to children
trap "kill $BRAIN_PID $NEXT_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait $BRAIN_PID $NEXT_PID
