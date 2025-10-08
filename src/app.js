import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DbConnect } from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import planUpgradeRoutes from "./routes/planUpgradeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
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
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/plans", planUpgradeRoutes); // Rotas de upgrade/downgrade
app.use("/api/payments", paymentRoutes); // Rotas de pagamento

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

export default app;
