const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // Create table if it doesn't exist yet (safe to run every time)
    await sql`
      CREATE TABLE IF NOT EXISTS scores (
        id        SERIAL PRIMARY KEY,
        name      TEXT NOT NULL,
        level     TEXT NOT NULL,
        correct   INTEGER NOT NULL,
        total     INTEGER NOT NULL,
        pct       INTEGER NOT NULL,
        played_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Get top 50 scores, sorted by percentage then by correct count
    const rows = await sql`
      SELECT name, level, correct, total, pct, played_at
      FROM scores
      ORDER BY pct DESC, correct DESC, played_at DESC
      LIMIT 50
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    };

  } catch (err) {
    console.error('get-scores error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load scores' })
    };
  }
};
