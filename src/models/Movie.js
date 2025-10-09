import mongoose from 'mongoose';

/**
 * 🎬 Modelo de Filme - RF25
 * Sistema completo para cadastro de filmes por administradores
 */

const movieSchema = new mongoose.Schema({
  // Informações Básicas
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  synopsis: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  duration: { 
    type: Number, 
    required: true,
    min: 1 // duração em minutos
  },
  releaseYear: { 
    type: Number, 
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5 // permite filmes futuros
  },

  // Equipe de Produção
  cast: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  director: { 
    type: String, 
    required: true,
    trim: true
  },

  // Classificações
  genres: [{ 
    type: String, 
    required: true,
    enum: [
      'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror', 'Ficção Científica',
      'Romance', 'Thriller', 'Documentário', 'Animação', 'Fantasia',
      'Crime', 'Mistério', 'Guerra', 'Western', 'Musical', 'Biografia',
      'História', 'Esporte', 'Família'
    ]
  }],
  ageRating: {
    type: String,
    required: true,
    enum: ['L', '10', '12', '14', '16', '18']
  },

  // Idiomas e Acessibilidade
  languages: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  subtitles: [{ 
    type: String, 
    required: true,
    trim: true
  }],

  // Origem
  country: { 
    type: String, 
    required: true,
    trim: true
  },
  studio: { 
    type: String, 
    required: true,
    trim: true
  },

  // Conteúdo Multimídia
  images: {
    poster: { 
      type: String, 
      required: true // URL da imagem principal
    },
    backdrop: { 
      type: String, 
      required: true // URL da imagem de fundo
    },
    gallery: [{ 
      type: String // URLs de imagens adicionais
    }]
  },
  trailer: {
    url: { 
      type: String, 
      required: true // URL do trailer
    },
    platform: { 
      type: String, 
      enum: ['YouTube', 'Vimeo', 'Local'],
      default: 'YouTube'
    }
  },

  // Configurações de Streaming (campos antigos mantidos para compatibilidade)
  url: { type: String, required: true }, // URL do filme completo
  downloadUrl: { type: String, default: null },
  isPremium: { type: Boolean, default: false },

  // Metadados Administrativos
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para melhor performance de busca
movieSchema.index({ title: 'text', synopsis: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ status: 1 });
movieSchema.index({ createdBy: 1 });

// Método virtual para duração formatada
movieSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
});

// Método para validar se o usuário pode editar o filme
movieSchema.methods.canBeEditedBy = function(userId, userRole) {
  return userRole === 'admin' || this.createdBy.toString() === userId.toString();
};

export default mongoose.model('Movie', movieSchema);