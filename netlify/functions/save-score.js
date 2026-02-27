
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, level, correct, total } = JSON.parse(event.body);

    // Basic validation
    if (!name || !level || correct === undefined || !total) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // Create table if it doesn't exist yet
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

    const pct = Math.round((correct / total) * 100);

    await sql`
      INSERT INTO scores (name, level, correct, total, pct)
      VALUES (${name}, ${level}, ${correct}, ${total}, ${pct})
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('save-score error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save score' })
    };
  }
};
