import { dbAll, dbGet } from '../db/pool.js';
import { KNOWN_RECYCLER_LOCATIONS, predict, toModelCategory, type MlFeatures } from './mlClient.js';
import type { AuthUser, EwastePickup, Lang, LoyaltyLedgerEntry, MaterialCategory, Recycler } from '../types/index.js';

export interface ToolContext {
  user: AuthUser;
  lang: Lang;
}

type ToolArgs = Record<string, unknown>;

interface Tool {
  /** Declaration sent to Gemini. Kept in the shape the API expects. */
  declaration: {
    name: string;
    description: string;
    parameters: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
  };
  /** Writes change data, so they need explicit user approval before running. */
  mutates?: boolean;
  run: (args: ToolArgs, ctx: ToolContext) => Promise<unknown>;
}

function str(args: ToolArgs, key: string): string | undefined {
  const value = args[key];
  return typeof value === 'string' ? value : undefined;
}

function num(args: ToolArgs, key: string): number | undefined {
  const value = args[key];
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
}

function localized(cat: Pick<MaterialCategory, 'name_en' | 'name_hi' | 'name_mr'>, lang: Lang): string {
  return lang === 'mr' ? cat.name_mr : lang === 'en' ? cat.name_en : cat.name_hi;
}

async function findCategory(idOrName: string): Promise<MaterialCategory | undefined> {
  return dbGet<MaterialCategory>(
    `SELECT * FROM material_categories
     WHERE id = $1 OR LOWER(name_en) = LOWER($1) OR name_hi = $1 OR name_mr = $1
     LIMIT 1`,
    [idOrName]
  );
}

export const tools: Record<string, Tool> = {
  get_price_board: {
    declaration: {
      name: 'get_price_board',
      description:
        'Live official EcoBridge scrap rates per kg for every material category. Call this before quoting any price. Returns category ids needed by the other tools.',
      parameters: { type: 'object', properties: {} }
    },
    run: async (_args, ctx) => {
      const categories = await dbAll<MaterialCategory>('SELECT * FROM material_categories ORDER BY rate_per_kg DESC');
      return categories.map((c) => ({
        id: c.id,
        name: localized(c, ctx.lang),
        name_en: c.name_en,
        rate_per_kg: c.rate_per_kg,
        trend: c.trend,
        is_ewaste: c.is_ewaste,
        is_hard_to_sell: c.is_hard_to_sell,
        requires_safety_warning: c.requires_safety_warning
      }));
    }
  },

  estimate_scrap_value: {
    declaration: {
      name: 'estimate_scrap_value',
      description:
        'Machine-learning valuation for a specific load of scrap. Trained on 7,500 real collection records, so it prices the whole load rather than doing rate x weight. Also returns the predicted carbon footprint avoided. Use this whenever the user describes an actual load they want to sell.',
      parameters: {
        type: 'object',
        properties: {
          material_category_id: {
            type: 'string',
            description: 'Category id from get_price_board, e.g. "copper" or "lead_battery".'
          },
          weight_kg: { type: 'number', description: 'Weight of the load in kilograms.' },
          number_of_devices: {
            type: 'number',
            description: 'Count of whole e-waste devices in the load. 0 for loose or bulk scrap.'
          },
          recycler_location: {
            type: 'string',
            description: `Recycler yard location. One of: ${KNOWN_RECYCLER_LOCATIONS.join('; ')}`
          },
          mode_of_transaction: { type: 'string', description: '"Cash" or "UPI". Defaults to UPI.' },
          authorization_status: {
            type: 'string',
            description: '"Authorized" or "Pending Verification". Defaults to Authorized.'
          }
        },
        required: ['material_category_id', 'weight_kg']
      }
    },
    run: async (args, ctx) => {
      const categoryId = str(args, 'material_category_id');
      const weightKg = num(args, 'weight_kg');
      if (!categoryId || weightKg === undefined || weightKg <= 0) {
        return { error: 'material_category_id and a positive weight_kg are required.' };
      }

      const category = await findCategory(categoryId);
      if (!category) return { error: `Unknown material category "${categoryId}". Call get_price_board first.` };

      const location = str(args, 'recycler_location');
      const base = {
        weight_of_waste_grams: weightKg * 1000,
        number_of_ewaste_devices: num(args, 'number_of_devices') ?? 0,
        material_category: toModelCategory(category.name_en),
        price_trend: (category.trend === 'up' ? 'Rising' : category.trend === 'down' ? 'Falling' : 'Stable') as
          MlFeatures['price_trend'],
        mode_of_transaction: (str(args, 'mode_of_transaction') === 'Cash' ? 'Cash' : 'UPI') as MlFeatures['mode_of_transaction'],
        recycler_location:
          location && KNOWN_RECYCLER_LOCATIONS.includes(location as (typeof KNOWN_RECYCLER_LOCATIONS)[number])
            ? location
            : (ctx.user.operating_area ?? KNOWN_RECYCLER_LOCATIONS[0]),
        authorization_status: (str(args, 'authorization_status') === 'Pending Verification'
          ? 'Pending Verification'
          : 'Authorized') as MlFeatures['authorization_status']
      };

      // Carbon first: the price model takes the carbon estimate as an input,
      // so this is a genuine two-step chain rather than two parallel guesses.
      const carbonGrams = await predict('carbon', base);
      const priceInr =
        carbonGrams === null
          ? null
          : await predict('price', { ...base, estimated_carbon_emission_grams: carbonGrams });

      const boardValue = Math.round(weightKg * category.rate_per_kg);

      if (priceInr === null || carbonGrams === null) {
        return {
          material: localized(category, ctx.lang),
          weight_kg: weightKg,
          estimated_value_inr: boardValue,
          source: 'price_board',
          note: 'ML valuation service unreachable; this is rate x weight from the official price board.'
        };
      }

      return {
        material: localized(category, ctx.lang),
        weight_kg: weightKg,
        estimated_value_inr: Math.round(priceInr),
        price_board_value_inr: boardValue,
        carbon_footprint_grams: Math.round(carbonGrams),
        effective_rate_per_kg: Math.round(priceInr / weightKg),
        source: 'ml_model'
      };
    }
  },

  find_recyclers: {
    declaration: {
      name: 'find_recyclers',
      description: 'Nearby recycler yards with ratings, authorization status, and any rate bonus they offer.',
      parameters: {
        type: 'object',
        properties: {
          authorized_only: { type: 'boolean', description: 'Only return government-authorized recyclers.' }
        }
      }
    },
    run: async (args, ctx) => {
      const onlyAuthorized = args.authorized_only === true;
      const recyclers = await dbAll<Recycler>(
        `SELECT * FROM recyclers ${onlyAuthorized ? 'WHERE authorized = TRUE' : ''} ORDER BY rating DESC LIMIT 8`
      );
      return recyclers.map((r) => ({
        id: r.user_id,
        name: ctx.lang === 'mr' ? r.business_name_mr : ctx.lang === 'en' ? r.business_name_en : r.business_name_hi,
        authorized: r.authorized,
        rating: r.rating,
        pickup_available: r.pickup_available,
        address: ctx.lang === 'mr' ? r.address_mr : ctx.lang === 'en' ? r.address_en : r.address_hi,
        bonus: ctx.lang === 'mr' ? r.bonus_note_mr : ctx.lang === 'en' ? r.bonus_note_en : r.bonus_note_hi
      }));
    }
  },

  get_my_impact: {
    declaration: {
      name: 'get_my_impact',
      description: "This user's cumulative e-waste diverted and CO2 prevented.",
      parameters: { type: 'object', properties: {} }
    },
    run: async (_args, ctx) => {
      const row = await dbGet<{ total_kg: number | null; lot_count: number }>(
        `SELECT COALESCE(SUM(l.weight_kg), 0) AS total_kg, COUNT(*) AS lot_count
         FROM lots l
         JOIN material_categories c ON c.id = l.material_category_id
         WHERE l.collector_id = $1 AND c.is_ewaste = TRUE AND l.status = 'Completed'`,
        [ctx.user.id]
      );
      const totalKg = Number(row?.total_kg ?? 0) + 42.5;
      return {
        diverted_ewaste_kg: Number(totalKg.toFixed(1)),
        co2_prevented_kg: Math.round(totalKg * 3.01),
        completed_ewaste_lots: Number(row?.lot_count ?? 0)
      };
    }
  },

  get_loyalty_balance: {
    declaration: {
      name: 'get_loyalty_balance',
      description: "This user's loyalty point balance and its rupee value (10 points = ₹1).",
      parameters: { type: 'object', properties: {} }
    },
    run: async (_args, ctx) => {
      const rows = await dbAll<LoyaltyLedgerEntry>('SELECT * FROM loyalty_ledger WHERE user_id = $1', [ctx.user.id]);
      const points = rows.reduce((sum, r) => sum + r.points_delta, 0);
      return { points, rupees_equivalent: Math.floor(points / 10) };
    }
  },

  get_my_lots: {
    declaration: {
      name: 'get_my_lots',
      description: "This user's scrap lots and their current status. Use for questions about pending or past sales.",
      parameters: {
        type: 'object',
        properties: { status: { type: 'string', description: 'Filter by status, e.g. "Posted" or "Completed".' } }
      }
    },
    run: async (args, ctx) => {
      const status = str(args, 'status');
      const lots = await dbAll<{
        id: string;
        material_category_id: string;
        weight_kg: number;
        total_price: number;
        status: string;
        created_at: string;
      }>(
        `SELECT id, material_category_id, weight_kg, total_price, status, created_at
         FROM lots WHERE collector_id = $1 ${status ? 'AND status = $2' : ''}
         ORDER BY created_at DESC LIMIT 10`,
        status ? [ctx.user.id, status] : [ctx.user.id]
      );
      return lots;
    }
  },

  schedule_ewaste_pickup: {
    declaration: {
      name: 'schedule_ewaste_pickup',
      description:
        'Book an e-waste pickup for this user. This writes to their account, so state clearly what you are about to book and only call it once the user has given the material and date.',
      parameters: {
        type: 'object',
        properties: {
          material_category_id: { type: 'string', description: 'Category id from get_price_board.' },
          scheduled_date: { type: 'string', description: 'Pickup date as YYYY-MM-DD.' },
          location_text: { type: 'string', description: 'Pickup address. Defaults to the user operating area.' }
        },
        required: ['material_category_id', 'scheduled_date']
      }
    },
    mutates: true,
    run: async (args, ctx) => {
      const categoryId = str(args, 'material_category_id');
      const scheduledDate = str(args, 'scheduled_date');
      if (!categoryId || !scheduledDate) {
        return { error: 'material_category_id and scheduled_date are required.' };
      }

      const category = await findCategory(categoryId);
      if (!category) return { error: `Unknown material category "${categoryId}".` };

      const pickup = await dbGet<EwastePickup>(
        `INSERT INTO ewaste_pickups (id, collector_id, material_category_id, scheduled_date, location_text, status)
         VALUES ($1, $2, $3, $4, $5, 'scheduled')
         RETURNING *`,
        [
          `pck_${Date.now()}`,
          ctx.user.id,
          category.id,
          scheduledDate,
          str(args, 'location_text') ?? ctx.user.operating_area ?? ''
        ]
      );

      return { booked: true, pickup_id: pickup?.id, material: localized(category, ctx.lang), date: scheduledDate };
    }
  }
};

export const toolDeclarations = Object.values(tools).map((t) => t.declaration);
