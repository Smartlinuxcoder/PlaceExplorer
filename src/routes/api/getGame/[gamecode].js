
import { getDatabase } from '../../../utils/db';

export async function GET({ params }) {
  const db = await getDatabase();
  const games = await db.all('SELECT * FROM games WHERE code = ?', [params.gamecode]);

  return new Response(JSON.stringify(games), {
    headers: { 'Content-Type': 'application/json' },
  });
}