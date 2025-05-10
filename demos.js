/**
 * FitAi - Workout Demos
 * This file provides the functionality for the demos.html page
 * It processes uploaded PDFs using PDF.js, extracts exercise names,
 * and finds YouTube videos for each exercise using Serper API
 */

// Debug information
console.log('demos.js loaded');
console.log('Environment check:', {
    hasWindow: typeof window !== 'undefined',
    hasConfig: typeof window !== 'undefined' && !!window.FitAiConfig,
    hasGroq: typeof window !== 'undefined' && window.FitAiConfig && !!window.FitAiConfig.apiKeys && !!window.FitAiConfig.apiKeys.groq,
    hasSerper: typeof window !== 'undefined' && window.FitAiConfig && !!window.FitAiConfig.apiKeys && !!window.FitAiConfig.apiKeys.serper,
    hasEnv: typeof window !== 'undefined' && !!window.__env
});

// Get API keys with fallback mechanisms
const GROQ_API_KEY = 
    (typeof window !== 'undefined' && window.FitAiConfig && window.FitAiConfig.apiKeys && window.FitAiConfig.apiKeys.groq) || 
    (typeof window !== 'undefined' && window.__env && window.__env.GROQ_API_KEY) ||
    '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'; // Fallback for debugging only

const SERPER_API_KEY = 
    (typeof window !== 'undefined' && window.FitAiConfig && window.FitAiConfig.apiKeys && window.FitAiConfig.apiKeys.serper) || 
    (typeof window !== 'undefined' && window.__env && window.__env.SERPER_API_KEY) ||
    'bead06c1090f8b45c3aabced3c5f723d5c5c3148'; // Fallback for debugging only

// DOM elements
const fileUpload = document.getElementById('pdf-upload');
const fileName = document.getElementById('file-name');
const processButton = document.getElementById('process-pdf');
const loadingContainer = document.getElementById('loading-container');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const resultsContainer = document.getElementById('results-container');
const videoCards = document.getElementById('video-cards');
const videoModal = document.getElementById('video-modal');
const modalTitle = document.getElementById('modal-title');
const youtubeIframe = document.getElementById('youtube-iframe');
const closeModal = document.getElementById('close-modal');

// Store the extracted exercises
let extractedExercises = [];

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.5.141/build/pdf.worker.min.js';

// File upload event handler
fileUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileIcon = document.getElementById('file-icon');
    const fileNameText = fileName.querySelector('span');
    
    if (file) {
        // Check if it's a PDF
        if (file.type !== 'application/pdf') {
            fileNameText.textContent = 'Please select a PDF file.';
            fileIcon.classList.add('hidden');
            processButton.disabled = true;
            return;
        }
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            fileNameText.textContent = 'File is too large. Please select a file under 5MB.';
            fileIcon.classList.add('hidden');
            processButton.disabled = true;
            return;
        }
        
        // Show file icon and name
        fileIcon.classList.remove('hidden');
        fileNameText.textContent = file.name;
        processButton.disabled = false;
        
        // Add success effect to upload area
        const uploadLabel = document.querySelector('label[for="pdf-upload"]');
        uploadLabel.classList.add('border-primary');
        uploadLabel.classList.add('bg-primary/10');
    } else {
        fileNameText.textContent = '';
        fileIcon.classList.add('hidden');
        processButton.disabled = true;
    }
});

// Process PDF button click handler
processButton.addEventListener('click', async function() {
    const file = fileUpload.files[0];
    
    if (!file) {
        showError('Please select a PDF file.');
        return;
    }
    
    // Show loading indicator
    loadingContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    processButton.disabled = true;
    
    try {
        // Read the PDF file
        const pdfData = await readPDFFile(file);
        
        // Extract exercise names using Groq AI
        extractedExercises = await extractExercisesWithGroq(pdfData);
        
        if (extractedExercises.length === 0) {
            throw new Error('No exercises found in the PDF. Please make sure you uploaded a workout plan PDF generated from FitAi.');
        }
        
        // Find videos for each exercise
        await findAndDisplayVideos(extractedExercises);
        
        // Show results
        loadingContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error processing PDF:', error);
        showError(error.message || 'An error occurred while processing the PDF.');
        loadingContainer.classList.add('hidden');
    }
});

// Read PDF file using PDF.js
async function readPDFFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(event) {
            try {
                const arrayBuffer = event.target.result;
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                
                let fullText = '';
                
                // Extract text from each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + ' ';
                }
                
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function(event) {
            reject(new Error('Failed to read the PDF file.'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// Extract exercise names using Groq's Llama3.3 API
async function extractExercisesWithGroq(pdfText) {
    const prompt = `
    You are an AI assistant specialized in fitness. The following text was extracted from a workout plan PDF.
    Please identify all exercise names mentioned in this text and return them as a JSON array of strings.
    Only include proper exercise names, not section titles or other text. Remove any duplicate exercises.
    If there are variations of the same exercise (e.g., "Barbell Squat" and "Barbell Back Squat"), keep both.
    
    PDF Text:
    ${pdfText}
    
    Return only a JSON array of exercise names, nothing else. Format: ["Exercise 1", "Exercise 2", ...]
    `;
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    { role: 'system', content: 'You are a fitness expert assistant that extracts exercise names from text.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2,
                max_tokens: 1024
            })
        });
        
        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }
        
        const data = await response.json();
        const exerciseText = data.choices[0].message.content.trim();
        
        // Extract the JSON array from the text response
        let jsonMatch = exerciseText.match(/\[.*\]/s);
        if (!jsonMatch) {
            throw new Error('Could not parse the exercise list from AI response');
        }
        
        // Parse the JSON array
        let exercises = JSON.parse(jsonMatch[0]);
        return exercises;
    } catch (error) {
        console.error('Error extracting exercises with Groq:', error);
        throw new Error('Failed to extract exercises from the PDF. Please try again.');
    }
}

// Find YouTube videos for exercises using Serper API
async function findAndDisplayVideos(exercises) {
    // Clear previous results
    videoCards.innerHTML = '';
    
    // Add a loading section for better UX
    const loadingElement = document.createElement('div');
    loadingElement.className = 'col-span-full flex items-center justify-center py-10';
    loadingElement.innerHTML = `
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mr-3"></div>
        <p class="text-gray-600">Finding video demonstrations...</p>
    `;
    videoCards.appendChild(loadingElement);
    
    // Process up to 12 exercises
    const exercisesToProcess = exercises.slice(0, 12);
    
    // Create a set of promises for parallel processing
    const videoPromises = exercisesToProcess.map(async (exercise) => {
        try {
            const videoInfo = await searchYouTubeVideo(exercise);
            return { exercise, videoInfo };
        } catch (error) {
            console.error(`Error finding video for ${exercise}:`, error);
            return { exercise, videoInfo: null };
        }
    });
    
    // Wait for all video searches to complete
    const results = await Promise.all(videoPromises);
    
    // Remove loading element
    videoCards.innerHTML = '';
      // Filter out exercises with no video results
    const successfulResults = results.filter(result => result.videoInfo !== null);
    
    // Store video results globally for later use in modal functions
    window.allVideoResults = successfulResults;
    
    // Display video cards (using async function for better thumbnails)
    const createCardPromises = successfulResults.map(async result => {
        const { exercise, videoInfo } = result;
        await createVideoCard(exercise, videoInfo);
    });
    
    // Wait for all cards to be created
    await Promise.all(createCardPromises);
    
    // Show message if no videos were found
    if (successfulResults.length === 0) {
        videoCards.innerHTML = `
            <div class="col-span-full text-center py-10">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h18M3 16h18"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-500 mb-2">No Videos Found</h3>
                <p class="text-gray-500">We couldn't find any videos for the exercises in your workout plan. Please try a different PDF.</p>
            </div>
        `;
    }
}

// Search for YouTube video using Serper API
async function searchYouTubeVideo(exerciseName) {
    const query = `${exerciseName} exercise tutorial proper form`;
    
    try {
        const response = await fetch('https://google.serper.dev/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': SERPER_API_KEY
            },
            body: JSON.stringify({
                q: query,
                gl: 'us',
                hl: 'en',
                num: 5
            })
        });
        
        if (!response.ok) {
            throw new Error(`Serper API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if there are video results
        if (!data.videos || data.videos.length === 0) {
            return null;
        }
        
        // Find the most relevant video (preferably from a fitness channel)
        const preferredChannels = ['ATHLEAN-X', 'Jeremy Ethier', 'Jeff Nippard', 'FitnessBlender', 'Buff Dudes', 
                                  'THENX', 'Bodybuilding.com', 'Calisthenicmovement', 'Fitness FAQs'];
        
        let bestVideo = null;
        
        // Try to find a video from preferred channels first
        for (const video of data.videos) {
            const channelName = video.channelName || '';
            if (preferredChannels.some(channel => channelName.includes(channel))) {
                bestVideo = video;
                break;
            }
        }
        
        // If no preferred channel found, use the first result
        if (!bestVideo && data.videos.length > 0) {
            bestVideo = data.videos[0];
        }
        
        if (!bestVideo) {
            return null;
        }
        
        // Extract video ID from link
        const videoIdMatch = bestVideo.link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (!videoIdMatch) {
            return null;
        }
        
        const videoId = videoIdMatch[1];
        
        return {
            title: bestVideo.title,
            thumbnail: bestVideo.thumbnail,
            channelName: bestVideo.channelName || 'YouTube Channel',
            link: bestVideo.link,
            videoId: videoId,
            duration: bestVideo.duration || ''
        };
    } catch (error) {
        console.error('Error searching YouTube video:', error);
        return null;
    }
}

// Fetch exercise logo/thumbnail from Serper API
async function fetchExerciseLogo(exercise) {
    const query = `${exercise} exercise logo icon fitness`;
    
    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': SERPER_API_KEY
            },
            body: JSON.stringify({
                q: query,
                gl: 'us',
                hl: 'en',
                num: 5,
                type: 'images'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Serper API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if there are image results
        if (!data.images || data.images.length === 0) {
            return null;
        }
        
        // Find suitable logo images (prefer transparent or isolated images)
        const suitableImages = data.images.filter(img => 
            img.title.toLowerCase().includes('icon') || 
            img.title.toLowerCase().includes('logo') || 
            img.title.toLowerCase().includes('transparent') ||
            img.title.toLowerCase().includes('isolated') ||
            img.title.toLowerCase().includes('exercise')
        );
        
        // Return the first suitable image or the first image if no suitable ones found
        return suitableImages.length > 0 ? suitableImages[0].imageUrl : data.images[0].imageUrl;
    } catch (error) {
        console.error('Error fetching exercise logo:', error);
        return null;
    }
}

// Create video card element
async function createVideoCard(exercise, videoInfo) {
    // Try to get a better logo/thumbnail for the exercise
    let logoUrl = null;
    try {
        logoUrl = await fetchExerciseLogo(exercise);
    } catch (error) {
        console.error(`Error fetching logo for ${exercise}:`, error);
    }
    
    // Use the logo if available, otherwise use the video thumbnail
    const thumbnailUrl = logoUrl || videoInfo.thumbnail;
    
    const card = document.createElement('div');
    card.className = 'video-card bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl';
    
    card.innerHTML = `
        <div class="video-card-inner">
            <div class="relative overflow-hidden">
                <img class="exercise-image w-full object-cover h-48" src="${thumbnailUrl}" alt="${exercise} thumbnail">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
                <div class="absolute bottom-2 left-2 right-2">
                    <span class="inline-block px-3 py-1 bg-primary text-white text-xs rounded-full">${exercise}</span>
                </div>
            </div>
            <div class="video-card-body p-4">
                <h3 class="text-lg font-semibold text-dark mb-2">${exercise}</h3>
                <p class="text-gray-600 text-sm mb-3">
                    <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                        </svg>
                        ${videoInfo.channelName}
                    </span>
                </p>
                <div class="video-card-footer">
                    <button class="play-video-btn btn-secondary w-full flex items-center justify-center" data-video-id="${videoInfo.videoId}" data-exercise="${exercise}">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Watch Demo
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add the card to the grid
    videoCards.appendChild(card);
    
    // Add event listener to play button
    const playButton = card.querySelector('.play-video-btn');
    playButton.addEventListener('click', function() {
        const videoId = this.dataset.videoId;
        const exercise = this.dataset.exercise;
        openVideoModal(videoId, exercise);
    });
    
    // Also add click event to the image for better UX
    const thumbnailImage = card.querySelector('.exercise-image');
    thumbnailImage.addEventListener('click', function() {
        openVideoModal(videoInfo.videoId, exercise);
    });
}

// Open video modal
function openVideoModal(videoId, exercise) {
    // Set modal content
    modalTitle.querySelector('span').textContent = `${exercise} - Demo`;
    youtubeIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    
    // Set channel info if available
    const channelInfo = document.getElementById('video-channel-info');
    // Find the video info by videoId
    const videoInfo = findVideoInfoById(videoId);
    if (videoInfo && videoInfo.channelName) {
        channelInfo.textContent = `From: ${videoInfo.channelName}`;
    } else {
        channelInfo.textContent = '';
    }
    
    // Set the YouTube link
    const youtubeLink = document.getElementById('open-youtube-link');
    youtubeLink.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Show modal with animation
    videoModal.classList.remove('hidden');
    // Use setTimeout to trigger the transitions after the display property is set
    setTimeout(() => {
        videoModal.classList.add('opacity-100');
        document.getElementById('modal-content').classList.add('scale-100');
        document.getElementById('modal-content').classList.remove('scale-95');
    }, 10);
    
    // Add event listener to close when clicking outside the modal content
    videoModal.addEventListener('click', function(event) {
        if (event.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', closeModalOnEscape);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Find video info by videoId
function findVideoInfoById(videoId) {
    // Flatten the successful results to get all video infos
    const allVideos = window.allVideoResults || [];
    return allVideos.find(result => result.videoInfo && result.videoInfo.videoId === videoId);
}

// Close video modal
function closeVideoModal() {
    // Start animation
    videoModal.classList.remove('opacity-100');
    document.getElementById('modal-content').classList.add('scale-95');
    document.getElementById('modal-content').classList.remove('scale-100');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        youtubeIframe.src = '';
        videoModal.classList.add('hidden');
        document.removeEventListener('keydown', closeModalOnEscape);
        // Re-enable body scrolling
        document.body.style.overflow = '';
    }, 300);
}

// Close modal when Escape key is pressed
function closeModalOnEscape(event) {
    if (event.key === 'Escape') {
        closeVideoModal();
    }
}

// Close modal button event listener
closeModal.addEventListener('click', closeVideoModal);

// Display error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    loadingContainer.classList.add('hidden');
    processButton.disabled = false;
}

// Add loading state for images
function addImageLoadingHandler() {
    document.querySelectorAll('.exercise-image').forEach(img => {
        // Create a loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'absolute inset-0 flex items-center justify-center bg-gray-100';
        loadingOverlay.innerHTML = `
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        `;
        
        // Insert the overlay before the image
        img.parentNode.insertBefore(loadingOverlay, img);
        
        // Remove overlay when image loads
        img.onload = function() {
            loadingOverlay.remove();
        };
        
        // Remove overlay after timeout (in case image fails to load)
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
        }, 5000);
    });
}

// Observe video cards container for new elements
const videoCardsObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            addImageLoadingHandler();
        }
    });
});

videoCardsObserver.observe(videoCards, { childList: true, subtree: true });

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
