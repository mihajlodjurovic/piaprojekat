import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Trainer = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  specialization: { type: [String], required: true },
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel', required: true },
  pricePerHour: { type: Number, required: true, min: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('TrainerModel', Trainer, 'trainers');
