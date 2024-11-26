
import { getDatabase } from '../../../utils/db';

export async function GET({ params }) {
  const db = await getDatabase();
  const games = await db.all('SELECT * FROM games WHERE code = ?', [params.gamecode]);
  console.log(games)
  if (games.length === 0) {
    return new Response(JSON.stringify({ error: 'That game does not exist' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(games), {
    headers: { 'Content-Type': 'application/json' },
  });
}