exports.handler = async () => {
  const JSONBIN_KEY = process.env.JSONBIN_KEY;
  const BIN_ID = process.env.CLICKS_BIN_ID;

  const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  try {
    const current = await fetch(BIN_URL, {
      headers: { "X-Master-Key": JSONBIN_KEY }
    }).then(r => r.json());

    const clicks = (current.record.clicks || 0) + 1;

    await fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_KEY
      },
      body: JSON.stringify({ clicks })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clicks })
    };

  } catch (err) {
    return { statusCode: 500, body: "Error counting click" };
  }
};
