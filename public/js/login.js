document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'gestion.html';
            } else {
                errorMessage.textContent = data.message || 'Error desconocido';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            errorMessage.textContent = 'No se pudo conectar con el servidor.';
            errorMessage.style.display = 'block';
        }
    });
});