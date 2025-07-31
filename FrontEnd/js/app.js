/**
 * Queryl - Document Chat Application
 * Main JavaScript file
 */

// DOM Elements
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const voiceInputBtn = document.getElementById('voice-input-btn');
const sendMessageBtn = document.getElementById('send-message-btn');
const voiceRecordingIndicator = document.getElementById('voice-recording-indicator');
const stopRecordingBtn = document.getElementById('stop-recording-btn');
const clearChatBtn = document.querySelector('.btn-clear');

// State
let recognition = null;
let isRecording = false;

// Backend API URL (change this to match your backend)
const API_URL = 'http://localhost:5000';

// API request timeout (in ms)
const API_TIMEOUT = 30000;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initVoiceRecognition();
    setupEventListeners();
});

/**
 * Initialize Speech Recognition API
 */
function initVoiceRecognition() {
    // Check if browser supports Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // Create speech recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US'; // Set language explicitly
        
        // Handle result event
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
        };
        
        // Handle end event - make sure UI is reset
        recognition.onend = () => {
            console.log('Speech recognition ended');
            isRecording = false;
            voiceRecordingIndicator.classList.remove('active');
            voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            messageInput.placeholder = 'Type your message here...';
        };
        
        // Handle error event
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            // Reset state but use separate method to avoid potential loops
            isRecording = false;
            voiceRecordingIndicator.classList.remove('active');
            voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            messageInput.placeholder = 'Type your message here...';
            
            // Show error notification
            showNotification('Speech recognition error: ' + event.error, 'error');
        };
    } else {
        // Hide voice input button if not supported
        voiceInputBtn.style.display = 'none';
        console.log('Speech recognition not supported by this browser');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Form submission
    chatForm.addEventListener('submit', handleMessageSubmit);
    
    // Voice input - using event listeners with explicit options
    voiceInputBtn.addEventListener('click', toggleVoiceRecording, { passive: false });
    
    // Make sure the stop button event is properly attached with a direct click handler
    if (stopRecordingBtn) {
        // Remove any existing listeners to prevent duplicates
        stopRecordingBtn.removeEventListener('click', stopVoiceRecording);
        // Add the event listener with a direct reference to the stopVoiceRecording function
        stopRecordingBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            e.stopPropagation(); // Prevent event bubbling
            console.log('Stop button clicked');
            stopVoiceRecording();
        }, { passive: false });
    }
    
    // Clear chat
    clearChatBtn.addEventListener('click', clearChat);
    
    // Add a keyboard listener for Escape key to stop recording
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isRecording) {
            console.log('Escape key pressed, stopping recording');
            stopVoiceRecording();
        }
    });
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
function handleMessageSubmit(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input field
    messageInput.value = '';
    
    // Get response from API
    getResponseFromAPI(message);
}

/**
 * Toggle voice recording on/off
 */
function toggleVoiceRecording(e) {
    // Prevent default behavior and event propagation
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('Toggle voice recording, current state:', isRecording);
    
    // Check if speech recognition is supported
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        showNotification('Speech recognition is not supported by your browser', 'error');
        return;
    }
    
    if (!isRecording) {
        startVoiceRecording();
    } else {
        stopVoiceRecording();
    }
}

/**
 * Start voice recording
 */
function startVoiceRecording() {
    // Ensure any existing sessions are properly terminated
    try {
        // If recognition is already running or in an invalid state, reset it
        if (recognition && isRecording) {
            try {
                recognition.abort();
            } catch (e) {
                console.warn('Could not abort existing recognition:', e);
            }
        }
        
        // Create a new instance if needed to ensure clean state
        if (recognition === null) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                messageInput.value = transcript;
            };
            
            recognition.onend = () => {
                stopVoiceRecording();
            };
            
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                stopVoiceRecording();
                showNotification('Speech recognition error: ' + event.error, 'error');
            };
        }
        
        // Start recognition
        recognition.start();
        isRecording = true;
        
        // Update UI
        voiceRecordingIndicator.classList.add('active');
        voiceInputBtn.innerHTML = '<i class="fas fa-stop"></i>';
        messageInput.placeholder = 'Listening...';
        
        // Add a safety timeout to stop recording after a maximum time (e.g., 30 seconds)
        setTimeout(() => {
            if (isRecording) {
                console.log('Safety timeout reached, stopping recording');
                stopVoiceRecording();
                showNotification('Recording stopped due to timeout', 'info');
            }
        }, 30000); // 30 seconds maximum
        
    } catch (error) {
        console.error('Speech recognition start error:', error);
        showNotification('Could not start speech recognition', 'error');
        
        // Make sure UI is reset
        stopVoiceRecording();
    }
}

/**
 * Stop voice recording
 */
function stopVoiceRecording() {
    if (isRecording) {
        try {
            recognition.abort(); // Use abort() instead of stop() for more immediate termination
        } catch (error) {
            console.error('Error stopping recording:', error);
        } finally {
            // Always reset the state even if there's an error
            isRecording = false;
            voiceRecordingIndicator.classList.remove('active');
            voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            messageInput.placeholder = 'Type your message here...';
        }
    } else {
        // Reset UI just in case
        voiceRecordingIndicator.classList.remove('active');
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        messageInput.placeholder = 'Type your message here...';
    }
}

/**
 * Add a message to the chat
 * @param {string} message - The message text
 * @param {string} sender - The sender type ('user' or 'bot')
 */
function addMessage(message, sender) {
    // Create message elements
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-bubble', `${sender}-message`);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = message;
    
    const timestamp = document.createElement('div');
    timestamp.classList.add('message-timestamp');
    timestamp.textContent = formatTimestamp(new Date());
    
    // Assemble and append message
    messageElement.appendChild(messageContent);
    messageElement.appendChild(timestamp);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    scrollToBottom();
}

/**
 * Format timestamp to readable time
 * @param {Date} date - The date to format
 * @returns {string} - Formatted time string (e.g., "10:30 AM")
 */
function formatTimestamp(date) {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Scroll chat container to the bottom
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Get response from backend API
 * @param {string} message - The user message
 */
function getResponseFromAPI(message) {
    // Show typing indicator
    showTypingIndicator();
    
    // Create request payload
    const payload = {
        question: message
    };
    
    // Create fetch abort controller for timeout support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    // Call the actual backend API
    fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
    })
    .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response to chat
        addMessage(data.answer, 'bot');
        
        // Optional: Show processing time as system message
        if (data.processingTime) {
            showSystemMessage(`Response generated in ${data.processingTime} seconds`);
        }
    })
    .catch(error => {
        // Hide typing indicator
        hideTypingIndicator();
        
        console.error('Error fetching response:', error);
        
        // Show error message to user
        if (error.name === 'AbortError') {
            showSystemMessage('Request timed out. Please try again.', 'error');
        } else {
            showSystemMessage('Error connecting to the backend server. Please try again later.', 'error');
        }
    });
}

/**
 * Show typing indicator in chat
 */
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message-bubble', 'bot-message', 'typing-indicator');
    typingIndicator.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();
}

/**
 * Hide typing indicator from chat
 */
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Show a system message in chat
 * @param {string} message - The system message
 * @param {string} type - The type of message ('info', 'error', 'success')
 */
function showSystemMessage(message, type = 'info') {
    const systemMessage = document.createElement('div');
    systemMessage.classList.add('message-bubble', 'system-message', `system-${type}`);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = message;
    
    systemMessage.appendChild(messageContent);
    chatMessages.appendChild(systemMessage);
    
    // Auto-remove system messages after delay
    setTimeout(() => {
        systemMessage.classList.add('fade-out');
        setTimeout(() => {
            systemMessage.remove();
        }, 500);
    }, 5000);
    
    scrollToBottom();
}

/**
 * Generate a mock response based on the user's message
 * @param {string} message - The user message
 * @returns {string} - The mock response
 */
function generateMockResponse(message) {
    // This would be replaced with an actual API call
    const responses = [
        "I found that information in your document. According to page 5, the answer is...",
        "Based on your uploaded documents, the answer is...",
        "Your document mentions that specifically on section 3.2...",
        "I couldn't find an exact match for that in your documents. Could you rephrase your question?",
        "The document states that this process requires three steps: first...",
        "According to the information in your files, the deadline mentioned is June 15th.",
        "Your document doesn't seem to contain information about that topic."
    ];
    
    // If message contains certain keywords, provide specific responses
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "Hello! How can I help you with your documents today?";
    }
    
    if (message.toLowerCase().includes('thank')) {
        return "You're welcome! Is there anything else you'd like to know about your documents?";
    }
    
    // Return random response for other messages
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Clear all messages from the chat
 */
function clearChat() {
    // Keep only welcome message, remove all other messages
    const allMessages = chatMessages.querySelectorAll('.message-bubble');
    allMessages.forEach(msg => msg.remove());
    
    // Show welcome message again if it doesn't exist
    if (!chatMessages.querySelector('.welcome-message')) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('welcome-message');
        welcomeMessage.innerHTML = `
            <h3>Welcome to Queryl!</h3>
            <p>Ask questions about your documents and get instant answers.</p>
        `;
        chatMessages.appendChild(welcomeMessage);
    }
}

/**
 * Show notification message
 * @param {string} message - The notification message
 * @param {string} type - The type of notification ('info', 'error', 'success')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
