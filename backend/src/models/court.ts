import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Court = new Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['outdoor', 'indoor', 'arena'], required: true },
  sport: { type: String, required: true, trim: true },
  capacity: { type: Number, min: 1, default: 1 },
  spotsCount: { type: Number, min: 4, default: null },
  equipmentDescription: { type: String, trim: true, maxlength: 300, default: '' },
  pricePerHour: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true }
});

export default Court;
