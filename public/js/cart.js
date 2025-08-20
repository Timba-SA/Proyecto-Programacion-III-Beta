let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    guardarCarrito();
    actualizarVistaCarrito();
}

function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito();
    actualizarVistaCarrito();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
    const cartCount = document.getElementById('cart-count');
    const carritoItemsContainer = document.querySelector('#carrito-flotante .carrito-items');
    const carritoTotalPrecio = document.getElementById('carrito-total-precio');
    const carritoDetalladoContainer = document.getElementById('carrito-detallado-container');
    const totalCompraElement = document.getElementById('total-compra');

    // Actualizar contador del header
    if (cartCount) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        cartCount.textContent = totalItems;
    }

    let totalGeneral = 0;
    carrito.forEach(item => {
        totalGeneral += item.precio * item.cantidad;
    });

    // Actualizar carrito flotante
    if (carritoItemsContainer && carritoTotalPrecio) {
        carritoItemsContainer.innerHTML = '';
        if (carrito.length === 0) {
            carritoItemsContainer.innerHTML = '<p style="padding: 20px 0; text-align: center;">Tu carrito está vacío.</p>';
        } else {
            carrito.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'carrito-item-flotante';
                itemDiv.innerHTML = `
                    <img src="${item.imagen}" alt="${item.nombre}">
                    <div class="item-info">
                        <span>${item.nombre} (x${item.cantidad})</span>
                        <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                    <button class="eliminar-item-btn" data-id="${item.id}">&times;</button>
                `;
                carritoItemsContainer.appendChild(itemDiv);
            });
        }
        carritoTotalPrecio.textContent = `$${totalGeneral.toFixed(2)}`;
    }

    // Actualizar página del carrito detallado
    if (carritoDetalladoContainer && totalCompraElement) {
        if (carrito.length === 0) {
            carritoDetalladoContainer.innerHTML = '<p>Tu carrito está vacío. <a href="index.html" style="color: blue; text-decoration: underline;">Volver a la tienda</a>.</p>';
        } else {
            const tabla = document.createElement('table');
            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th style="text-align: center;">Cantidad</th>
                        <th style="text-align: right;">Precio Unit.</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const tbody = tabla.querySelector('tbody');
            carrito.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center;">
                            <img src="${item.imagen}" alt="${item.nombre}">
                            <span>${item.nombre}</span>
                        </div>
                    </td>
                    <td style="text-align: center;">${item.cantidad}</td>
                    <td style="text-align: right;">$${item.precio.toFixed(2)}</td>
                    <td style="text-align: right;"><b>$${subtotal.toFixed(2)}</b></td>
                `;
                tbody.appendChild(fila);
            });
            carritoDetalladoContainer.innerHTML = '';
            carritoDetalladoContainer.appendChild(tabla);
        }
        totalCompraElement.textContent = `Total: $${totalGeneral.toFixed(2)}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('eliminar-item-btn')) {
            const id = parseInt(e.target.dataset.id);
            eliminarDelCarrito(id);
        }
        if (e.target.id === 'vaciar-carrito') {
            vaciarCarrito();
        }
    });
    actualizarVistaCarrito();
});