import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Equipment = new Schema({
  name: { type: String, required: true, trim: true },
  sport: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, default: 'default-equipment.jpg' },
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('EquipmentModel', Equipment, 'equipment');
