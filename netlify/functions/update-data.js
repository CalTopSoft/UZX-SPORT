const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);
  const { scrims, name, rankings, file } = body;
  const token = process.env.GITHUB_TOKEN;
  const owner = 'CalTopSoft';
  const repo = 'UZX-SPORT';
  const headers = { Authorization: `token ${token}`, 'Content-Type': 'application/json' };

  try {
    // Actualizar scrims.json
    let response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/data/scrims.json`, { headers });
    let sha = response.data.sha;
    await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/data/scrims.json`, {
      message: 'Update scrims.json',
      content: Buffer.from(JSON.stringify(scrims)).toString('base64'),
      sha: sha
    }, { headers });

    // Actualizar name.json
    response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/data/name.json`, { headers });
    sha = response.data.sha;
    await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/data/name.json`, {
      message: 'Update name.json',
      content: Buffer.from(JSON.stringify(name)).toString('base64'),
      sha: sha
    }, { headers });

    // Actualizar rankings.json
    response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/data/rankings.json`, { headers });
    sha = response.data.sha;
    await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/data/rankings.json`, {
      message: 'Update rankings.json',
      content: Buffer.from(JSON.stringify(rankings)).toString('base64'),
      sha: sha
    }, { headers });

    // Subir imagen si existe
    if (file) {
      const { path, content } = file;
      response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers }).catch(() => ({ data: null }));
      const imageSha = response.data ? response.data.sha : null;
      await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        message: `Update ${path}`,
        content: content,
        sha: imageSha
      }, { headers });
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Datos actualizados en GitHub' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};