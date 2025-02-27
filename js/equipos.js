document.addEventListener('DOMContentLoaded', () => {
    fetch('../data/name.json')
        .then(response => response.json())
        .catch(() => [])
        .then(data => mostrarEquipos(data));

    function mostrarEquipos(equipos) {
        const container = document.getElementById('equipos-container');
        equipos.forEach(equipo => {
            const div = document.createElement('div');
            div.className = 'equipo-item';
            div.innerHTML = `
                <img src="../logos/${equipo.imagen}" alt="${equipo.nombre}" onerror="this.src='../logos/default.png'">
                <h3>${equipo.nombre}</h3>
                <div class="rooster-details hidden">
                    <p>Roosters: Ejemplo (pendiente de datos reales)</p>
                    <p>Jugador: Player1, 22 años, Ecuador</p>
                    <p>Armas: M4A1 (Silenciador, Mira 4x)</p>
                </div>
            `;
            div.addEventListener('click', () => {
                const details = div.querySelector('.rooster-details');
                details.classList.toggle('hidden');
            });
            container.appendChild(div);
        });
    }
});