import { Plan } from '../../../domain/subscription/Plan.js';
import { PlanFeature } from '../../../domain/subscription/PlanFeature.js';

interface PlanRow {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  is_active: number;
}

interface PlanFeatureRow {
  id: string;
  plan_id: string;
  feature_code: string;
  value: string;
}

function toPlan(row: PlanRow): Plan {
  return new Plan({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    billingPeriod: row.billing_period,
    isActive: row.is_active === 1,
  });
}

export interface PlanWithFeatures {
  plan: Plan;
  features: PlanFeature[];
}

export class PlanRepository {
  constructor(private readonly db: D1Database) {}

  async listActive(): Promise<PlanWithFeatures[]> {
    const { results: planRows } = await this.db
      .prepare(`SELECT * FROM plans WHERE is_active = 1 ORDER BY price ASC`)
      .all<PlanRow>();

    const plans = planRows.map(toPlan);
    const { results: featureRows } = await this.db.prepare(`SELECT * FROM plan_features`).all<PlanFeatureRow>();

    return plans.map((plan) => ({
      plan,
      features: featureRows
        .filter((f) => f.plan_id === plan.id)
        .map((f) => new PlanFeature({ id: f.id, planId: f.plan_id, featureCode: f.feature_code, value: f.value })),
    }));
  }

  async findById(planId: string): Promise<Plan | null> {
    const row = await this.db.prepare(`SELECT * FROM plans WHERE id = ?`).bind(planId).first<PlanRow>();
    return row ? toPlan(row) : null;
  }

  async getFeatureValue(planId: string, featureCode: string): Promise<string | null> {
    const row = await this.db
      .prepare(`SELECT value FROM plan_features WHERE plan_id = ? AND feature_code = ?`)
      .bind(planId, featureCode)
      .first<{ value: string }>();
    return row?.value ?? null;
  }
}
