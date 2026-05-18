exports.handler = async (event) => {
  const JSONBIN_KEY = process.env.JSONBIN_KEY;
  const BIN_ID = process.env.VISITS_BIN_ID;

  const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  // IP real del visitant (Netlify la dona gratis)
  const ip = event.headers["x-nf-client-connection-ip"];

  // Filtrar bots
  const ua = event.headers["user-agent"] || "";
  const botPatterns = ["bot", "crawl", "spider", "preview", "netlify"];
  const isBot = botPatterns.some(p => ua.toLowerCase().includes(p));
  if (isBot) {
    return { statusCode: 200, body: JSON.stringify({ total: "BOT_IGNORED" }) };
  }

  try {
    // GET actual
    const current = await fetch(BIN_URL, {
      headers: { "X-Master-Key": JSONBIN_KEY }
    }).then(r => r.json());

    let ips = current.record.ips || [];
    let total = current.record.total || 0;

    // Si la IP no hi és → comptem visita
    if (!ips.includes(ip)) {
      ips.push(ip);
      total++;

      await fetch(BIN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_KEY
        },
        body: JSON.stringify({ ips, total })
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ total })
    };

  } catch (err) {
    return { statusCode: 500, body: "Error counting visit" };
  }
};
