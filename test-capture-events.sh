#!/bin/bash

echo "🔍 Testing SSE Event Capture"
echo "============================"
echo ""

# Test with a simple URL
echo "📡 Creating web and capturing all SSE events..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:2102/api/test-stream/capture \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "prompt": "Analyze this example page"
  }')

# Check if request was successful
SUCCESS=$(echo $RESPONSE | jq -r '.success')

if [ "$SUCCESS" != "true" ]; then
  echo "❌ Request failed:"
  echo $RESPONSE | jq '.'
  exit 1
fi

# Extract key information
WEB_ID=$(echo $RESPONSE | jq -r '.webId')
INITIAL_STATUS=$(echo $RESPONSE | jq -r '.initialStatus')
FINAL_STATUS=$(echo $RESPONSE | jq -r '.finalStatus')
RUN_ID=$(echo $RESPONSE | jq -r '.runId')
TOTAL_EVENTS=$(echo $RESPONSE | jq -r '.totalEvents')
DURATION=$(echo $RESPONSE | jq -r '.durationMs')

echo "✅ Web Analysis Complete!"
echo ""
echo "📊 Summary:"
echo "  - Web ID: $WEB_ID"
echo "  - Run ID: $RUN_ID"
echo "  - Initial Status: $INITIAL_STATUS"
echo "  - Final Status: $FINAL_STATUS"
echo "  - Total Events: $TOTAL_EVENTS"
echo "  - Duration: ${DURATION}ms"
echo ""

# Show final web data
echo "🎯 Final Web Data:"
echo $RESPONSE | jq '.finalWeb'
echo ""

# Show all captured events
echo "📡 Captured SSE Events:"
echo "======================"
echo ""

# Pretty print each event with timing
echo $RESPONSE | jq -r '.events[] | "[\(.elapsedMs // 0)ms] Type: \(.type)\n\(. | tostring)\n---"'

# Save full response to file for analysis
echo $RESPONSE | jq '.' > capture-result.json
echo ""
echo "💾 Full response saved to capture-result.json" 