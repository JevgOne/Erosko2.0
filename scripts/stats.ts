import { turso } from '../lib/turso';

async function main() {
  const total = await turso.execute('SELECT COUNT(*) as c FROM Profile');
  const hasHeight = await turso.execute('SELECT COUNT(*) as c FROM Profile WHERE height IS NOT NULL');
  const hasWeight = await turso.execute('SELECT COUNT(*) as c FROM Profile WHERE weight IS NOT NULL');
  const hasBust = await turso.execute('SELECT COUNT(*) as c FROM Profile WHERE bust IS NOT NULL AND bust != ""');

  const totalCount = total.rows[0].c as number;
  const heightCount = hasHeight.rows[0].c as number;
  const weightCount = hasWeight.rows[0].c as number;
  const bustCount = hasBust.rows[0].c as number;

  console.log('📊 Celkový přehled:');
  console.log(`   Celkem profilů: ${totalCount}`);
  console.log(`   S výškou: ${heightCount} (${Math.round(heightCount/totalCount*100)}%)`);
  console.log(`   S váhou: ${weightCount} (${Math.round(weightCount/totalCount*100)}%)`);
  console.log(`   S prsy: ${bustCount} (${Math.round(bustCount/totalCount*100)}%)`);
}

main().catch(console.error);
