
// Promotions engine: applies automatic discounts.
// Order: 1) x_for_y, 2) progressive_discount, 3) global invoice promos (TODO)

import { type SupabaseClient } from '@supabase/supabase-js';

export type CartItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  // optional: categoryId, subcategoryId, sku, etc.
  categoryId?: string | number | null;
  subcategoryId?: string | number | null;
};

export type AppliedPromo = {
  name: string;
  amount: number; // absolute discount amount (positive number)
  source?: 'auto' | 'manual';
};

export type EngineResult = {
  // Map productId -> total discount amount for that line
  lineDiscounts: Record<string, number>;
  appliedPromos: AppliedPromo[];
};

export type ApplyPromotionsInput = {
  supabase: SupabaseClient;
  branchId?: string | null;
  items: CartItem[];
  date?: Date;
};

export async function applyPromotions(input: ApplyPromotionsInput): Promise<EngineResult> {
  const now = input.date ?? new Date();
  const supabase = input.supabase;

  // Fetch active promotions (date window and is_active).
  const { data: promos, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now.toISOString())
    .or(`end_date.is.null,end_date.gte.${now.toISOString()}`);

  if (error || !promos) {
    console.error('Error fetching promotions:', error);
    return { lineDiscounts: {}, appliedPromos: [] };
  }

  // Helpers
  const parseIds = (v: any): string[] => {
    if (!v) return [];
    if (Array.isArray(v)) return v.map(String);
    try { const arr = JSON.parse(v); return Array.isArray(arr) ? arr.map(String) : []; } catch {}
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const lineDiscounts: Record<string, number> = {};
  const appliedPromos: AppliedPromo[] = [];

  const itemsByProduct = new Map<string, CartItem>();
  input.items.forEach(it => {
    const pid = String(it.productId);
    const prev = itemsByProduct.get(pid);
    if (prev) {
      prev.quantity += it.quantity;
    } else {
      itemsByProduct.set(pid, { ...it });
    }
  });

  const applyToMatches = (promo: any, item: CartItem): boolean => {
    const type = promo.apply_to_type as string | null;
    const ids = parseIds(promo.apply_to_ids);
    if (!type || type === 'all_store' || type === 'all_products') return true;
    if (type === 'products') return ids.includes(String(item.productId));
    if (type === 'product_categories') return ids.includes(String(item.categoryId));
    if (type === 'product_subcategories') return ids.includes(String(item.subcategoryId));
    return false;
  };

  // 1) x_for_y
  for (const promo of promos.filter(p => p.discount_type === 'x_for_y')) {
    const dv = promo.discount_value || {};
    const take = Number((dv as any).take || (dv as any).buy || (dv as any).x || 0);
    const pay = Number((dv as any).pay || (dv as any).y || 0);
    if (!take || pay < 0 || pay >= take) continue;

    for (const item of itemsByProduct.values()) {
      if (!applyToMatches(promo, item)) continue;
      const groups = Math.floor(item.quantity / take);
      if (groups <= 0) continue;
      const freeUnits = (take - pay) * groups;
      const discount = freeUnits * item.unitPrice;
      if (discount > 0) {
        lineDiscounts[item.productId] = (lineDiscounts[item.productId] || 0) + discount;
        appliedPromos.push({ name: promo.name || 'Promo x_for_y', amount: discount, source: 'auto' });
      }
    }
  }

  // 2) progressive_discount (by quantity)
  for (const promo of promos.filter(p => p.discount_type === 'progressive_discount')) {
    const dv = promo.discount_value || {};
    const tiers: { quantity: number; percentage: number }[] = Array.isArray((dv as any).tiers) ? (dv as any).tiers : [];
    if (!tiers.length) continue;
    // Ensure tiers sorted by quantity asc
    tiers.sort((a, b) => a.quantity - b.quantity);

    for (const item of itemsByProduct.values()) {
      if (!applyToMatches(promo, item)) continue;
      // Find best tier
      const tier = [...tiers].reverse().find(t => item.quantity >= Number(t.quantity || 0));
      if (!tier || !tier.percentage) continue;
      const pct = Number(tier.percentage) / 100;
      const discount = item.quantity * item.unitPrice * pct;
      if (discount > 0) {
        lineDiscounts[item.productId] = (lineDiscounts[item.productId] || 0) + discount;
        appliedPromos.push({ name: promo.name || 'Promo progresiva', amount: discount, source: 'auto' });
      }
    }
  }

  // 3) Global invoice promos (TODO in future)

  return { lineDiscounts, appliedPromos };
}
