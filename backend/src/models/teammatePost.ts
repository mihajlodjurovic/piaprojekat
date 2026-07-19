import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let TeammatePost = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'UserModel', required: true },
  sport: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel' },
  missingPlayers: { type: Number, required: true, min: 1 },
  description: { type: String, trim: true, maxlength: 300, default: '' },
  joinRequests: [{
    user: { type: Schema.Types.ObjectId, ref: 'UserModel' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  }],
  approvedPlayers: [{ type: Schema.Types.ObjectId, ref: 'UserModel' }],
  isActive: { type: Boolean, default: true },
  isComplete: { type: Boolean, default: false }
}, { timestamps: true });

TeammatePost.index({ isActive: 1, sport: 1, city: 1 });

export default mongoose.model('TeammatePostModel', TeammatePost, 'teammate_posts');
