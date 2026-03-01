export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en Vercel. Ve a Settings → Environment Variables.' });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {
      return res.status(400).json({ error: 'Body inválido: ' + e.message });
    }
  }

  if (!body || !body.messages || !Array.isArray(body.messages)) {
    return res.status(400).json({ error: 'Falta el campo messages en el body' });
  }

  const { system, messages, max_tokens = 1800 } = body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: Math.min(max_tokens, 4096),
        system: system || '',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Error de Anthropic: ' + response.status
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
```

4. Clic **"Commit changes"**

---

**Luego fuerza un redeploy en Vercel:**

1. Ve a vercel.com → tu proyecto
2. Pestaña **"Deployments"**
3. Clic los **3 puntos** del deployment más reciente
4. Clic **"Redeploy"** → confirma

---

**Comprueba que funcionó:**

Visita en el navegador:
```
https://TU-APP.vercel.app/api/chat
