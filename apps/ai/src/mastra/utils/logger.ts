// Helper function for consistent logging
export function logStep(stepName: string, emoji: string, message: string, data?: any) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${emoji} [${stepName.toUpperCase()}] ${message}`);
  if (data) {
    console.log(`[${timestamp}] ${emoji} [${stepName.toUpperCase()}] Data:`, JSON.stringify(data, null, 2));
  }
}

export function logError(stepName: string, error: any, context?: any) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.error(`[${timestamp}] ❌ [${stepName.toUpperCase()}] ERROR:`, error);
  if (context) {
    console.error(`[${timestamp}] ❌ [${stepName.toUpperCase()}] Context:`, context);
  }
}

export function logTiming(stepName: string, startTime: number, message?: string) {
  const duration = Date.now() - startTime;
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ⏱️  [${stepName.toUpperCase()}] ${message || 'Completed'} - Duration: ${duration}ms`);
} 