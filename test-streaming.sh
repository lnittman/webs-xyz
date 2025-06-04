#!/bin/bash

echo "🚀 Testing Web Analysis Streaming Workflow"
echo "========================================="

# Step 1: Create a web and start analysis
echo -e "\n1️⃣ Creating web and starting analysis..."
RESPONSE=$(curl -s -X POST http://localhost:2102/api/test-stream \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://news.ycombinator.com",
    "prompt": "Analyze the latest tech news"
  }')

echo "Response: $RESPONSE"

# Extract webId from response
WEB_ID=$(echo $RESPONSE | jq -r '.webId')
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$WEB_ID" = "null" ]; then
  echo "❌ Failed to create web"
  exit 1
fi

echo "✅ Web created with ID: $WEB_ID"
echo "📊 Initial status: $STATUS"

# Step 2: Connect to SSE stream
echo -e "\n2️⃣ Connecting to SSE stream..."
echo "Stream URL: http://localhost:2102/api/test-stream?webId=$WEB_ID"
echo -e "\n📡 Streaming events (press Ctrl+C to stop):\n"

# Use curl to connect to SSE stream and format output
curl -N -H "Accept: text/event-stream" \
  "http://localhost:2102/api/test-stream?webId=$WEB_ID" 2>/dev/null | \
  while IFS= read -r line; do
    if [[ $line == data:* ]]; then
      # Extract JSON from data: line
      json="${line#data: }"
      if [ ! -z "$json" ] && [ "$json" != " " ]; then
        # Pretty print the JSON with timestamp
        echo -n "[$(date '+%H:%M:%S')] "
        echo "$json" | jq -C '.' 2>/dev/null || echo "$json"
        echo ""
      fi
    fi
  done 