document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Mostrar u ocultar enlaces según el estado de autenticación
    function updateAuthLinks() {
        if (localStorage.getItem('loggedIn') === 'true') {
            loginLink.classList.add('hidden');
            logoutLink.classList.remove('hidden');
        } else {
            loginLink.classList.remove('hidden');
            logoutLink.classList.add('hidden');
        }
    }

    // Inicializar visibilidad de enlaces
    updateAuthLinks();

    // Evento para "Login"
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        const username = prompt('Usuario:');
        const password = prompt('Contraseña:');
        if (username === 'admin' && password === 'uzx2023') {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('isAdmin', 'true');
            alert('¡Login exitoso!');
            updateAuthLinks();
            // Disparar evento personalizado para que otras páginas reaccionen
            window.dispatchEvent(new Event('authChange'));
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });

    // Evento para "Logout"
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('loggedIn', 'false');
        localStorage.removeItem('isAdmin');
        alert('¡Sesión cerrada!');
        updateAuthLinks();
        // Disparar evento personalizado para que otras páginas reaccionen
        window.dispatchEvent(new Event('authChange'));
    });
});