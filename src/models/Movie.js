import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  genre: [{ type: String, required: true }],
  releaseYear: { type: Number, required: true },
  cast: [{ type: String, required: true }],
  director: { type: String, required: true },
  language: { type: String, required: true },
  url: { type: String, required: true },
  downloadUrl: { type: String, default: null },
  thumbnail: { type: String, required: true },
  isPremium: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Movie', movieSchema);