import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentMethod: { type: String, required: true, enum: ['credit_card', 'pix', 'boleto', 'others'] },
  transactionId: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);