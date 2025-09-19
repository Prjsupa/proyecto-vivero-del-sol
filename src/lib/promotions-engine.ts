
// Promotions engine: applies automatic discounts.
// Order: 1) x_for_y, 2) progressive_discount, 3) global invoice promos (TODO)

import { createClient } from './supabase/server';
import { cookies } from 'next/headers';

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
  branchId?: string | null;
  items: CartItem[];
  date?: Date;
};

export async function applyPromotions(input: ApplyPromotionsInput): Promise<EngineResult> {
  const now = input.date ?? new Date();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch active promotions (date window and is_active).
  const { data: promos, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now.toISOString())
    .or(`end_date.is.null,end_date.gte.${now.toISOString()}`);

  if (error || !promos) {
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
    if (!type || type === 'all') return true;
    if (type === 'specific_products') return ids.includes(String(item.productId));
    if (type === 'categories') return ids.includes(String(item.categoryId));
    if (type === 'subcategories') return ids.includes(String(item.subcategoryId));
    return false;
  };

  // 1) x_for_y
  for (const promo of promos.filter(p => p.discount_type === 'x_for_y')) {
    const dv = promo.discount_value || {};
    const buy = Number(dv.buy || dv.take || dv.x || 0);
    const pay = Number(dv.pay || dv.y || 0);
    if (!buy || pay < 0 || pay > buy) continue;

    for (const item of itemsByProduct.values()) {
      if (!applyToMatches(promo, item)) continue;
      const groups = Math.floor(item.quantity / buy);
      if (groups <= 0) continue;
      const freeUnits = (buy - pay) * groups;
      const discount = freeUnits * item.unitPrice;
      if (discount > 0) {
        lineDiscounts[item.productId] = (lineDiscounts[item.productId] || 0) + discount;
        appliedPromos.push({ name: promo.name || 'Promo x_for_y', amount: 0, source: 'auto' });
      }
    }
  }

  // 2) progressive_discount (by quantity)
  for (const promo of promos.filter(p => p.discount_type === 'progressive_discount')) {
    const dv = promo.discount_value || {};
    const tiers: { min_qty: number; percent: number }[] = Array.isArray(dv.tiers) ? dv.tiers : [];
    if (!tiers.length) continue;
    // Ensure tiers sorted by min_qty asc
    tiers.sort((a, b) => a.min_qty - b.min_qty);

    for (const item of itemsByProduct.values()) {
      if (!applyToMatches(promo, item)) continue;
      // Find best tier
      const tier = [...tiers].reverse().find(t => item.quantity >= Number(t.min_qty || 0));
      if (!tier || !tier.percent) continue;
      const pct = Number(tier.percent) / 100;
      const discount = item.quantity * item.unitPrice * pct;
      if (discount > 0) {
        lineDiscounts[item.productId] = (lineDiscounts[item.productId] || 0) + discount;
        appliedPromos.push({ name: promo.name || 'Promo progresiva', amount: 0, source: 'auto' });
      }
    }
  }

  // 3) Global invoice promos (TODO in future)

  return { lineDiscounts, appliedPromos };
}
