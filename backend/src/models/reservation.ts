import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Reservation = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'UserModel', required: true },
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel', required: true },
  courtId: { type: Schema.Types.ObjectId, required: true },
  courtName: { type: String, required: true },
  sport: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
  attendanceStatus: { type: String, enum: ['pending', 'confirmed', 'noshow'], default: 'pending' },
  cancelledAt: Date
}, { timestamps: true });

Reservation.index({ user: 1, date: -1 });
Reservation.index({ facility: 1, courtId: 1, date: 1 });

export default mongoose.model('ReservationModel', Reservation, 'reservations');
