// Patovica de la puerta
if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
    alert('Acceso denegado. Por favor, inicie sesión.');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const formVentas = document.getElementById('form-ventas');
    const formGastos = document.getElementById('form-gastos');
    const tablaVentasBody = document.getElementById('tabla-ventas-body');
    const tablaGastosBody = document.getElementById('tabla-gastos-body');

    const formIA = document.getElementById('form-ia');
    const iaMailTexto = document.getElementById('ia-mail-texto');
    const iaRespuestaContainer = document.getElementById('ia-respuesta-container');
    const iaRespuestaTexto = document.getElementById('ia-respuesta-texto');

    let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

    const guardarDatos = () => {
        localStorage.setItem('ventas', JSON.stringify(ventas));
        localStorage.setItem('gastos', JSON.stringify(gastos));
    };

    const renderizarTablas = () => {
        if (!tablaVentasBody || !tablaGastosBody) return;

        tablaVentasBody.innerHTML = '';
        ventas.forEach(venta => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${venta.cliente}</td>
                <td>${venta.producto}</td>
                <td>${venta.metodoPago}</td>
                <td>$${(Number(venta.total) || 0).toFixed(2)}</td>
                <td>${venta.fecha}</td>
            `;
            tablaVentasBody.appendChild(fila);
        });

        tablaGastosBody.innerHTML = '';
        gastos.forEach(gasto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${gasto.descripcion}</td>
                <td>$${(Number(gasto.monto) || 0).toFixed(2)}</td>
                <td>${gasto.metodoPago}</td>
                <td>${gasto.fecha}</td>
            `;
            tablaGastosBody.appendChild(fila);
        });
    };

    const registrarVenta = (e) => {
        e.preventDefault();
        const nuevaVenta = {
            cliente: document.getElementById('venta-cliente').value,
            producto: document.getElementById('venta-producto').value,
            cantidad: parseInt(document.getElementById('venta-cantidad').value) || 1,
            metodoPago: document.getElementById('venta-metodo-pago').value,
            total: parseFloat(document.getElementById('venta-total').value) || 0,
            fecha: document.getElementById('venta-fecha').value,
        };
        ventas.push(nuevaVenta);
        guardarDatos();
        renderizarTablas();
        formVentas.reset();

        // Opcional: enviar al servidor para registro centralizado
        fetch('/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaVenta)
        }).catch(()=>{/* no bloquear al usuario si falla el servidor */});
    };

    const registrarGasto = (e) => {
        e.preventDefault();
        const nuevoGasto = {
            descripcion: document.getElementById('gasto-descripcion').value,
            monto: parseFloat(document.getElementById('gasto-monto').value) || 0,
            metodoPago: document.getElementById('gasto-metodo-pago').value,
            fecha: document.getElementById('gasto-fecha').value,
        };
        gastos.push(nuevoGasto);
        guardarDatos();
        renderizarTablas();
        formGastos.reset();
    };

    const generarRespuestaIA = async (e) => {
        e.preventDefault();
        const textoMail = iaMailTexto.value.trim();
        if (!textoMail) {
            alert('Por favor, pegá el texto del correo.');
            return;
        }

        iaRespuestaTexto.textContent = 'Pensando...';
        iaRespuestaContainer.style.display = 'block';

        try {
            const response = await fetch('/api/generar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ textoMail }),
            });

            if (!response.ok) {
                const err = await response.json().catch(()=>({error: 'Error del servidor'}));
                iaRespuestaTexto.textContent = err.error || 'Error del servidor';
                return;
            }

            const data = await response.json();
            iaRespuestaTexto.textContent = data.respuesta || data.error || 'No se obtuvo respuesta.';
        } catch (error) {
            console.error('Error al conectar con el backend:', error);
            iaRespuestaTexto.textContent = 'No se pudo conectar con el servidor de IA.';
        }
    };

    formVentas?.addEventListener('submit', registrarVenta);
    formGastos?.addEventListener('submit', registrarGasto);
    formIA?.addEventListener('submit', generarRespuestaIA);

    renderizarTablas();
});