export interface ProductSize {
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sizes: ProductSize[];
}

export interface RequestItem {
  productName: string;
  category: string;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface RequestSubmission {
  submittedBy: string;
  drNumber?: string;
  clientName: string;
  deliveryAddress: string;
  deliveryDate: string;
  notes?: string;
  items: RequestItem[];
}

export interface SampleRequest {
  id: string;
  timestamp: string;
  submittedBy: string;
  items: RequestItem[];
  totalValue: number;
}
