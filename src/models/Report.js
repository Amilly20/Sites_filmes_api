import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalUsers: { type: Number, required: true },
  activeUsers: { type: Number, required: true },
  planDistribution: {
    free: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0 }
  },
  mostWatchedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  mostWatchedSports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }]
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);