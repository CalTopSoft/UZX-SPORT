document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const sidebarItems = document.querySelectorAll('.sidebar li');
    const sections = document.querySelectorAll('.content');

    if (isAdmin) {
        document.querySelector('.sidebar li[data-section="admin"]').classList.remove('hidden');
        document.querySelector('#admin').classList.remove('hidden');
    }

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(item.dataset.section).classList.add('active');
        });
    });

    fetch('../data/torneos.json')
        .then(response => response.json())
        .catch(() => [])
        .then(data => {
            const equiposRanking = calcularRanking(data);
            mostrarRanking(equiposRanking);
        });

    fetch('../data/name.json')
        .then(response => response.json())
        .catch(() => [])
        .then(nameData => {
            window.nameData = nameData;
        });

    function calcularRanking(torneos) {
        const equiposPuntos = {};
        torneos.forEach(torneo => {
            torneo.resultados.forEach((equipo, index) => {
                const puntos = (equipo.total * 0.5) + ((index + 1) * 10) + (equipo.kills * 0.2);
                equiposPuntos[equipo.nombre] = (equiposPuntos[equipo.nombre] || 0) + puntos;
            });
        });
        return Object.entries(equiposPuntos)
            .sort((a, b) => b[1] - a[1])
            .map(([nombre, puntos], index) => ({ nombre, puntos, posicion: index + 1 }));
    }

    function mostrarRanking(equipos) {
        const rankingList = document.getElementById('ranking-list');
        equipos.forEach((equipo, index) => {
            const div = document.createElement('div');
            div.className = 'ranking-item';
            const trend = index === 0 || (index > 0 && equipos[index - 1].puntos > equipo.puntos) ? '↑' : '↓';
            const trendClass = trend === '↑' ? 'trend-up' : 'trend-down';
            div.innerHTML = `
                <img src="../logos/${equipo.nombre.toLowerCase().replace(/\s/g, '_')}.png" alt="${equipo.nombre}" onerror="this.src='../logos/default.png'">
                <span>#${equipo.posicion}</span> ${equipo.nombre} - ${equipo.puntos.toFixed(1)} pts <span class="${trendClass}">${trend}</span>
            `;
            rankingList.appendChild(div);
        });
    }

    const resultadosInput = document.getElementById('resultados-input');
    for (let i = 1; i <= 8; i++) {
        const div = document.createElement('div');
        div.innerHTML = `
            <input type="text" list="equipos-list" placeholder="Nombre Equipo ${i}" required>
            <input type="number" placeholder="Kills" required>
            <input type="text" placeholder="Tops (ej. 1,2,3,4)" required>
            <input type="number" placeholder="Total" required>
        `;
        resultadosInput.appendChild(div);
    }
    const datalist = document.createElement('datalist');
    datalist.id = 'equipos-list';
    window.nameData.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.nombre;
        datalist.appendChild(option);
    });
    resultadosInput.appendChild(datalist);

    document.getElementById('admin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('tabla-img');
        const file = fileInput.files[0];
        const resultados = Array.from(resultadosInput.children).filter(d => d.tagName === 'DIV').map(div => {
            const [nombre, kills, tops, total] = div.querySelectorAll('input');
            return {
                nombre: nombre.value,
                kills: parseInt(kills.value),
                top: tops.value.split(',').map(Number),
                total: parseInt(total.value)
            };
        });

        fetch('../data/torneos.json')
            .then(response => response.json())
            .catch(() => [])
            .then(data => {
                const nuevoId = data.length + 1;
                const nuevoTorneo = {
                    id: nuevoId,
                    fecha: new Date().toISOString().split('T')[0],
                    imagen: `tabla_torneo_${nuevoId}.png`,
                    resultados
                };
                data.push(nuevoTorneo);
                localStorage.setItem('torneos', JSON.stringify(data));
                actualizarNameJson(resultados);
                alert('Torneo subido con éxito');
                window.location.reload();
            });
    });

    function actualizarNameJson(resultados) {
        fetch('../data/name.json')
            .then(response => response.json())
            .catch(() => [])
            .then(data => {
                resultados.forEach(equipo => {
                    if (!data.some(e => e.nombre === equipo.nombre)) {
                        data.push({ nombre: equipo.nombre, imagen: `${equipo.nombre.toLowerCase().replace(/\s/g, '_')}.png` });
                    }
                });
                localStorage.setItem('name', JSON.stringify(data));
            });
    }
});