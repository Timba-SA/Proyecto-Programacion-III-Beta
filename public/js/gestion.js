// Patovica de la puerta
if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
    alert('Acceso denegado. Por favor, inicie sesión.');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const formVentas = document.getElementById('form-ventas');
    
    formVentas.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevaVenta = {
            cliente: formVentas.querySelector('#venta-cliente').value,
            producto: formVentas.querySelector('#venta-producto').value,
            total: parseFloat(formVentas.querySelector('#venta-total').value),
            fecha: formVentas.querySelector('#venta-fecha').value,
        };
        
        try {
            const response = await fetch('/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaVenta),
            });
            const data = await response.json();
            if (data.success) {
                alert('Venta registrada con éxito');
                formVentas.reset();
            } else {
                alert('Error al registrar la venta');
            }
        } catch (error) {
            console.error('Error al registrar venta:', error);
            alert('No se pudo conectar al servidor para registrar la venta.');
        }
    });

    // Podés agregar la lógica para el form de gastos de la misma manera
});