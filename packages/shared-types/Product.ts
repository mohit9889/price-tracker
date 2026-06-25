import { Store } from './Store';

export interface ProductUrl {
  store: Store;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  urls: ProductUrl[];
  /** ISO 8601 string — wire format from the API (JSON serialisation of a Date). */
  createdAt: string;
  /** ISO 8601 string — wire format from the API (JSON serialisation of a Date). */
  updatedAt: string;
}
