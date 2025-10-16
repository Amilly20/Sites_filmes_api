import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DbConnect } from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import planUpgradeRoutes from "./routes/planUpgradeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import planRestrictionsRoutes from "./routes/planRestrictionsRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import getSwaggerOptions from "./docs/config/head.js";

dotenv.config();

const app = express();

async function initializeApp() {
  // Só conectar se não estiver em ambiente de teste
  if (process.env.NODE_ENV !== 'test') {
    try {
      await DbConnect.conectar();
      console.log("Conexão com o banco de dados estabelecida com sucesso.");
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error.message);
      // process.exit(1); // Descomente se quiser que o servidor pare ao falhar a conexão
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3800',
    'http://127.0.0.1:3800',
    'http://localhost:3000', // Frontend URL
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/plans", planUpgradeRoutes); // Rotas de upgrade/downgrade
app.use("/api/payments", paymentRoutes); // Rotas de pagamento
app.use("/api/plans/restrictions", planRestrictionsRoutes); // Rotas de restrições de planos
app.use("/api/movies", movieRoutes); // Rotas de gerenciamento de filmes - RF25

// Documentação Swagger
const swaggerOptions = getSwaggerOptions();
console.log('🔧 Configurando Swagger...');

const swaggerSpec = swaggerJSDoc(swaggerOptions);
console.log('📄 Spec gerada:', Object.keys(swaggerSpec).join(', '));

// Servir Swagger UI na rota /api-docs
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "🎬 API Sites Filmes - Sistema de Planos de Assinatura",
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1f2937; font-size: 2rem; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 8px; }
  `,
  swaggerOptions: {
    explorer: true,
    filter: true,
    showRequestDuration: true,
    defaultModelsExpandDepth: 2,
    docExpansion: 'list'
  }
}));

// Rota raiz com redirecionamento para documentação
app.get("/", (req, res) => {
  res.redirect('/api-docs');
});

// Middleware de tratamento de erro
app.use((error, req, res, next) => {
  console.error('🚨 Erro capturado:', error);
  
  // Se é um APIError customizado
  if (error.name === 'APIError' || error.statusCode) {
    return res.status(error.statusCode || 400).json({
      success: false,
      error: true,
      message: error.message || 'Erro na requisição',
      errors: error.errors || [],
      statusCode: error.statusCode || 400
    });
  }
  
  // Se é um erro de validação do Mongoose
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: true,
      message: 'Dados inválidos',
      errors: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      })),
      statusCode: 400
    });
  }
  
  // Se é um erro de ObjectId inválido
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: true,
      message: 'ID inválido',
      errors: [{ field: error.path, message: 'ID deve ser um ObjectId válido' }],
      statusCode: 400
    });
  }
  
  // Erro genérico
  console.error('❌ Erro não tratado:', error.stack);
  return res.status(500).json({
    success: false,
    error: true,
    message: 'Erro interno do servidor',
    errors: [],
    statusCode: 500
  });
});

export default app;
