import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Promotion = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel', required: true },
  sport: { type: String, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

Promotion.index({ facility: 1, isActive: 1 });

export default mongoose.model('PromotionModel', Promotion, 'promotions');
