document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages-container');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const clearBtn = document.getElementById('clear-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettings = document.getElementById('close-settings');
    const settingsModal = document.getElementById('settings-modal');
    const newChatBtn = document.getElementById('new-chat-btn');
    const smartRepliesContainer = document.getElementById('smart-replies');
    const sentimentValue = document.getElementById('sentiment-value');
    const sentimentIcon = document.getElementById('sentiment-icon');
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        analyzeSentiment(this.value);
    });
    
    // Send message on Enter
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Clear button
    clearBtn.addEventListener('click', function() {
        messageInput.value = '';
        messageInput.style.height = 'auto';
        sentimentValue.textContent = 'Neutral';
        sentimentIcon.className = 'fas fa-meh ml-1';
    });
    
    // Settings modal
    settingsBtn.addEventListener('click', function() {
        settingsModal.classList.remove('hidden');
    });
    
    closeSettings.addEventListener('click', function() {
        settingsModal.classList.add('hidden');
    });
    
    // New chat button
    newChatBtn.addEventListener('click', function() {
        if (confirm('Start a new conversation? Your current chat will be saved.')) {
            messagesContainer.innerHTML = `
                <div class="message-animation">
                    <div class="flex items-start space-x-3">
                        <div class="bg-indigo-100 p-2 rounded-full">
                            <i class="fas fa-robot text-indigo-600"></i>
                        </div>
                        <div class="flex-1">
                            <div class="bg-gray-100 p-3 rounded-lg rounded-tl-none max-w-3xl">
                                <p>Hello! I'm your AI assistant. What would you like to talk about today?</p>
                                <div class="mt-2 flex space-x-2">
                                    <span class="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">Positive</span>
                                    <span class="text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded-full">Welcome</span>
                                </div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1 ml-1">Just now</div>
                        </div>
                    </div>
                </div>
            `;
            messageInput.value = '';
            sentimentValue.textContent = 'Neutral';
            sentimentIcon.className = 'fas fa-meh ml-1';
        }
    });
    
    // Smart reply buttons
    document.querySelectorAll('.smart-reply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            messageInput.value = this.textContent.trim();
            messageInput.focus();
            analyzeSentiment(messageInput.value);
        });
    });
    
    // Mic button (simulated)
    micBtn.addEventListener('click', function() {
        if (this.classList.contains('recording')) {
            this.classList.remove('recording', 'bg-red-500', 'text-white');
            this.innerHTML = '<i class="fas fa-microphone"></i>';
            setTimeout(() => {
                messageInput.value = "I need help with my account settings";
                analyzeSentiment(messageInput.value);
            }, 500);
        } else {
            this.classList.add('recording', 'bg-red-500', 'text-white');
            this.innerHTML = '<i class="fas fa-stop"></i>';
        }
    });
    
    // Function to send message
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const aiResponse = generateAIResponse(message);
            addMessage(aiResponse.text, 'ai', aiResponse.sentiment, aiResponse.tags);
            updateSmartReplies(message);
        }, 1000 + Math.random() * 2000);
    }
    
    // Function to add a message to the chat
    function addMessage(text, sender, sentiment = 'neutral', tags = []) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let sentimentClass = '';
        let sentimentColor = '';
        let sentimentEmoji = '';
        
        switch(sentiment.toLowerCase()) {
            case 'positive':
                sentimentClass = 'sentiment-positive';
                sentimentColor = 'text-green-600';
                sentimentEmoji = 'fa-smile';
                break;
            case 'negative':
                sentimentClass = 'sentiment-negative';
                sentimentColor = 'text-red-600';
                sentimentEmoji = 'fa-frown';
                break;
            default:
                sentimentClass = 'sentiment-neutral';
                sentimentColor = 'text-blue-600';
                sentimentEmoji = 'fa-meh';
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message-animation';
        messageElement.innerHTML = `
            <div class="flex items-start space-x-3 ${sender === 'user' ? 'justify-end' : ''}">
                ${sender === 'ai' ? `
                    <div class="bg-indigo-100 p-2 rounded-full">
                        <i class="fas fa-robot text-indigo-600"></i>
                    </div>
                ` : ''}
                <div class="flex-1 ${sender === 'user' ? 'flex flex-col items-end' : ''}">
                    <div class="${sender === 'user' ? 'bg-indigo-600 text-white p-3 rounded-lg rounded-tr-none' : 'bg-gray-100 p-3 rounded-lg rounded-tl-none'} ${sender === 'ai' ? sentimentClass : ''} max-w-3xl">
                        <p>${text}</p>
                        ${sender === 'ai' ? `
                            <div class="mt-2 flex space-x-2">
                                <span class="text-xs px-2 py-1 ${sentimentColor.replace('text-', 'bg-')} ${sentimentColor} rounded-full">${sentiment}</span>
                                ${tags.map(tag => `<span class="text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded-full">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="text-xs text-gray-500 mt-1 ${sender === 'user' ? 'mr-1' : 'ml-1'}">${timeString}</div>
                </div>
                ${sender === 'user' ? `
                    <div class="bg-indigo-600 p-2 rounded-full text-white">
                        <i class="fas fa-user"></i>
                    </div>
                ` : ''}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'flex items-start space-x-3 mb-4';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="bg-indigo-100 p-2 rounded-full">
                <i class="fas fa-robot text-indigo-600"></i>
            </div>
            <div class="bg-gray-100 p-3 rounded-lg rounded-tl-none w-20">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    // Simple sentiment analysis
    function analyzeSentiment(text) {
        if (!text.trim()) {
            sentimentValue.textContent = 'Neutral';
            sentimentIcon.className = 'fas fa-meh ml-1';
            return;
        }
        
        const positiveWords = ['happy', 'great', 'awesome', 'thanks', 'thank you', 'good', 'excellent', 'love', 'like'];
        const negativeWords = ['angry', 'mad', 'hate', 'bad', 'terrible', 'awful', 'sad', 'upset', 'frustrated'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        const words = text.toLowerCase().split(/\s+/);
        
        words.forEach(word => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount) {
            sentimentValue.textContent = 'Positive';
            sentimentIcon.className = 'fas fa-smile ml-1 text-green-500';
        } else if (negativeCount > positiveCount) {
            sentimentValue.textContent = 'Negative';
            sentimentIcon.className = 'fas fa-frown ml-1 text-red-500';
        } else {
            sentimentValue.textContent = 'Neutral';
            sentimentIcon.className = 'fas fa-meh ml-1 text-blue-500';
        }
    }
    
    // Generate AI response based on user input
    function generateAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response = {};
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = {
                text: "Hello there! How can I assist you today?",
                sentiment: "positive",
                tags: ["greeting"]
            };
        } else if (lowerMessage.includes('password') || lowerMessage.includes('reset')) {
            response = {
                text: "To reset your password, please visit our password reset page and follow the instructions. Would you like me to send you a link?",
                sentiment: "neutral",
                tags: ["account", "help"]
            };
        } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
            response = {
                text: "I'd be happy to help with that. Could you please provide more details about the issue you're experiencing?",
                sentiment: "positive",
                tags: ["support"]
            };
        } else if (lowerMessage.includes('hours') || lowerMessage.includes('time')) {
            response = {
                text: "Our customer support is available Monday to Friday, 9 AM to 5 PM EST. Outside these hours, feel free to leave a message and we'll get back to you as soon as possible.",
                sentiment: "neutral",
                tags: ["information"]
            };
        } else if (lowerMessage.includes('thank')) {
            response = {
                text: "You're very welcome! Is there anything else I can help you with?",
                sentiment: "positive",
                tags: ["appreciation"]
            };
        } else {
            response = {
                text: "I understand you're asking about: " + userMessage + ". Could you please provide more details so I can assist you better?",
                sentiment: "neutral",
                tags: ["general"]
            };
        }
        
        return response;
    }
    
    // Update smart replies based on conversation context
    function updateSmartReplies(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let replies = [];
        
        if (lowerMessage.includes('password') || lowerMessage.includes('reset')) {
            replies = [
                "Where is the password reset page?",
                "I didn't receive the reset email",
                "How long does the reset link last?"
            ];
        } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
            replies = [
                "I'm having trouble with my account",
                "The website isn't working",
                "I need to speak to a human agent"
            ];
        } else if (lowerMessage.includes('hours') || lowerMessage.includes('time')) {
            replies = [
                "What about weekends?",
                "Do you have 24/7 support?",
                "What's the earliest I can call?"
            ];
        } else {
            replies = [
                "How do I contact support?",
                "Where can I find documentation?",
                "What are your pricing plans?"
            ];
        }
        
        smartRepliesContainer.innerHTML = '';
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'smart-reply-btn px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm hover:bg-indigo-200 transition';
            btn.textContent = reply;
            btn.addEventListener('click', function() {
                messageInput.value = this.textContent.trim();
                messageInput.focus();
                analyzeSentiment(messageInput.value);
            });
            smartRepliesContainer.appendChild(btn);
        });
    }
    
    // Initialize with a greeting if the chat is empty
    if (messagesContainer.children.length === 0) {
        addMessage("Hello! I'm your AI assistant. How can I help you today?", 'ai', 'positive', ['welcome']);
    }
});