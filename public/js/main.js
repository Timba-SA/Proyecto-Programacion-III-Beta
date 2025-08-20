document.addEventListener('DOMContentLoaded', () => {
    // LISTA DE PRODUCTOS (asegurate que los nombres de archivos coincidan con /public/img)
    const productos = [
        { "id": 1, "nombre": "Buzo Lafayette Negro", "categoria": "buzos", "precio": 55.00, "imagen": "img/Buzo negro.jpeg" },
        { "id": 2, "nombre": "Buzo Givenchy Negro", "categoria": "buzos", "precio": 95.00, "imagen": "img/Buzo Givenchy.jpeg" },
        { "id": 3, "nombre": "Buzo Fresh Eyes Celeste", "categoria": "buzos", "precio": 48.50, "imagen": "img/Buzo Blanco.jpeg" },
        { "id": 4, "nombre": "Buzo Graffiti Beige", "categoria": "buzos", "precio": 52.00, "imagen": "img/Boys' Sweatshirts _ ZARA United States.jpeg" },
        { "id": 5, "nombre": "Buzo Cuello Redondo Marrón", "categoria": "buzos", "precio": 42.99, "imagen": "img/download.jpeg" },
        { "id": 15, "nombre": "Buzo Liso Beige", "categoria": "buzos", "precio": 45.00, "imagen": "img/TAPERED PLUSH PANTS.jpeg" },
        { "id": 16, "nombre": "Buzo Explorer Verde", "categoria": "buzos", "precio": 50.00, "imagen": "img/SUDADERA ESTAMPADO RELIEVE.jpeg" },
        { "id": 23, "nombre": "Buzo Urbano Lila", "categoria": "buzos", "precio": 58.00, "imagen": "img/Buzo rosado.jpeg" },
        { "id": 24, "nombre": "Sweater Rayado con Cierre", "categoria": "buzos", "precio": 62.00, "imagen": "img/Prendas de Punto de Niña _ ZARA España.jpeg" },
        { "id": 6, "nombre": "Pantalón Cargo Lavado Beige", "categoria": "pantalones", "precio": 75.00, "imagen": "img/Cargo marron.jpeg" },
        { "id": 7, "nombre": "Pantalón Cargo Técnico Gris", "categoria": "pantalones", "precio": 80.00, "imagen": "img/Cargo gris oscuro.jpeg" },
        { "id": 8, "nombre": "Pantalón Cargo Jean Gris", "categoria": "pantalones", "precio": 78.50, "imagen": "img/Cargo gris.jpeg" },
        { "id": 9, "nombre": "Jean Recto Negro", "categoria": "pantalones", "precio": 68.00, "imagen": "img/download (1).jpeg" },
        { "id": 17, "nombre": "Jean Ancho con Rotos", "categoria": "pantalones", "precio": 72.00, "imagen": "img/How to Style Wide-Leg Jeans_ 21 Outfit Ideas to Try in 2025.jpeg" },
        { "id": 18, "nombre": "Jean Carpintero Azul", "categoria": "pantalones", "precio": 69.50, "imagen": "img/Pantalon azul cargo.jpeg" },
        { "id": 19, "nombre": "Jean Ancho Rotos Celeste", "categoria": "pantalones", "precio": 71.00, "imagen": "img/Jeans Para Meninas Ver Tudo _ ZARA Brasil.jpeg" },
        { "id": 25, "nombre": "Jean Slouchy Azul", "categoria": "pantalones", "precio": 65.00, "imagen": "img/Estos son los 5 estilos de jeans que triunfan en el street-style.jpeg" },
        { "id": 10, "nombre": "Chomba Lisa Azul Marino", "categoria": "remeras", "precio": 35.00, "imagen": "img/___ New Ver Tudo _ ZARA Brasil.jpeg" },
        { "id": 13, "nombre": "Remera Fly Master Gris", "categoria": "remeras", "precio": 28.00, "imagen": "img/Remera Gris.jpeg" },
        { "id": 14, "nombre": "Remera Tokyo Negra", "categoria": "remeras", "precio": 27.50, "imagen": "img/Remera Negra.jpeg" },
        { "id": 20, "nombre": "Remera Urban Artist Negra", "categoria": "remeras", "precio": 29.00, "imagen": "img/Playeras para Niño _ ZARA.jpeg" },
        { "id": 21, "nombre": "Remera Lisa Blanca", "categoria": "remeras", "precio": 22.00, "imagen": "img/Remera Blanca.jpeg" },
        { "id": 26, "nombre": "Remera \"74\" Gris Oscuro", "categoria": "remeras", "precio": 26.50, "imagen": "img/Remera 24.jpeg" },
        { "id": 22, "nombre": "Camisa Oversize Amarilla", "categoria": "camisas", "precio": 40.00, "imagen": "img/PANTALON LARGE À TAILLE ÉLASTIQUE.jpeg" },
        { "id": 27, "nombre": "Camisa Satinada a Rayas", "categoria": "camisas", "precio": 45.50, "imagen": "img/Camisa satinada de rayas.jpeg" }
    ];

    const productosContainer = document.getElementById('productos-container');

    function renderizarProductos(productosAMostrar) {
        if (!productosContainer) return;
        productosContainer.innerHTML = '';
        productosAMostrar.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="product-card-info">
                    <p>${producto.nombre}</p>
                    <span>$${producto.precio.toFixed(2)}</span>
                    <button class="agregar-carrito-btn" data-id="${producto.id}">Agregar al Carrito</button>
                </div>
            `;
            productosContainer.appendChild(card);
        });
    }

    function filtrarDesdeURL() {
        const parametrosURL = new URLSearchParams(window.location.search);
        const categoria = parametrosURL.get('categoria');
        const productosFiltrados = categoria ? productos.filter(p => p.categoria === categoria) : productos;
        renderizarProductos(productosFiltrados);
    }
    
    productosContainer?.addEventListener('click', (e) => {
        if (e.target.classList.contains('agregar-carrito-btn')) {
            const id = parseInt(e.target.dataset.id);
            const productoSeleccionado = productos.find(p => p.id === id);
            if (productoSeleccionado) {
                // función global definida en cart.js
                if (typeof window.agregarAlCarrito === 'function') {
                    window.agregarAlCarrito(productoSeleccionado);
                } else {
                    // fallback: llamar si está en scope global sin window
                    if (typeof agregarAlCarrito === 'function') agregarAlCarrito(productoSeleccionado);
                }
            }
        }
    });

    // Carga inicial
    filtrarDesdeURL();
});