document.addEventListener('DOMContentLoaded', async () => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userId = localStorage.getItem('userId') || `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);

    const sidebarItems = document.querySelectorAll('.sidebar li');
    const sections = document.querySelectorAll('.content');
    let isUploading = false;

    // Función para actualizar visibilidad de Admin
    function updateAdminVisibility() {
        const loggedInNow = localStorage.getItem('loggedIn') === 'true';
        const isAdminNow = localStorage.getItem('isAdmin') === 'true';
        const adminSidebar = document.querySelector('.sidebar li[data-section="admin"]');
        const adminSection = document.getElementById('admin');

        if (loggedInNow && isAdminNow) {
            adminSidebar.style.display = 'block'; // Mostrar para admin
            adminSection.style.display = 'block';
        } else {
            adminSidebar.style.display = 'none'; // Ocultar si no es admin
            adminSection.style.display = 'none';
        }
    }

    // Inicializar visibilidad
    updateAdminVisibility();

    // Escuchar cambios de autenticación
    window.addEventListener('authChange', updateAdminVisibility);

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(item.dataset.section).classList.add('active');
        });
    });

    const githubBaseUrl = 'https://raw.githubusercontent.com/CalTopSoft/UZX-SPORT/main/data/';
    let scrimsData = [];
    let nameData = [];
    let rankingsData = [];

    try {
        const [scrimsResponse, nameResponse, rankingsResponse] = await Promise.all([
            fetch(`${githubBaseUrl}scrims.json`).then(res => res.ok ? res.json() : []),
            fetch(`${githubBaseUrl}name.json`).then(res => res.ok ? res.json() : []),
            fetch(`${githubBaseUrl}rankings.json`).then(res => res.ok ? res.json() : [])
        ]);
        scrimsData = scrimsResponse;
        nameData = nameResponse;
        rankingsData = rankingsResponse;

        window.nameData = nameData;
        mostrarScrims(scrimsData);
        actualizarRanking(true);
        cargarFormularioAdmin();

        const lastUpdated = scrimsData.length > 0 ? scrimsData[scrimsData.length - 1].fecha : '--';
        document.getElementById('last-updated').textContent = `Última actualización: ${lastUpdated}`;
    } catch (err) {
        console.error('Error loading data from GitHub:', err);
    }

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
            const anterior = rankingAnterior.find(e => e.nombre === equipo.nombre) || { puntos: 0, posicion: rankingActual.length + 1 };
            return {
                nombre: equipo.nombre,
                puntos: equipo.puntos,
                posicion: index + 1,
                posicionAnterior: anterior.posicion
            };
        });

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
            const trendIcon = trend ? `<img src="https://raw.githubusercontent.com/CalTopSoft/UZX-SPORT/main/assets/icons/${trend}.png" alt="${trend}">` : `<span class="trend-placeholder"></span>`;
            const posicionChange = trend ? Math.abs(equipo.posicion - equipo.posicionAnterior) : '<span class="change-placeholder"></span>';
            const equipoData = window.nameData.find(e => e.nombre === equipo.nombre) || { imagen: 'placeholder.png' };
            const logoUrl = `https://raw.githubusercontent.com/CalTopSoft/UZX-SPORT/main/logos/${equipoData.imagen}`;
            console.log(`Intentando cargar logo para ${equipo.nombre}: ${logoUrl}`);
            div.innerHTML = `
                <img src="${logoUrl}" alt="${equipo.nombre}" onerror="console.error('Error cargando logo para ${equipo.nombre}: ${logoUrl}'); this.src='https://raw.githubusercontent.com/CalTopSoft/UZX-SPORT/main/assets/imgs/placeholder.png'; this.onerror=null;">
                <span>${equipo.nombre}</span>
                <span>${equipo.puntos} pts</span>
                <span class="trend">#${equipo.posicion} ${trendIcon} ${posicionChange}</span>
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
            const hasLiked = userLikes.includes(scrim.id.toString());
            div.innerHTML = `
                <h3>Scrim ${scrim.id}</h3>
                <p>Fecha: ${scrim.fecha}</p>
                <img src="https://raw.githubusercontent.com/CalTopSoft/UZX-SPORT/main/assets/imgs/${scrim.imagen}" alt="Tabla Scrim ${scrim.id}" onerror="this.src='https://raw.githubusercontent.com/CalTopSoft/UZX-SPORT/main/assets/imgs/placeholder.png'; this.onerror=null;">
                <button class="like-btn" data-id="${scrim.id}" ${loggedIn && !hasLiked ? '' : 'disabled'}>Me Gusta ${scrim.likes || 0}</button>
            `;
            container.appendChild(div);
        });

        if (loggedIn) {
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const scrimId = btn.dataset.id;
                    const scrim = scrimsData.find(s => s.id == scrimId);
                    if (scrim) {
                        scrim.likes = (scrim.likes || 0) + 1;
                        let userLikes = JSON.parse(localStorage.getItem(`likes_${userId}`)) || [];
                        userLikes.push(scrimId);
                        localStorage.setItem(`likes_${userId}`, JSON.stringify(userLikes));
                        await updateGitHubFiles();
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
        input.style.borderColor = exists ? '#1B3C34' : '#F44336';
    };

    document.getElementById('fill-random').addEventListener('click', () => {
        const equiposDisponibles = window.nameData.sort(() => 0.5 - Math.random()).slice(0, 8);
        const inputs = document.querySelectorAll('#resultados-input input[name^="nombre-"]');
        inputs.forEach((input, i) => {
            input.value = equiposDisponibles[i].nombre;
            checkEquipo(input);
        });
    });

    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (localStorage.getItem('loggedIn') !== 'true' || localStorage.getItem('isAdmin') !== 'true') {
            alert('Debes estar logeado como administrador para subir scrims.');
            return;
        }
        if (isUploading) {
            alert('Por favor, espera a que termine de subir el scrim anterior.');
            return;
        }
        isUploading = true;
        const fileInput = document.getElementById('tabla-img');
        const file = fileInput.files[0];
        const resultados = Array.from(document.querySelectorAll('#resultados-input tr')).map(tr => {
            const [nombre, top] = tr.querySelectorAll('input');
            return { nombre: nombre.value, top: parseInt(top.value) };
        });

        const reader = new FileReader();
        reader.onload = async function(event) {
            const nuevoId = (scrimsData.length + 1).toString();
            const fileName = `tabla_scrim_${nuevoId}.png`;
            const nuevoScrim = {
                id: nuevoId,
                fecha: new Date().toISOString().split('T')[0],
                imagen: fileName,
                likes: 0,
                resultados
            };
            scrimsData.push(nuevoScrim);

            const imageContent = event.target.result.split(',')[1];
            await updateGitHubFiles(fileName, imageContent);
            localStorage.setItem('lastUpdated', nuevoScrim.fecha);
            document.getElementById('last-updated').textContent = `Última actualización: ${nuevoScrim.fecha}`;
            actualizarRanking(true);
            mostrarScrims(scrimsData);
            alert('Scrim subido con éxito');
            isUploading = false;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('reset-data').addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que quieres borrar todos los scrims y rankings? Esta acción no se puede deshacer.')) {
            return;
        }
        if (localStorage.getItem('loggedIn') !== 'true' || localStorage.getItem('isAdmin') !== 'true') {
            alert('Debes estar logeado como administrador para borrar datos.');
            return;
        }
        if (isUploading) {
            alert('Por favor, espera a que termine de subir el scrim actual.');
            return;
        }
        isUploading = true;
        try {
            scrimsData = [];
            rankingsData = [];
            await fetch('https://uzx-sport.netlify.app/.netlify/functions/update-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scrims: scrimsData,
                    name: window.nameData,
                    rankings: rankingsData,
                    image: null
                })
            });
            document.getElementById('last-updated').textContent = 'Última actualización: --';
            localStorage.removeItem('lastUpdated');
            mostrarScrims(scrimsData);
            actualizarRanking(true);
            alert('Todos los datos han sido borrados con éxito.');
        } catch (error) {
            console.error('Error resetting data:', error);
            alert('Hubo un error al borrar los datos. Intenta de nuevo.');
        }
        isUploading = false;
    });

    async function updateGitHubFiles(fileName, imageContent) {
        try {
            const response = await fetch('https://uzx-sport.netlify.app/.netlify/functions/update-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scrims: scrimsData,
                    name: window.nameData,
                    rankings: rankingsData,
                    image: fileName && imageContent ? { fileName, content: imageContent } : null
                })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log(data.message);

            const [scrimsResponse, nameResponse, rankingsResponse] = await Promise.all([
                fetch(`${githubBaseUrl}scrims.json`).then(res => res.json()),
                fetch(`${githubBaseUrl}name.json`).then(res => res.json()),
                fetch(`${githubBaseUrl}rankings.json`).then(res => res.json())
            ]);
            scrimsData = scrimsResponse;
            window.nameData = nameResponse;
            rankingsData = rankingsResponse;
        } catch (error) {
            console.error('Error updating GitHub:', error);
            isUploading = false;
        }
    }
});