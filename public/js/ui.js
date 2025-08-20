document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DEL DOM (ELEMENTOS DE LA PÁGINA) ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    const pageOverlay = document.querySelector('.page-overlay');
    const navOverlayClose = document.querySelector('.nav-overlay-close');
    const carritoFlotanteBtn = document.getElementById('carrito-flotante-btn');
    const carritoFlotante = document.getElementById('carrito-flotante');
    
    // --- Elementos del Login del Menú ---
    const navLoginForm = document.getElementById('nav-login-form');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const navLoginError = document.getElementById('nav-login-error');

    // --- FUNCIÓN PARA CONTROLAR EL MENÚ DESPLEGABLE ---
    function toggleMenu() {
        hamburgerMenu?.classList.toggle('open');
        navOverlay?.classList.toggle('open');
        pageOverlay?.classList.toggle('open');
    }

    // --- FUNCIÓN PARA ACTUALIZAR LA VISTA DEL LOGIN ---
    // Se fija si el admin ya inició sesión y muestra/oculta lo que corresponde.
    function actualizarVistaLogin() {
        if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
            navLoginForm.style.display = 'none';
            adminLinkContainer.style.display = 'block';
        } else {
            navLoginForm.style.display = 'flex';
            adminLinkContainer.style.display = 'none';
        }
    }

    // --- EVENT LISTENERS (CUANDO EL USUARIO HACE ALGO) ---
    hamburgerMenu?.addEventListener('click', toggleMenu);
    pageOverlay?.addEventListener('click', toggleMenu);
    navOverlayClose?.addEventListener('click', toggleMenu);
    
    carritoFlotanteBtn?.addEventListener('click', () => {
        carritoFlotante?.classList.toggle('mostrar');
    });

    // --- LÓGICA DEL LOGIN DENTRO DEL MENÚ (LO NUEVO) ---
    navLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        navLoginError.textContent = ''; // Limpia errores anteriores

        const username = document.getElementById('nav-username').value;
        const password = document.getElementById('nav-password').value;

        // Le mandamos los datos al backend para ver si son correctos
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                // Si el login es correcto...
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                actualizarVistaLogin(); // Actualizamos el menú para mostrar el botón
            } else {
                // Si el login falla...
                navLoginError.textContent = 'Usuario o contraseña incorrectos.';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            navLoginError.textContent = 'Error de conexión con el servidor.';
        }
    });

    // --- INICIALIZACIÓN ---
    // Apenas carga la página, revisamos si el admin ya estaba logueado
    // para que el menú aparezca como tiene que ser.
    actualizarVistaLogin();
});