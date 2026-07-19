import mongoose from 'mongoose';
import Court from './court';

const Schema = mongoose.Schema;

let SportFacility = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  managers: [{ type: Schema.Types.ObjectId, ref: 'UserModel' }],
  companyName: { type: String, required: true, trim: true },
  courts: [Court],
  workingHours: {
    open: { type: String, default: '08:00' },
    close: { type: String, default: '22:00' }
  },
  maxNoShows: { type: Number, min: 1, default: 3 },
  pricePerHour: { type: Number, min: 0, default: 0 },
  location: {
    latitude: { type: Number, default: 44.7866 },
    longitude: { type: Number, default: 20.4489 }
  },
  mainImage: { type: String, default: 'default-facility.jpg' },
  galleryImages: { type: [String], default: [] },
  likes: { type: Number, default: 0, min: 0 },
  dislikes: { type: Number, default: 0, min: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'UserModel' }],
  dislikedBy: [{ type: Schema.Types.ObjectId, ref: 'UserModel' }],
  isActive: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: null }
}, { timestamps: true });

SportFacility.index({ name: 1, city: 1 });
SportFacility.index({ isActive: 1, approvalStatus: 1 });

export default mongoose.model('SportFacilityModel', SportFacility, 'sport_facilities');
