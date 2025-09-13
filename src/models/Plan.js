import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['Gratuito', 'Mensal', 'Vitalício'] },
  price: { type: Number, required: true },
  features: [{ type: String, required: true }],
  downloadLimit: { type: Number, default: null },
  ads: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('Plan', planSchema);