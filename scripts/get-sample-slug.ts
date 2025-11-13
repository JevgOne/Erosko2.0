import { turso } from '../lib/turso';

async function main() {
  const result = await turso.execute('SELECT slug FROM Profile LIMIT 1');
  console.log(result.rows[0].slug);
}

main().catch(console.error);
