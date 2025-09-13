import express from "express";
import dotenv from "dotenv";
import { DbConnect } from "./config/dbConnect.js";

dotenv.config();

const app = express();

// Middlewares básicos
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    message: "API funcionando!",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Rota para testar conexão com banco
app.get("/test-db", async (req, res) => {
  try {
    // Verificar o estado da conexão
    const dbState = app.locals.dbConnected ? "conectado" : "desconectado";
    res.json({
      message: "Teste de conexão com banco",
      database: dbState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao verificar conexão com banco",
      error: error.message
    });
  }
});

async function initializeApp() {
  // Só conectar se não estiver em ambiente de teste
  if (process.env.NODE_ENV !== 'test') {
    try {
      console.log("🔄 Tentando conectar ao banco de dados...");
      await DbConnect.conectar();
      app.locals.dbConnected = true;
      console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao conectar ao banco de dados:", error.message);
      console.log("⚠️ Servidor continuará funcionando sem banco de dados para teste...");
      app.locals.dbConnected = false;
      // Não sair do processo para permitir teste sem banco
      // process.exit(1);
    }
  }
}

// Só inicializar se não estiver em teste
if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}

export default app;
