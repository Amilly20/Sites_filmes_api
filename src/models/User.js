import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
  plan: {
    type: { type: String, enum: ['free', 'monthly', 'lifetime'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null }, // null para lifetime
    downloadsUsed: { type: Number, default: 0 },
    monthlyDownloadsReset: { type: Date, default: Date.now }
  },
  devices: [{ type: String }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  // Campos para recuperação de senha
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
