export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  unit: string;
}

export interface CustomerOption {
  id: string;
  name: string;
}

export interface InvoiceRow {
  key: number;
  productId: string;
  quantity: number;
}

export type InvoiceKind = 'SALE' | 'QUOTE';
