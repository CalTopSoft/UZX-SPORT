document.addEventListener('DOMContentLoaded', () => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userId = localStorage.getItem('userId') || `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);

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

    // Cargar datos desde GitHub o localStorage
    let scrimsData = JSON.parse(localStorage.getItem('scrims')) || [];
    let nameData = JSON.parse(localStorage.getItem('name')) || [
        {"nombre": "21S", "imagen": "21S.png"},
        {"nombre": "7N", "imagen": "7N.png"},
        {"nombre": "ARMADYL", "imagen": "AD.png"},
        {"nombre": "HELLSTAR", "imagen": "AHS.png"},
        {"nombre": "ALQ MOB", "imagen": "ALQ.png"},
        {"nombre": "ARENA", "imagen": "ARENA.png"},
        {"nombre": "T1", "imagen": "t1.png"},
        {"nombre": "AS PC", "imagen": "AS.png"}
    ];
    let rankingsData = JSON.parse(localStorage.getItem('rankings')) || [];

    window.nameData = nameData;
    mostrarScrims(scrimsData);
    actualizarRanking(true); // Cargar inicial sin animación
    cargarFormularioAdmin();

    // Mostrar última actualización
    const lastUpdated = localStorage.getItem('lastUpdated') || '--';
    document.getElementById('last-updated').textContent = `Última actualización: ${lastUpdated}`;

    function actualizarRanking(animate = false) {
        const puntosPorTop = [10, 9, 8, 7, 6, 5, 4, 3];
        const equiposPuntos = {};

        scrimsData.forEach(scrim => {
            scrim.resultados.forEach((equipo, index) => {
                equiposPuntos[equipo.nombre] = (equiposPuntos[equipo.nombre] || 0) + puntosPorTop[index];
            });
        });

        const rankingActual = Object.entries(equiposPuntos)
            .map(([nombre, puntos]) => ({ nombre, puntos }))
            .sort((a, b) => b.puntos - a.puntos);

        const rankingAnterior = rankingsData.length ? rankingsData : rankingActual.map(e => ({ ...e, puntos: 0, posicion: rankingActual.length + 1 }));
        const nuevoRanking = rankingActual.map((equipo, index) => {
            const anterior = rankingAnterior.find(e => e.nombre === equipo.nombre) || { puntos: 0, posicion: rankingAnterior.length + 1 };
            return {
                nombre: equipo.nombre,
                puntos: equipo.puntos,
                posicion: index + 1,
                posicionAnterior: anterior.posicion
            };
        });

        localStorage.setItem('rankings', JSON.stringify(nuevoRanking));
        rankingsData = nuevoRanking;
        mostrarRanking(nuevoRanking, animate);
    }

    function mostrarRanking(equipos, animate) {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';
        equipos.forEach((equipo, index) => {
            const div = document.createElement('div');
            div.className = 'ranking-item';
            const trend = equipo.posicion < equipo.posicionAnterior ? 'up' : (equipo.posicion > equipo.posicionAnterior ? 'down' : '');
            const trendIcon = trend ? `<img src="../assets/icons/${trend}.png" alt="${trend}">` : '';
            const posicionChange = trend ? Math.abs(equipo.posicion - equipo.posicionAnterior) : '';
            div.innerHTML = `
                <img src="../logos/${equipo.nombre.toLowerCase().replace(/\s/g, '_')}.png" alt="${equipo.nombre}" onerror="this.src='../logos/default.png'">
                <span>${equipo.nombre}</span>
                <span>${equipo.puntos} pts</span>
                <span class="trend">#${equipo.posicion} ${trendIcon} ${posicionChange ? posicionChange : ''}</span>
            `;
            rankingList.appendChild(div);
            if (animate) {
                setTimeout(() => div.classList.add('show'), index * 100);
            } else {
                div.classList.add('show');
            }
        });
    }

    function mostrarScrims(scrims) {
        const container = document.getElementById('scrims-container');
        container.innerHTML = '';
        scrims.forEach(scrim => {
            const div = document.createElement('div');
            div.className = 'scrim-item';
            const userLikes = JSON.parse(localStorage.getItem(`likes_${userId}`)) || [];
            const hasLiked = userLikes.includes(scrim.id);
            div.innerHTML = `
                <h3>Scrim ${scrim.id}</h3>
                <p>Fecha: ${scrim.fecha}</p>
                <img src="${scrim.imagenBase64 || '../assets/imgs/' + scrim.imagen}" alt="Tabla Scrim ${scrim.id}">
                <button class="like-btn" data-id="${scrim.id}" ${loggedIn && !hasLiked ? '' : 'disabled'}>Like (${scrim.likes || 0})</button>
            `;
            container.appendChild(div);
        });

        if (loggedIn) {
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const scrimId = btn.dataset.id;
                    scrimsData = JSON.parse(localStorage.getItem('scrims')) || [];
                    const scrim = scrimsData.find(s => s.id == scrimId);
                    if (scrim) {
                        scrim.likes = (scrim.likes || 0) + 1;
                        let userLikes = JSON.parse(localStorage.getItem(`likes_${userId}`)) || [];
                        userLikes.push(scrimId);
                        localStorage.setItem(`likes_${userId}`, JSON.stringify(userLikes));
                        localStorage.setItem('scrims', JSON.stringify(scrimsData));
                        btn.textContent = `Like (${scrim.likes})`;
                        btn.disabled = true;
                    }
                });
            });
        }
    }

    function cargarFormularioAdmin() {
        const resultadosInput = document.getElementById('resultados-input');
        const tops = [1, 2, 3, 4, 5, 6, 7, 8];
        tops.forEach((top, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" list="equipos-list" name="nombre-${i}" required oninput="checkEquipo(this)"></td>
                <td><input type="text" name="top-${i}" value="${top}" readonly></td>
            `;
            resultadosInput.appendChild(tr);
        });
        const datalist = document.createElement('datalist');
        datalist.id = 'equipos-list';
        window.nameData.forEach(equipo => {
            const option = document.createElement('option');
            option.value = equipo.nombre;
            datalist.appendChild(option);
        });
        resultadosInput.appendChild(datalist);
    }

    window.checkEquipo = function(input) {
        const exists = window.nameData.some(e => e.nombre === input.value);
        input.style.borderColor = exists ? '#1B5E20' : '#F44336';
    };

    document.getElementById('fill-random').addEventListener('click', () => {
        const equiposDisponibles = [
            {"nombre": "21S", "imagen": "21S.png"},
            {"nombre": "7N", "imagen": "7N.png"},
            {"nombre": "ARMADYL", "imagen": "AD.png"},
            {"nombre": "HELLSTAR", "imagen": "AHS.png"},
            {"nombre": "ALQ MOB", "imagen": "ALQ.png"},
            {"nombre": "ARENA", "imagen": "ARENA.png"},
            {"nombre": "T1", "imagen": "t1.png"},
            {"nombre": "AS PC", "imagen": "AS.png"}
        ];
        const shuffled = equiposDisponibles.sort(() => 0.5 - Math.random()).slice(0, 8);
        const inputs = document.querySelectorAll('#resultados-input input[name^="nombre-"]');
        inputs.forEach((input, i) => {
            input.value = shuffled[i].nombre;
            checkEquipo(input);
        });
    });

    document.getElementById('admin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('tabla-img');
        const file = fileInput.files[0];
        const resultados = Array.from(document.querySelectorAll('#resultados-input tr')).map(tr => {
            const [nombre, top] = tr.querySelectorAll('input');
            return { nombre: nombre.value, top: parseInt(top.value) };
        });

        const reader = new FileReader();
        reader.onload = function(event) {
            scrimsData = JSON.parse(localStorage.getItem('scrims')) || [];
            const nuevoId = scrimsData.length + 1;
            const nuevoScrim = {
                id: nuevoId,
                fecha: new Date().toISOString().split('T')[0],
                imagenBase64: event.target.result, // Guardar imagen en base64
                likes: 0,
                resultados
            };
            scrimsData.push(nuevoScrim);
            localStorage.setItem('scrims', JSON.stringify(scrimsData));
            localStorage.setItem('lastUpdated', new Date().toLocaleString());
            document.getElementById('last-updated').textContent = `Última actualización: ${new Date().toLocaleString()}`;
            actualizarNameJson(resultados);
            actualizarRanking(true); // Con animación
            mostrarScrims(scrimsData);
            alert('Scrim subido con éxito');
        };
        reader.readAsDataURL(file);
    });

    function actualizarNameJson(resultados) {
        let nameData = JSON.parse(localStorage.getItem('name')) || [];
        resultados.forEach(equipo => {
            if (!nameData.some(e => e.nombre === equipo.nombre)) {
                nameData.push({ nombre: equipo.nombre, imagen: `${equipo.nombre.toLowerCase().replace(/\s/g, '_')}.png` });
            }
        });
        localStorage.setItem('name', JSON.stringify(nameData));
        window.nameData = nameData;
    }
});