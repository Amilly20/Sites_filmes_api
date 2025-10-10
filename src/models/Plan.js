import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    enum: ['free', 'monthly', 'lifetime'],
    unique: true 
  },
  displayName: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: { 
    type: String, 
    default: 'BRL'
  },
  features: {
    showAds: { type: Boolean, default: true },
    monthlyDownloads: { type: Number, default: 0 }, // 0 = unlimited
    unlimitedAccess: { type: Boolean, default: false },
    hdQuality: { type: Boolean, default: false },
    simultaneousDevices: { type: Number, default: 1 },
    offlineDownload: { type: Boolean, default: false }
  },
  duration: {
    type: Number, // em dias, null para lifetime
    default: null
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

export default mongoose.model('Plan', planSchema);
