import { turso } from '../lib/turso';

async function main() {
  const services = await turso.execute('SELECT name FROM Service ORDER BY name');

  console.log(`📋 Celkem služeb v databázi: ${services.rows.length}\n`);

  services.rows.forEach((row: any, index: number) => {
    console.log(`${index + 1}. ${row.name}`);
  });
}

main().catch(console.error);
