document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.getElementById('chatbot-bubble');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    if (!bubble || !widget) return;

    let chatHistory = [];

    const toggleWidget = () => widget.classList.toggle('show');
    bubble.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', toggleWidget);

    const addMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        chatHistory.push({ sender: sender, text: text });
    };
    
    addMessage("¡Hola! Soy Jarvis, tu asistente virtual. ¿En qué puedo ayudarte?", 'bot');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;

        addMessage(userInput, 'user');
        chatInput.value = '';

        const thinkingMessage = document.createElement('div');
        thinkingMessage.className = 'message bot';
        thinkingMessage.textContent = 'Jarvis está pensando...';
        messagesContainer.appendChild(thinkingMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput, history: chatHistory }),
            });
            if (!response.ok) throw new Error('Error del servidor');
            
            const data = await response.json();
            const botReply = data.reply || "No pude procesar esa respuesta.";
            
            thinkingMessage.textContent = botReply;
            chatHistory.push({ sender: 'bot', text: botReply });

        } catch (error) {
            console.error('Error en el chatbot:', error);
            thinkingMessage.textContent = "Uups, algo salió mal. Revisa que el servidor de Python esté corriendo.";
        }
    });
});