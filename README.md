# FitAi - AI-Powered Fitness Website

FitAi is a comprehensive fitness platform leveraging artificial intelligence to create personalized workout plans, offer nutritional guidance, and help users locate fitness resources near them.

## Features

- **Personalized Workout Plans**: Generate custom fitness routines based on goals, experience, and preferences
- **AI Fitness Assistant**: Chat with our AI to get fitness advice and answers to health questions
- **Gym & Park Locator**: Find fitness facilities and outdoor workout spaces near you using TomTom Maps
- **Workout Video Demos**: Upload your workout plan PDF to watch exercise demonstration videos
- **Mobile-Responsive Design**: Works seamlessly across all devices

## Deployment

The application is configured to be deployed on Vercel with proper environment variable handling for API keys.

### Environment Variables

The following environment variables need to be set up in your Vercel project:

- `TOMTOM_API_KEY`: For maps and location services
- `SERPER_API_KEY`: For web search capabilities
- `GROQ_API_KEY`: For AI chat functionality

### Deployment Steps

1. Fork or clone this repository
2. Set up a new Vercel project pointing to your repository
3. Add the required environment variables in the Vercel dashboard
4. Deploy!

## Local Development

1. Clone the repository
2. Create a `.env` file with the required API keys
3. Open the HTML files in your browser

## Technologies Used

- HTML5, CSS3, JavaScript
- TailwindCSS for styling
- Bootstrap components
- TomTom Maps API for location services
- Groq API for AI capabilities
- Serper for web search integration

## License

Copyright © 2025 FitAi. All rights reserved.
