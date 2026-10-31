import {
  CATEGORY_BY_API_NAME,
  DISCOUNT_STEPS,
  OUT_OF_STOCK,
  OUT_OF_STOCK_PRODUCT_IDS,
  SUBCATEGORY_BY_PRODUCT_ID,
  USD_TO_INR,
  VARIANT_OVERRIDES,
  VARIANT_TEMPLATES,
} from '@/constants';
import type { ApiProduct, Product, VariantGroup } from '@/types/product';
import { slugify, toTitleCase } from './utils';

/** Round to a "retail" price ending in 9, e.g. 1843 -> 1849. */
function retailPrice(value: number): number {
  return Math.max(99, Math.ceil(value / 10) * 10 - 1);
}

function buildVariants(product: ApiProduct, categoryVariants: VariantGroup[]): VariantGroup[] {
  const groups = VARIANT_OVERRIDES[product.id] ?? categoryVariants;
  return groups.map((group) => ({
    ...group,
    options: group.options.map((option) => ({
      ...option,
      inStock: !OUT_OF_STOCK.has(`${product.id}:${option.id}`),
    })),
  }));
}

/** Convert a raw FakeStore product into the shape the UI uses. */
export function mapProduct(raw: ApiProduct): Product {
  const category = CATEGORY_BY_API_NAME[raw.category] ?? CATEGORY_BY_API_NAME.electronics;
  const price = retailPrice(raw.price * USD_TO_INR);
  const discountPercent = DISCOUNT_STEPS[raw.id % DISCOUNT_STEPS.length];
  const mrp = retailPrice(price / (1 - discountPercent / 100));
  const title = raw.title.trim();

  return {
    id: raw.id,
    slug: `${slugify(title)}-${raw.id}`,
    title,
    description: raw.description.trim().replace(/^\w/, (c) => c.toUpperCase()),
    category: category.slug,
    categoryLabel: category.label,
    subcategory: SUBCATEGORY_BY_PRODUCT_ID[raw.id] ?? toTitleCase(category.shortLabel),
    image: raw.image,
    price,
    mrp,
    discountPercent: Math.round(((mrp - price) / mrp) * 100),
    rating: raw.rating.rate,
    ratingCount: raw.rating.count,
    inStock: !OUT_OF_STOCK_PRODUCT_IDS.has(raw.id),
    variantGroups: buildVariants(raw, VARIANT_TEMPLATES[category.slug]),
  };
}

export const mapProducts = (raw: ApiProduct[]) => raw.map(mapProduct);
