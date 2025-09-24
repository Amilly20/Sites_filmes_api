import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DbConnect } from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
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

// Documentação Swagger
const swaggerSpec = swaggerJSDoc(getSwaggerOptions());
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota de teste - removida pois o Swagger agora está na raiz
// app.get("/", (req, res) => {
//   res.json({
//     message: "API funcionando!",
//     status: "success",
//     timestamp: new Date().toISOString()
//   });
// });

export default app;
