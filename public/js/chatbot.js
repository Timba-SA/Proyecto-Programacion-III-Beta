document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.getElementById('chatbot-bubble');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    let chatHistory = [];

    if (!bubble || !widget || !chatForm || !chatInput || !messagesContainer) return;

    const toggleWidget = () => widget.classList.toggle('show');
    bubble.addEventListener('click', toggleWidget);
    closeBtn?.addEventListener('click', toggleWidget);

    const addMessage = (text, sender) => {
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        chatHistory.push({ sender: sender, text: text });
    };

    addMessage("¡Hola! Soy Jarvis, tu asistente virtual. ¿En qué puedo ayudarte hoy?", 'bot');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;

        addMessage(userInput, 'user');
        chatInput.value = '';

        const thinkingMessageDiv = document.createElement('div');
        thinkingMessageDiv.className = 'message bot';
        thinkingMessageDiv.textContent = 'Jarvis está pensando...';
        messagesContainer.appendChild(thinkingMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userInput,
                    history: chatHistory
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(()=>({error: 'Error del servidor'}));
                thinkingMessageDiv.textContent = err.error || 'Error del servidor';
                chatHistory.push({ sender: 'bot', text: thinkingMessageDiv.textContent });
                return;
            }

            const data = await response.json();
            const botReply = data.reply || data.error || "No pude procesar esa respuesta.";
            thinkingMessageDiv.textContent = botReply;
            chatHistory.push({ sender: 'bot', text: botReply });
        } catch (error) {
            console.error('Error en el chatbot:', error);
            const errorMessage = "Uups, algo salió mal. Revisa que el servidor esté corriendo.";
            thinkingMessageDiv.textContent = errorMessage;
            chatHistory.push({ sender: 'bot', text: errorMessage });
        }
    });
});