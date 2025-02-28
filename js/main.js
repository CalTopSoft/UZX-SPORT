document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    // Función para actualizar visibilidad de enlaces
    function updateAuthLinks() {
        const loggedIn = localStorage.getItem('loggedIn') === 'true';
        if (loggedIn) {
            loginLink.style.display = 'none'; // Oculta completamente
            logoutLink.style.display = 'inline'; // Muestra
        } else {
            loginLink.style.display = 'inline'; // Muestra
            logoutLink.style.display = 'none'; // Oculta completamente
        }
    }

    // Inicializar visibilidad al cargar la página
    updateAuthLinks();

    // Evento para "Login"
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        const username = prompt('Usuario:');
        const password = prompt('Contraseña:');
        if (username && password) { // Cualquier usuario con credenciales no vacías
            localStorage.setItem('loggedIn', 'true');
            if (username === 'admin' && password === 'uzx2023') {
                localStorage.setItem('isAdmin', 'true');
                alert('¡Login exitoso como administrador!');
            } else {
                localStorage.setItem('isAdmin', 'false');
                alert('¡Login exitoso como usuario!');
            }
            updateAuthLinks();
            window.dispatchEvent(new Event('authChange')); // Notificar a otras páginas
            location.reload(); // Recargar para reflejar cambios
        } else {
            alert('Por favor, ingresa un usuario y contraseña válidos.');
        }
    });

    // Evento para "Logout"
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('loggedIn', 'false');
        localStorage.removeItem('isAdmin');
        alert('¡Sesión cerrada!');
        updateAuthLinks();
        window.dispatchEvent(new Event('authChange')); // Notificar a otras páginas
        location.reload(); // Recargar para reflejar cambios
    });
});