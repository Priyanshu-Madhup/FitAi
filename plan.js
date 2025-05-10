// filepath: p:\FitAi\plan.js
// FitAi Workout Plan Generator

// Helper functions
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// PDF Generation function - defined outside the DOMContentLoaded event
function generatePDF(workoutPlan, userData) {
    console.log("Generating PDF with " + workoutPlan.days.length + " days");
    // Since the libraries are now loaded in the HTML, we can use them directly
    try {
        const { jsPDF } = window.jspdf;
        
        // Create PDF content
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Add FitAi logo/branding
        doc.setDrawColor(10, 185, 129); // Primary green color
        doc.setLineWidth(1);
        doc.line(20, 10, pageWidth - 20, 10); // Top border
        
        doc.setFontSize(32);
        doc.setTextColor(10, 185, 129); // Primary green color 
        doc.text('FitAi', pageWidth/2, 25, {align: 'center'});
        
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100); // Gray color
        doc.text('Your AI Fitness Assistant', pageWidth/2, 32, {align: 'center'});
        
        doc.setDrawColor(10, 185, 129);
        doc.setLineWidth(1);
        doc.line(20, 38, pageWidth - 20, 38); // Bottom border
        
        // Add header
        doc.setFontSize(24);
        doc.setTextColor(10, 185, 129); // Primary green color
        doc.text('Personalized Workout Plan', pageWidth/2, 50, {align: 'center'});
        
        // Add user info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Plan for: ${userData.firstName} ${userData.lastName}`, 20, 60);
        doc.text(`Age: ${userData.age} | Height: ${userData.height}cm | Weight: ${userData.weight}kg`, 20, 67);
        doc.text(`Goal: ${capitalizeFirstLetter(userData.fitnessGoal.replace('-', ' '))}`, 20, 74);
        
        // Add summary
        doc.setFontSize(16);
        doc.setTextColor(10, 185, 129);
        doc.text('Plan Summary', 20, 85);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const summaryLines = doc.splitTextToSize(workoutPlan.summary, pageWidth - 40);
        doc.text(summaryLines, 20, 92);
        
        let yPos = 92 + (summaryLines.length * 7);
        
        // DEBUG: Log the days we're about to process
        console.log("Processing days for PDF:");
        workoutPlan.days.forEach((day, i) => {
            console.log(`${i+1}. ${day.day} - ${day.focus}`);
        });
        console.log("Processing days for PDF:");
        workoutPlan.days.forEach((day, i) => {
            console.log(`${i+1}. ${day.day} - ${day.focus}`);
        });
        
        // Add workout days - using for loop instead of forEach to ensure all days are processed
        for (let i = 0; i < workoutPlan.days.length; i++) {
            const day = workoutPlan.days[i];
            console.log(`Processing day ${i+1}: ${day.day}`);
            
            // Always start a new page for each day except the first
            if (i > 0) {
                doc.addPage();
                yPos = 20;
            } else if (yPos > 220) {
                // For the first day, only add a page if we're running out of space
                doc.addPage();
                yPos = 20;
            }
            
            // Day title with background
            doc.setFillColor(240, 250, 240);
            doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
            
            doc.setFontSize(16);
            doc.setTextColor(10, 185, 129);
            doc.text(`${day.day} - ${day.focus}`, 20, yPos);
            yPos += 10;
            
            // Warm-up
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Warm-up:', 20, yPos);
            yPos += 6;
            
            if (day.warmup && day.warmup.length > 0) {
                day.warmup.forEach(exercise => {
                    doc.text(`• ${exercise}`, 25, yPos);
                    yPos += 6;
                });
            } else {
                doc.text(`• Light warm-up exercises`, 25, yPos);
                yPos += 6;
            }
            
            yPos += 2;
            
            // Main workout
            doc.text('Workout:', 20, yPos);
            yPos += 6;
            
            if (day.workout && day.workout.length > 0) {
                day.workout.forEach(exercise => {
                    const exerciseText = `• ${exercise.exercise}: ${exercise.sets} sets × ${exercise.reps} reps`;
                    doc.text(exerciseText, 25, yPos);
                    yPos += 6;
                    
                    if (exercise.notes) {
                        doc.setFontSize(10);
                        doc.text(`   ${exercise.notes}`, 25, yPos);
                        doc.setFontSize(12);
                        yPos += 5;
                    }
                });
            } else {
                doc.text(`• Sample exercise: 3 sets × 10 reps`, 25, yPos);
                yPos += 6;
            }
            
            yPos += 2;
            
            // Cool-down
            doc.text('Cool-down:', 20, yPos);
            yPos += 6;
            
            if (day.cooldown && day.cooldown.length > 0) {
                day.cooldown.forEach(exercise => {
                    doc.text(`• ${exercise}`, 25, yPos);
                    yPos += 6;
                });
            } else {
                doc.text(`• Light stretching exercises`, 25, yPos);
                yPos += 6;
            }
            
            yPos += 5;
        }
        
        // Add nutrition on a new page
        doc.addPage();
        
        // Add FitAi mini header to nutrition page
        doc.setFontSize(14);
        doc.setTextColor(10, 185, 129);
        doc.text('FitAi - Your AI Fitness Assistant', pageWidth/2, 15, {align: 'center'});
        
        doc.setFontSize(18);
        doc.setTextColor(10, 185, 129);
        doc.text('Nutrition Guidelines', pageWidth/2, 30, {align: 'center'});
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const nutritionLines = doc.splitTextToSize(workoutPlan.nutrition, pageWidth - 40);
        doc.text(nutritionLines, 20, 45);
        
        // Add footer to all pages
        const totalPages = doc.internal.getNumberOfPages();
        for(let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Generated by FitAi - Your AI Fitness Assistant', pageWidth/2, 290, {align: 'center'});
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, 290, {align: 'right'});
        }
          // Save PDF
        const fileName = `FitAi_Plan_${userData.firstName}_${userData.lastName}.pdf`;
        doc.save(fileName);
        
        // Create a notification with a link to the demos page
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border-l-4 border-primary z-50 max-w-md animate__animated animate__fadeInUp';
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0 pt-0.5">
                    <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-gray-900">PDF Generated Successfully!</h3>
                    <div class="mt-1 text-sm text-gray-500">
                        <p>Your workout plan has been saved as ${fileName}.</p>
                        <p class="mt-2">Want to see video demonstrations of the exercises?</p>
                        <a href="demos.html" class="mt-2 inline-block text-sm font-medium text-primary hover:text-dark">
                            Upload your PDF to the Demos page →
                        </a>
                    </div>
                </div>
                <button class="ml-4 text-gray-400 hover:text-gray-500" id="close-notification">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listener to close button
        document.getElementById('close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove notification after 15 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('animate__fadeOutDown');
                setTimeout(() => notification.remove(), 500);
            }
        }, 15000);
        
        console.log("PDF generation complete with " + totalPages + " pages");
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Sleep and stress level sliders
    const sleepHours = document.getElementById('sleep-hours');
    const sleepHoursValue = document.getElementById('sleep-hours-value');
    const stressLevel = document.getElementById('stress-level');
    const stressLevelValue = document.getElementById('stress-level-value');
    
    if (sleepHours) {
        sleepHours.addEventListener('input', function() {
            sleepHoursValue.textContent = this.value;
        });
    }
    
    if (stressLevel) {
        stressLevel.addEventListener('input', function() {
            stressLevelValue.textContent = this.value;
        });
    }
    
    // Form and UI elements
    const planForm = document.getElementById('plan-form');
    const planFormContainer = document.getElementById('plan-form-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const planResults = document.getElementById('plan-results');
    const planSummary = document.getElementById('plan-summary');
    const workoutDays = document.getElementById('workout-days');
    const downloadPdfBtn = document.getElementById('download-pdf');
    
    // Groq API key - same key used for the chatbot
    const GROQ_API_KEY = "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";
    
    if (planForm) {
        planForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const age = document.getElementById('age').value;
            const gender = document.getElementById('gender').value;
            const height = document.getElementById('height').value;
            const weight = document.getElementById('weight').value;
            const sleepHours = document.getElementById('sleep-hours').value;
            const stressLevel = document.getElementById('stress-level').value;
            const fitnessGoal = document.getElementById('fitness-goal').value;
            const workoutLocation = document.getElementById('workout-location').value;
            const isVegan = document.getElementById('vegan').checked;
            
            // Validate form
            const requiredFields = [firstName, lastName, age, gender, height, weight, fitnessGoal, workoutLocation];
            if (requiredFields.some(field => !field)) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Show loading spinner
            planFormContainer.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            
            // Generate personalized fitness plan using Groq API
            try {
                const workoutPlan = await generateWorkoutPlan({
                    firstName,
                    lastName,
                    age,
                    gender,
                    height,
                    weight,
                    sleepHours,
                    stressLevel,
                    fitnessGoal,
                    workoutLocation,
                    isVegan
                });
                
                // Display the plan
                displayWorkoutPlan(workoutPlan, {
                    firstName,
                    lastName,
                    age,
                    gender,
                    height,
                    weight,
                    sleepHours,
                    stressLevel,
                    fitnessGoal,
                    workoutLocation,
                    isVegan
                });
                
                // Hide loading spinner and show results
                loadingSpinner.classList.add('hidden');
                planResults.classList.remove('hidden');
                
                // Scroll to results
                planResults.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('Error generating workout plan:', error);
                alert('There was an error generating your workout plan. Please try again.');
                
                // Hide loading spinner and show form again
                loadingSpinner.classList.add('hidden');
                planFormContainer.classList.remove('hidden');
            }
        });
    }
    
    async function generateWorkoutPlan(userData) {
        // Construct prompt for Groq API
        const prompt = `
Generate a personalized 7-day workout plan for a user with the following details:
- Name: ${userData.firstName} ${userData.lastName}
- Age: ${userData.age}
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Sleep: ${userData.sleepHours} hours per night
- Stress Level: ${userData.stressLevel}/10
- Fitness Goal: ${userData.fitnessGoal}
- Workout Location: ${userData.workoutLocation}
- Dietary Restriction: ${userData.isVegan ? 'Vegan' : 'None'}

The workout plan should include:
1. A brief introduction and summary of the plan
2. For each day (Day 1 to Day 7):
   - The focus area/muscle groups
   - Warm-up exercises
   - Main workout with exercises, sets, reps
   - Cool-down exercises
3. Include appropriate rest days
4. Brief nutritional suggestions that align with their goals ${userData.isVegan ? 'and vegan diet' : ''}

Format the response as a JSON object with the following structure:
{
  "summary": "Brief overall summary of the plan",
  "days": [
    {
      "day": "Day 1",
      "focus": "Focus area",
      "warmup": ["Exercise 1", "Exercise 2"],
      "workout": [
        {"exercise": "Exercise name", "sets": X, "reps": Y, "notes": "Any special instructions"}
      ],
      "cooldown": ["Exercise 1", "Exercise 2"]
    }
  ],
  "nutrition": "Brief nutritional guidelines"
}
`;

        // Call Groq API
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional fitness trainer and nutritionist who creates personalized workout plans. Format your response as JSON only without any markdown."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 4000
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get response from Groq API');
            }
            
            const data = await response.json();
            const responseText = data.choices[0].message.content;
            
            // Extract JSON from response
            let jsonStart = responseText.indexOf('{');
            let jsonEnd = responseText.lastIndexOf('}');
            
            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error('Invalid JSON response from API');
            }
            
            const jsonResponse = responseText.substring(jsonStart, jsonEnd + 1);
            return JSON.parse(jsonResponse);
            
        } catch (error) {
            console.error('Error calling Groq API:', error);
            throw error;
        }
    }
    
    function displayWorkoutPlan(workoutPlan, userData) {
        // Display summary
        planSummary.innerHTML = `
            <div class="mb-3">
                <h3 class="text-xl font-semibold text-dark mb-2">Plan for ${userData.firstName} ${userData.lastName}</h3>
                <p class="text-gray-700">${workoutPlan.summary}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <span class="font-semibold">Goal:</span> ${capitalizeFirstLetter(userData.fitnessGoal.replace('-', ' '))}
                </div>
                <div>
                    <span class="font-semibold">Location:</span> ${capitalizeFirstLetter(userData.workoutLocation)}
                </div>
                <div>
                    <span class="font-semibold">Nutrition:</span> ${userData.isVegan ? 'Vegan' : 'Standard'}
                </div>
            </div>
        `;
        
        // Display days
        workoutDays.innerHTML = '';
        workoutPlan.days.forEach(day => {
            const dayCard = document.createElement('div');
            dayCard.className = 'bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition duration-300';
            
            // Determine card color based on focus (subtle background)
            let focusColor = 'bg-green-50'; // Default
            if (day.focus.toLowerCase().includes('rest')) {
                focusColor = 'bg-blue-50';
            } else if (day.focus.toLowerCase().includes('leg') || day.focus.toLowerCase().includes('lower')) {
                focusColor = 'bg-indigo-50';
            } else if (day.focus.toLowerCase().includes('chest') || day.focus.toLowerCase().includes('upper')) {
                focusColor = 'bg-red-50';
            } else if (day.focus.toLowerCase().includes('core') || day.focus.toLowerCase().includes('ab')) {
                focusColor = 'bg-yellow-50';
            }
            
            // Create workout list
            let workoutList = '';
            if (day.workout && day.workout.length > 0) {
                workoutList = day.workout.map(exercise => `
                    <li class="mb-2">
                        <span class="font-semibold">${exercise.exercise}</span>
                        <div class="text-sm text-gray-600">
                            ${exercise.sets} sets × ${exercise.reps} reps
                            ${exercise.notes ? `<div class="text-xs italic mt-1">${exercise.notes}</div>` : ''}
                        </div>
                    </li>
                `).join('');
            }
            
            dayCard.innerHTML = `
                <div class="${focusColor} rounded-t-lg p-3 -m-4 mb-3">
                    <h4 class="font-bold text-dark">${day.day}</h4>
                    <p class="text-gray-700 text-sm">${day.focus}</p>
                </div>
                
                <div>
                    <h5 class="text-sm font-semibold text-primary mb-1">Warm-up</h5>
                    <ul class="text-sm text-gray-600 mb-3 pl-4 list-disc">
                        ${day.warmup.map(exercise => `<li>${exercise}</li>`).join('')}
                    </ul>
                    
                    <h5 class="text-sm font-semibold text-primary mb-1">Workout</h5>
                    <ul class="mb-3 pl-4">
                        ${workoutList}
                    </ul>
                    
                    <h5 class="text-sm font-semibold text-primary mb-1">Cool-down</h5>
                    <ul class="text-sm text-gray-600 pl-4 list-disc">
                        ${day.cooldown.map(exercise => `<li>${exercise}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            workoutDays.appendChild(dayCard);
        });
        
        // Add nutrition section
        const nutritionSection = document.createElement('div');
        nutritionSection.className = 'col-span-full mt-4 p-4 bg-green-50 rounded-lg';
        nutritionSection.innerHTML = `
            <h3 class="text-lg font-semibold text-dark mb-2">Nutrition Guidelines</h3>
            <p class="text-gray-700">${workoutPlan.nutrition}</p>
        `;
        
        workoutDays.appendChild(nutritionSection);
    }
    
    // For development purposes, create sample data when "Download PDF" button is clicked without a generated plan
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            console.log("Download PDF button clicked");
            // Check if we already have plan data
            if (!workoutDays.innerHTML.trim()) {
                console.log("No workout data found, using sample data");
                // Create sample data for testing
                const samplePlan = {
                    summary: "This is a sample 7-day workout plan designed for general fitness. It includes a mix of cardio, strength training, and flexibility exercises to help you achieve a balanced fitness level. This plan is suitable for beginners to intermediates and can be adjusted according to your fitness level.",
                    days: [
                        {
                            day: "Day 1",
                            focus: "Full Body Strength",
                            warmup: ["Light jogging in place for 3 minutes", "Arm circles for 30 seconds", "Bodyweight squats for 1 minute"],
                            workout: [
                                {exercise: "Push-ups", sets: 3, reps: "10-12", notes: "Modify on knees if needed"},
                                {exercise: "Bodyweight squats", sets: 3, reps: "15", notes: "Focus on form"},
                                {exercise: "Plank", sets: 3, reps: "30 seconds", notes: "Keep core engaged"},
                                {exercise: "Dumbbell rows", sets: 3, reps: "12 per arm", notes: "Use light weight"}
                            ],
                            cooldown: ["Shoulder stretch for 30 seconds each side", "Quad stretch for 30 seconds each leg", "Deep breathing for 2 minutes"]
                        },
                        {
                            day: "Day 2",
                            focus: "Cardio",
                            warmup: ["March in place for 3 minutes", "Arm swings for 30 seconds", "Hip rotations for 30 seconds"],
                            workout: [
                                {exercise: "Jumping jacks", sets: 3, reps: "30 seconds", notes: "Rest 15 seconds between sets"},
                                {exercise: "High knees", sets: 3, reps: "30 seconds", notes: "Rest 15 seconds between sets"},
                                {exercise: "Mountain climbers", sets: 3, reps: "30 seconds", notes: "Rest 15 seconds between sets"},
                                {exercise: "Burpees", sets: 3, reps: "10", notes: "Modify as needed"}
                            ],
                            cooldown: ["Walking in place for 3 minutes", "Calf stretch for 30 seconds each leg", "Child's pose for 1 minute"]
                        },
                        {
                            day: "Day 3",
                            focus: "Rest and Recovery",
                            warmup: ["Light walking for 5 minutes"],
                            workout: [
                                {exercise: "Gentle stretching", sets: 1, reps: "10 minutes", notes: "Focus on major muscle groups"},
                                {exercise: "Deep breathing exercises", sets: 1, reps: "5 minutes", notes: "Practice mindfulness"}
                            ],
                            cooldown: ["Relaxation techniques for 5 minutes"]
                        },
                        {
                            day: "Day 4",
                            focus: "Upper Body",
                            warmup: ["Arm circles for 1 minute", "Shoulder rolls for 30 seconds", "Wall push-ups for 1 minute"],
                            workout: [
                                {exercise: "Push-ups", sets: 3, reps: "10-12", notes: "Vary hand position"},
                                {exercise: "Tricep dips", sets: 3, reps: "12", notes: "Use chair or bench"},
                                {exercise: "Bicep curls", sets: 3, reps: "12", notes: "Use light dumbbells or water bottles"},
                                {exercise: "Shoulder press", sets: 3, reps: "12", notes: "Use light dumbbells or water bottles"}
                            ],
                            cooldown: ["Chest stretch for 30 seconds", "Tricep stretch for 30 seconds each arm", "Bicep stretch for 30 seconds each arm"]
                        },
                        {
                            day: "Day 5",
                            focus: "Lower Body",
                            warmup: ["March in place for 3 minutes", "Hip circles for 30 seconds each direction", "Ankle rotations for 30 seconds each foot"],
                            workout: [
                                {exercise: "Bodyweight squats", sets: 3, reps: "15", notes: "Focus on depth"},
                                {exercise: "Lunges", sets: 3, reps: "10 each leg", notes: "Keep front knee aligned with ankle"},
                                {exercise: "Glute bridges", sets: 3, reps: "15", notes: "Squeeze glutes at top"},
                                {exercise: "Calf raises", sets: 3, reps: "20", notes: "Use wall for balance if needed"}
                            ],
                            cooldown: ["Hamstring stretch for 30 seconds each leg", "Quad stretch for 30 seconds each leg", "Hip flexor stretch for 30 seconds each side"]
                        },
                        {
                            day: "Day 6",
                            focus: "Core and Flexibility",
                            warmup: ["Torso twists for 1 minute", "Hip rotations for 1 minute", "Cat-cow stretch for 1 minute"],
                            workout: [
                                {exercise: "Crunches", sets: 3, reps: "15", notes: "Quality over quantity"},
                                {exercise: "Russian twists", sets: 3, reps: "20 total", notes: "Use lightweight if available"},
                                {exercise: "Plank", sets: 3, reps: "30-45 seconds", notes: "Focus on form"},
                                {exercise: "Supermans", sets: 3, reps: "12", notes: "Engage lower back"}
                            ],
                            cooldown: ["Child's pose for 1 minute", "Cobra stretch for 30 seconds", "Spinal twist for 30 seconds each side"]
                        },
                        {
                            day: "Day 7",
                            focus: "Active Recovery",
                            warmup: ["Light walking for 5 minutes"],
                            workout: [
                                {exercise: "Walking", sets: 1, reps: "20-30 minutes", notes: "Moderate pace"},
                                {exercise: "Full body stretching routine", sets: 1, reps: "15 minutes", notes: "Hold each stretch for 30 seconds"}
                            ],
                            cooldown: ["Deep breathing for 3 minutes", "Meditation for 5 minutes"]
                        }
                    ],
                    nutrition: "Focus on a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains. Stay hydrated by drinking at least 8 glasses of water per day. Aim to eat smaller meals every 3-4 hours to maintain energy levels throughout the day. Consume protein within 30 minutes after workouts to aid in muscle recovery."
                };
                
                const sampleUserData = {
                    firstName: "John",
                    lastName: "Doe",
                    age: "35",
                    gender: "male",
                    height: "180",
                    weight: "80",
                    sleepHours: "7",
                    stressLevel: "5",
                    fitnessGoal: "general",
                    workoutLocation: "home",
                    isVegan: false
                };
                
                // Display the sample plan
                displayWorkoutPlan(samplePlan, sampleUserData);
                
                // Show the generated plan
                planResults.classList.remove('hidden');
                
                // Generate PDF with ALL days
                generatePDF(samplePlan, sampleUserData);
            } else {
                console.log("Workout data found, generating PDF");
                // Try to get actual data from the displayed plan
                try {
                    // Get the form data if available
                    const firstName = document.getElementById('first-name').value || "User";
                    const lastName = document.getElementById('last-name').value || "";
                    const age = document.getElementById('age').value || "30";
                    const gender = document.getElementById('gender').value || "not specified";
                    const height = document.getElementById('height').value || "175";
                    const weight = document.getElementById('weight').value || "70";
                    const fitnessGoal = document.getElementById('fitness-goal').value || "general";
                    const workoutLocation = document.getElementById('workout-location').value || "home";
                    const isVegan = document.getElementById('vegan')?.checked || false;
                    
                    // Get displayed plan data
                    // This is a simplification - in a real app, you'd store the full plan data
                    const summaryText = planSummary.querySelector('p').textContent;
                    
                    // Extract day cards from the displayed plan
                    const dayCards = workoutDays.querySelectorAll('div.bg-white.p-4');
                    console.log("Found " + dayCards.length + " day cards");
                    
                    // Build a complete workout plan from the displayed cards
                    const extractedDays = [];
                    
                    dayCards.forEach((card, index) => {
                        if (index < 7) { // Only process day cards, not the nutrition section
                            const dayTitle = card.querySelector('h4').textContent;
                            const dayFocus = card.querySelector('p').textContent;
                            
                            // Extract warm-up exercises
                            const warmupItems = Array.from(card.querySelectorAll('h5')).find(h => h.textContent === 'Warm-up')
                                ?.nextElementSibling?.querySelectorAll('li') || [];
                            const warmup = Array.from(warmupItems).map(li => li.textContent);
                            
                            // Extract workout exercises
                            const workoutItems = Array.from(card.querySelectorAll('h5')).find(h => h.textContent === 'Workout')
                                ?.nextElementSibling?.querySelectorAll('li') || [];
                            const workout = Array.from(workoutItems).map(li => {
                                const exerciseName = li.querySelector('span').textContent;
                                const details = li.querySelector('div').textContent.trim();
                                const repsMatch = details.match(/(\d+) sets × ([\d-]+ reps)/);
                                const notesElem = li.querySelector('.text-xs.italic');
                                
                                return {
                                    exercise: exerciseName,
                                    sets: repsMatch ? parseInt(repsMatch[1]) : 3,
                                    reps: repsMatch ? repsMatch[2] : "10-12",
                                    notes: notesElem ? notesElem.textContent.trim() : ""
                                };
                            });
                            
                            // Extract cool-down exercises
                            const cooldownItems = Array.from(card.querySelectorAll('h5')).find(h => h.textContent === 'Cool-down')
                                ?.nextElementSibling?.querySelectorAll('li') || [];
                            const cooldown = Array.from(cooldownItems).map(li => li.textContent);
                            
                            extractedDays.push({
                                day: dayTitle,
                                focus: dayFocus,
                                warmup: warmup.length > 0 ? warmup : ["Light warm-up"],
                                workout: workout.length > 0 ? workout : [{exercise: "Exercise", sets: 3, reps: "10", notes: ""}],
                                cooldown: cooldown.length > 0 ? cooldown : ["Light stretching"]
                            });
                        }
                    });
                    
                    // Get nutrition guidelines
                    const nutritionText = workoutDays.querySelector('.bg-green-50 p').textContent;
                    
                    // Create a complete workout plan
                    const extractedPlan = {
                        summary: summaryText,
                        days: extractedDays,
                        nutrition: nutritionText || "Follow a balanced diet with plenty of fruits, vegetables, and lean proteins."
                    };
                    
                    console.log("Extracted plan has " + extractedPlan.days.length + " days");
                    
                    const userData = {
                        firstName,
                        lastName,
                        age,
                        gender,
                        height,
                        weight,
                        fitnessGoal,
                        workoutLocation,
                        isVegan
                    };
                    
                    // Generate PDF using extracted data
                    generatePDF(extractedPlan, userData);
                } catch (error) {
                    console.error('Error generating PDF from displayed plan:', error);
                    alert('There was an error generating the PDF from the displayed plan. Using sample data instead.');
                    
                    // Fall back to sample data with all 7 days
                    const samplePlan = {
                        summary: "Sample 7-day fitness plan for general fitness",
                        days: [
                            {
                                day: "Day 1",
                                focus: "Full Body",
                                warmup: ["Warm-up 1", "Warm-up 2"],
                                workout: [
                                    {exercise: "Exercise 1", sets: 3, reps: "10", notes: "Note 1"}
                                ],
                                cooldown: ["Cool-down 1", "Cool-down 2"]
                            },
                            {
                                day: "Day 2",
                                focus: "Cardio",
                                warmup: ["Warm-up 1"],
                                workout: [
                                    {exercise: "Exercise 1", sets: 3, reps: "10", notes: "Note 1"}
                                ],
                                cooldown: ["Cool-down 1"]
                            },
                            {
                                day: "Day 3",
                                focus: "Rest",
                                warmup: ["Light stretching"],
                                workout: [
                                    {exercise: "Light activity", sets: 1, reps: "10 min", notes: "Recovery"}
                                ],
                                cooldown: ["Relaxation"]
                            },
                            {
                                day: "Day 4",
                                focus: "Upper Body",
                                warmup: ["Warm-up 1"],
                                workout: [
                                    {exercise: "Exercise 1", sets: 3, reps: "10", notes: "Note 1"}
                                ],
                                cooldown: ["Cool-down 1"]
                            },
                            {
                                day: "Day 5",
                                focus: "Lower Body",
                                warmup: ["Warm-up 1"],
                                workout: [
                                    {exercise: "Exercise 1", sets: 3, reps: "10", notes: "Note 1"}
                                ],
                                cooldown: ["Cool-down 1"]
                            },
                            {
                                day: "Day 6",
                                focus: "Core",
                                warmup: ["Warm-up 1"],
                                workout: [
                                    {exercise: "Exercise 1", sets: 3, reps: "10", notes: "Note 1"}
                                ],
                                cooldown: ["Cool-down 1"]
                            },
                            {
                                day: "Day 7",
                                focus: "Active Recovery",
                                warmup: ["Warm-up 1"],
                                workout: [
                                    {exercise: "Exercise 1", sets: 3, reps: "10", notes: "Note 1"}
                                ],
                                cooldown: ["Cool-down 1"]
                            }
                        ],
                        nutrition: "Sample nutrition advice for a balanced diet."
                    };
                    
                    const userData = {
                        firstName: "User",
                        lastName: "",
                        age: "30",
                        height: "175",
                        weight: "70",
                        fitnessGoal: "general",
                        workoutLocation: "home",
                        isVegan: false
                    };
                    
                    generatePDF(samplePlan, userData);
                }
            }
        });
    }
});
