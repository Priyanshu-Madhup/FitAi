/**
 * FitAi Configuration
 * Manages environment variables and API keys for the application
 */

// For client-side (browser) rendering, we need special handling since process.env isn't available
const getEnvVariable = (key, fallback = '') => {
  console.log(`Getting env variable: ${key}`);
  
  // In browser environment, check multiple sources
  if (typeof window !== 'undefined') {
    // First priority: window.ENV (set by our env-preload.js)
    if (window.ENV && window.ENV[key]) {
      console.log(`Found ${key} in window.ENV`);
      return window.ENV[key];
    }
    
    // Second priority: window.__env (injected by Vercel)
    if (window.__env && window.__env[key]) {
      console.log(`Found ${key} in window.__env`);
      return window.__env[key];
    }
    
    // Third priority: Next.js public variables
    const nextPublicKey = `NEXT_PUBLIC_${key}`;
    if (window[nextPublicKey]) {
      console.log(`Found ${key} as ${nextPublicKey}`);
      return window[nextPublicKey];
    }
    
    console.log(`Using fallback for ${key}`);
    return fallback;
  }
  
  // In Node.js environment (like build scripts)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key] || fallback;
    console.log(`Using Node process.env.${key}`);
    return value;
  }
  
  console.log(`No environment found, using fallback for ${key}`);
  return fallback;
};

// Configuration object to store all app settings and API keys
const config = {
  // API Keys (using only environment variables, no hardcoded fallbacks)
  apiKeys: {
    tomtom: getEnvVariable('TOMTOM_API_KEY', ''),
    serper: getEnvVariable('SERPER_API_KEY', ''),
    groq: getEnvVariable('GROQ_API_KEY', ''),
    groq: getEnvVariable('GROQ_API_KEY', '')
  },
  
  // API Base URLs
  apiBaseUrls: {
    tomtom: 'https://api.tomtom.com',
    serper: 'https://serper.dev/api',
    groq: 'https://api.groq.com/openai/v1'
  },
  
  // Map defaults
  mapDefaults: {
    initialLocation: {
      lat: 39.8283,
      lng: -98.5795
    },
    defaultZoom: 4,
    searchRadius: 10 // miles
  }
};

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Expose config to window object for browser usage
  window.FitAiConfig = config;
}

// For Node.js/module usage
if (typeof module !== 'undefined') {
  module.exports = config;
}
