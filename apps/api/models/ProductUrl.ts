import { Schema } from 'mongoose';
import { Store } from '@price-tracker/shared-types';

export const productUrlSchema = new Schema({
  store: {
    type: String,
    enum: Object.values(Store),
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
}, { _id: false });
