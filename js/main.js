document.addEventListener('DOMContentLoaded', () => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (loggedIn) {
        loginLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');
    }

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        const username = prompt('Usuario:');
        const password = prompt('Contraseña:');
        if (username === 'admin' && password === 'uzx2023') {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('isAdmin', 'true');
            alert('¡Bienvenido, Admin!');
            window.location.reload();
        } else if (username && password) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('isAdmin', 'false');
            alert('¡Sesión iniciada!');
            window.location.reload();
        }
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('isAdmin');
        alert('Sesión cerrada');
        window.location.reload();
    });
});