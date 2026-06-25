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
  createdAt: string;
  updatedAt: string;
}
