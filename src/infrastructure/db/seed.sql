-- Placeholder subscription plans/pricing (toman/month). Edit freely — these are
-- illustrative defaults, not final pricing decisions.

INSERT INTO plans (id, code, name, description, price, currency, billing_period, is_active) VALUES
  ('plan-free', 'FREE', 'رایگان', 'برای شروع و آزمایش پانیو', 0, 'IRT', 'MONTHLY', 1),
  ('plan-standard', 'STANDARD', 'استاندارد', 'برای فروشگاه‌های در حال رشد', 149000, 'IRT', 'MONTHLY', 1),
  ('plan-pro', 'PRO', 'پرو', 'دسترسی کامل به همه امکانات', 299000, 'IRT', 'MONTHLY', 1);

INSERT INTO plan_features (id, plan_id, feature_code, value) VALUES
  ('pf-free-product-limit', 'plan-free', 'PRODUCT_LIMIT', '20'),
  ('pf-free-staff-limit', 'plan-free', 'STAFF_LIMIT', '1'),
  ('pf-free-reports', 'plan-free', 'VIEW_REPORTS', '0'),

  ('pf-standard-product-limit', 'plan-standard', 'PRODUCT_LIMIT', '200'),
  ('pf-standard-staff-limit', 'plan-standard', 'STAFF_LIMIT', '3'),
  ('pf-standard-reports', 'plan-standard', 'VIEW_REPORTS', '1'),

  ('pf-pro-product-limit', 'plan-pro', 'PRODUCT_LIMIT', '100000'),
  ('pf-pro-staff-limit', 'plan-pro', 'STAFF_LIMIT', '10'),
  ('pf-pro-reports', 'plan-pro', 'VIEW_REPORTS', '1');
