const API_KEY = 'sk-your-api-key'; // Replace with your key
const BOT_CONTEXT = `
  You are a professional assistant for Laksh. Follow these rules:
  1. Only answer questions about Laksh's professional background, skills, projects, and education
  2. Be concise and factual
  3. If asked about unrelated topics, respond: "I specialize only in answering questions about Laksh's professional background. Please ask about my skills, experience, or projects!"
  4. Use only the following information:

  ${await loadBotResources()}
`;

async function loadBotResources() {
  try {
    const responses = await Promise.all([
      fetch('/bot-resources/professional-info.txt'),
      fetch('/bot-resources/projects-info.txt'),
      fetch('/bot-resources/education-info.txt')
    ]);
    
    const texts = await Promise.all(responses.map(r => r.text()));
    return texts.join('\n');
  } catch (error) {
    console.error('Error loading bot resources:', error);
    return ''; // Fallback to empty string
  }
}

// Chat UI Logic
document.addEventListener('DOMContentLoaded', () => {
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');
  const closeChat = document.getElementById('close-chat');
  
  chatToggle.addEventListener('click', () => {
    chatContainer.classList.toggle('hidden');
  });

  closeChat.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
  });

  // Message handling
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  
  sendBtn.addEventListener('click', handleSend);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});

async function handleSend() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';
  
  try {
    const response = await getAIResponse(message);
    addMessage(response, 'bot');
  } catch (error) {
    addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
  }
}

async function getAIResponse(message) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: BOT_CONTEXT },
        { role: "user", content: message }
      ],
      temperature: 0.2
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function addMessage(text, sender) {
  const messagesDiv = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add(`${sender}-message`);
  messageDiv.textContent = text;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}