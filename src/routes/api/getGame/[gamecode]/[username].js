import { getDatabase } from '../../../../utils/db';

export async function POST({ params, request }) {
  const db = await getDatabase();
  const body = await request.json();

  if (!params.username || !params.gamecode || typeof body.lives !== 'number') {
    return new Response(JSON.stringify({ error: 'Invalid input data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(params.username, params.gamecode, body.lives);

  const existingUser = await db.get(
    'SELECT * FROM users WHERE username = ? AND gameCode = ?',
    [params.username, params.gamecode]
  );

  if (existingUser) {
    await db.run(
      'UPDATE users SET score = ? WHERE username = ? AND gameCode = ?',
      [body.lives, params.username, params.gamecode]
    );
  } else {
    await db.run(
      'INSERT INTO users (username, gameCode, score) VALUES (?, ?, ?)',
      [params.username, params.gamecode, body.lives]
    );
  }

  const games = await db.all('SELECT * FROM games WHERE code = ?', [params.gamecode]);

  const players = await db.all(
    'SELECT username, score FROM users WHERE gameCode = ?',
    [params.gamecode]
  );

  await db.run(
    `DELETE FROM users WHERE createdAt <= datetime('now', '-30 minutes')`
  );
  const responseData = {
    games: games,       
    players: players,   
  };

  return new Response(JSON.stringify(responseData), {
    headers: { 'Content-Type': 'application/json' },
  });
}
