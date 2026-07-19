import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Review = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'UserModel', required: true },
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel', required: true },
  isLike: { type: Boolean, required: true },
  comment: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

Review.index({ facility: 1, createdAt: -1 });
Review.index({ user: 1, facility: 1 });

export default mongoose.model('ReviewModel', Review, 'reviews');
