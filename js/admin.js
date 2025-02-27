document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        alert('Acceso denegado');
        window.location.href = 'index.html';
        return;
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
    fetch('../data/name.json')
        .then(response => response.json())
        .catch(() => [])
        .then(data => {
            data.forEach(equipo => {
                const option = document.createElement('option');
                option.value = equipo.nombre;
                datalist.appendChild(option);
            });
        });
    resultadosInput.appendChild(datalist);

    document.getElementById('admin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const tipo = document.getElementById('tipo').value;
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

        const fileKey = tipo === 'scrim' ? 'scrims' : 'torneos';
        fetch(`../data/${fileKey}.json`)
            .then(response => response.json())
            .catch(() => [])
            .then(data => {
                const nuevoId = data.length + 1;
                const nuevoResultado = {
                    id: nuevoId,
                    fecha: new Date().toISOString().split('T')[0],
                    imagen: `tabla_${tipo}_${nuevoId}.png`,
                    likes: 0,
                    resultados
                };
                data.push(nuevoResultado);
                localStorage.setItem(fileKey, JSON.stringify(data));
                actualizarNameJson(resultados);
                alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} subido con éxito`);
                window.location.href = `${tipo}s.html`;
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