export type VoteType = 'upvote' | 'downvote';

export type StockStatus = 'in_stock' | 'preorder' | 'group_buy' | 'coming_soon' | 'out_of_stock';

export type SwitchType = 'linear' | 'tactile' | 'clicky' | 'silent_linear' | 'silent_tactile';

export type SortOption = 'lowest' | 'highest' | 'newest' | 'popular' | 'vendors' | 'drops';

export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string };
  vendorProducts: VendorProductWithVendor[];
  specifications: SpecificationWithField[];
  votes: { type: string }[];
}

export interface VendorProductWithVendor {
  id: string;
  price: number | { toNumber(): number };
  shippingCost: number | { toNumber(): number };
  shippingIncluded: boolean;
  totalPrice: number | { toNumber(): number };
  stockStatus: string;
  lastChecked: Date;
  vendorUrl: string;
  vendor: {
    name: string;
    slug: string;
    logo: string | null;
    affiliateLink: string | null;
  };
}

export interface SpecificationWithField {
  value: string;
  specField: {
    name: string;
    slug: string;
    type: string;
    group: string;
    order: number;
  };
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  brand: { name: string } | null;
  category: { name: string; slug: string };
  lowestPrice: number | null;
  highestPrice: number | null;
  vendorCount: number;
  upvotes: number;
  downvotes: number;
  specs: string[];
  approval: number | null;
  userVote: 'upvote' | 'downvote' | null;
}

export interface KeyboardFilters {
  layouts: string[];
  caseMaterials: string[];
  mountTypes: string[];
  connectivityOptions: string[];
  pcbTypes: string[];
  keyboardTypes: string[];
  plateMaterials: string[];
  switchCompatOptions: string[];
  rgbOptions: string[];
  vendorList: { name: string; slug: string }[];
}

export interface SpecFieldDef {
  id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  options: string | null;
  order: number;
}

export interface SpecFieldValue {
  specFieldId: string;
  value: string;
}
