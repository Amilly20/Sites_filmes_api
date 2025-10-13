import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema({
  matchTitle: { type: String, required: true },
  league: { type: String, required: true },
  date: { type: Date, required: true },
  teams: [{ type: String, required: true }],
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 }
  },
  url: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled' }
}, {
  timestamps: true
});

export default mongoose.model('Sport', sportSchema);
