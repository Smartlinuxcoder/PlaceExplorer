
import { getDatabase } from '../../utils/db';

export async function GET() {
  const db = await getDatabase();
  const games = await db.all('SELECT * FROM games');

  return new Response(JSON.stringify(games), {
    headers: { 'Content-Type': 'application/json' },
  });
}