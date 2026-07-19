import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let OrderItem = new Schema({
  equipment: { type: Schema.Types.ObjectId, ref: 'EquipmentModel', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 }
});

let Order = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'UserModel', required: true },
  items: [OrderItem],
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['ordered', 'accepted', 'picked_up', 'cancelled'], default: 'ordered' },
  cancelledAt: Date,
  facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel' }
}, { timestamps: true });

Order.index({ user: 1, status: 1 });

export default mongoose.model('OrderModel', Order, 'orders');
