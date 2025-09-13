import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const debugMode = process.env.DEBUG === 'true';

// Configurar URL do banco baseado no ambiente
const getBancoUrl = () => {
  let url;
  if (process.env.NODE_ENV === "test") {
    url = process.env.DB_URL_TEST || process.env.DB_URL;
  } else {
    url = process.env.DB_URL;
  }
  
  // Remover aspas se existirem
  return url ? url.replace(/^["']|["']$/g, '') : url;
};

const bancoUrl = getBancoUrl();

// Configurações extras de debug e otimizações de pool
mongoose.set('strictQuery', process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test');
mongoose.set('autoIndex', true);
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Eventos de log de conexão
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose conectado ao MongoDB.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose erro: ${err}`);
  // Aqui você pode incluir envio de e-mail ou outras ações
  // Exemplo: SendMail.enviaEmailErrorDbConect(err, new URL(import.meta.url).pathname, new Date());
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado do MongoDB.');
});

class DbConnect {
  static async conectar() {
    if (mongoose.connection.readyState === 1) {
      console.log('⚠️ Já conectado ao MongoDB.');
      return;
    }

    try {
      const mongoUri = bancoUrl;

      if (!mongoUri) {
        throw new Error('❌ Variável de ambiente DB_URL não configurada corretamente.');
      }
      
      console.log(`🌐 Conectando ao banco: ${process.env.NODE_ENV === 'test' ? 'TEST' : 'PRODUCTION'}`);
      console.log(`🔗 URL do banco: ${mongoUri.replace(/:[^:@]*@/, ':***@')}`); // Ocultar senha no log

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        maxPoolSize: 10,
      });

      console.log('✅ Conexão com o banco estabelecida!');
    } catch (error) {
      console.error(`❌ Erro na conexão com o banco de dados: ${error.message}`);
      if (process.env.NODE_ENV !== 'test') {
        // Exemplo: SendMail.enviaEmailErrorDbConect(error, new URL(import.meta.url).pathname, new Date());
      }
      throw error;
    }
  }

  static async desconectar() {
    try {
      await mongoose.disconnect();
      console.log('✅ Conexão com o banco encerrada!');
    } catch (error) {
      console.error(`❌ Erro ao desconectar do banco de dados: ${error.message}`);
      if (process.env.NODE_ENV !== 'test') {
        // Exemplo: SendMail.enviaEmailErrorDbConect(error, new URL(import.meta.url).pathname, new Date());
      }
      throw error;
    }
  }
}

export { DbConnect };
export default mongoose.connection;
