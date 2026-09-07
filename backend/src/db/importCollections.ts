import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { pool } from './pool.js';

/**
 * Loads model/__data__/*.csv into pickup_points + collections.
 * Idempotent: reference_id is the primary key, so a re-run refreshes rows.
 */

const DEFAULT_CSV = path.resolve(
  process.cwd().endsWith('backend') ? '..' : '.',
  'model/__data__/slm_synthetic_dataset_corrected.csv'
);

// CSV labels -> material_categories.id. 'Lead-Acid Battery' is the one label
// that does not match a seeded name_en verbatim.
const CATEGORY_IDS: Record<string, string> = {
  'Iron / Steel': 'iron',
  Copper: 'copper',
  Newspaper: 'newspaper',
  'PET Bottles': 'pet_bottles',
  'E-Waste PCB': 'ewaste_circuit',
  'Lead-Acid Battery': 'lead_battery',
  'Small Battery': 'small_battery',
  'Hard Plastics': 'mixed_plastic'
};

/** Split one RFC 4180 line: commas inside double quotes stay put, "" is a literal quote. */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

interface Row {
  user_name: string;
  weight_of_waste_grams: string;
  number_of_ewaste_devices: string;
  ewaste_scrap_image_ref: string;
  material_category: string;
  price_valuation_inr: string;
  price_trend: string;
  nearby_recycler_id: string;
  reference_id: string;
  mode_of_transaction: string;
  transaction_id: string;
  anonymous_contact_number: string;
  estimated_carbon_emission_grams: string;
  recycler_name: string;
  recycler_location: string;
  authorization_status: string;
}

async function readRows(csvPath: string): Promise<Row[]> {
  const rl = readline.createInterface({ input: fs.createReadStream(csvPath, 'utf8'), crlfDelay: Infinity });
  let header: string[] | null = null;
  const rows: Row[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    if (!header) {
      header = fields;
      continue;
    }
    rows.push(Object.fromEntries(header.map((key, i) => [key, fields[i] ?? ''])) as unknown as Row);
  }
  return rows;
}

/** One multi-row INSERT per chunk; 7.5k rows in a handful of round trips. */
async function insertChunk(sql: string, columns: number, values: unknown[]): Promise<void> {
  const tuples: string[] = [];
  for (let i = 0; i < values.length; i += columns) {
    tuples.push(`(${Array.from({ length: columns }, (_, k) => `$${i + k + 1}`).join(', ')})`);
  }
  await pool.query(sql.replace('__VALUES__', tuples.join(', ')), values);
}

export async function importCollections(csvPath = DEFAULT_CSV): Promise<{ points: number; collections: number }> {
  const rows = await readRows(csvPath);

  const points = new Map<string, Row>();
  for (const row of rows) points.set(row.nearby_recycler_id, row);

  const pointValues = [...points.values()].flatMap((row) => [
    row.nearby_recycler_id,
    row.recycler_name,
    row.recycler_location,
    row.authorization_status
  ]);
  await insertChunk(
    `INSERT INTO pickup_points (id, recycler_name, location, authorization_status)
     VALUES __VALUES__
     ON CONFLICT (id) DO UPDATE SET
       recycler_name = EXCLUDED.recycler_name,
       location = EXCLUDED.location,
       authorization_status = EXCLUDED.authorization_status`,
    4,
    pointValues
  );

  const insertSql = `
    INSERT INTO collections (
      reference_id, pickup_point_id, user_name, anonymous_contact_number,
      material_category, material_category_id, weight_of_waste_grams,
      number_of_ewaste_devices, ewaste_scrap_image_ref, price_valuation_inr,
      price_trend, mode_of_transaction, transaction_ref,
      estimated_carbon_emission_grams, source
    ) VALUES __VALUES__
    ON CONFLICT (reference_id) DO NOTHING`;

  const CHUNK = 400;
  for (let start = 0; start < rows.length; start += CHUNK) {
    const values = rows.slice(start, start + CHUNK).flatMap((row) => [
      row.reference_id,
      row.nearby_recycler_id,
      row.user_name,
      row.anonymous_contact_number,
      row.material_category,
      CATEGORY_IDS[row.material_category] ?? null,
      Number(row.weight_of_waste_grams),
      Number.parseInt(row.number_of_ewaste_devices, 10) || 0,
      row.ewaste_scrap_image_ref,
      Number(row.price_valuation_inr),
      row.price_trend,
      row.mode_of_transaction,
      row.transaction_id,
      Number(row.estimated_carbon_emission_grams),
      'csv_import'
    ]);
    await insertChunk(insertSql, 15, values);
  }

  return { points: points.size, collections: rows.length };
}

// `pnpm db:import-collections [path/to.csv]` runs this file directly.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  importCollections(process.argv[2])
    .then(({ points, collections }) =>
      console.log(`✅ Imported ${collections} collections across ${points} pickup points`)
    )
    .catch((err: unknown) => {
      console.error('❌ Import failed:', err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
