/**
 * FitAi Environment Variables Preloader
 * This script attempts to fetch environment variables from various sources
 * and makes them available to the application before other scripts run.
 */

(function() {
  console.log('Env preloader running');
  
  // Create a global ENV object to store environment variables if not already exists
  window.ENV = window.ENV || {};
    // For local development, you can manually set variables here
  // WARNING: Do not commit actual API keys to this file!
  const devVariables = {
    // For development only, use placeholder values
    TOMTOM_API_KEY: "JXPnqva3lZanMKstFTttkppZnHor4IXr",
    SERPER_API_KEY: "67c090a334109db4480037614dbb1c635f29ad83",
    GROQ_API_KEY: "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",
    YOUTUBE_API_KEY: "" // Add your YouTube API key here for development
  };
  
  // Try to get variables from various sources
  // 1. Check for window.__env (Vercel runtime variables)
  // 2. Check for NEXT_PUBLIC_* variables (Next.js convention)
  // 3. Fall back to dev variables for local development
  
  const vercelVars = window.__env || {};
  const nextPublicVars = {};
  
  // Look for Next.js public variables if they exist
  if (typeof window !== 'undefined') {
    Object.keys(window).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const envKey = key.replace('NEXT_PUBLIC_', '');
        nextPublicVars[envKey] = window[key];
      }
    });
  }
  
  // Merge variables with correct precedence
  window.ENV = {
    ...devVariables,         // Lowest priority 
    ...nextPublicVars,       // Medium priority
    ...vercelVars            // Highest priority
  };
  
  console.log("Environment variables loaded:", {
    hasVercelVars: Object.keys(vercelVars).length > 0,
    hasNextVars: Object.keys(nextPublicVars).length > 0,
    hasDevFallbacks: Object.keys(devVariables).length > 0
  });
})();
