document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username')?.value || 'admin';
        const password = document.getElementById('password')?.value || '1234';

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
                if (errorMessage) {
                    errorMessage.textContent = data.message || 'Error desconocido';
                    errorMessage.style.display = 'block';
                } else {
                    alert(data.message || 'Error desconocido');
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            if (errorMessage) {
                errorMessage.textContent = 'No se pudo conectar con el servidor.';
                errorMessage.style.display = 'block';
            } else {
                alert('No se pudo conectar con el servidor.');
            }
        }
    });
});