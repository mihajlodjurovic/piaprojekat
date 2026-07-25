import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Training = new Schema({
  athlete: { type: Schema.Types.ObjectId, ref: 'UserModel', required: true },
  trainer: { type: Schema.Types.ObjectId, ref: 'TrainerModel', required: true },
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel', required: true },
  courtId: { type: Schema.Types.ObjectId },
  courtName: { type: String },
  sport: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  attendanceStatus: { type: String, enum: ['pending', 'confirmed', 'noshow'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('TrainingModel', Training, 'trainings');
