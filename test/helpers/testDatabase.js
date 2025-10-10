import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class TestDatabase {
  static async connect() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    const testDbUrl = process.env.DB_URL_TEST;
    if (!testDbUrl) {
      throw new Error('DB_URL_TEST não está definida no .env');
    }
    
    await mongoose.connect(testDbUrl);
    console.log('📊 Conectado ao banco de testes:', testDbUrl.replace(/\/\/.*@/, '//***@'));
  }
  
  static async disconnect() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
  
  static async clearDatabase() {
    const collections = mongoose.connection.collections;
    
    // Usar Promise.all para limpeza paralela
    const clearPromises = Object.keys(collections).map(key => 
      collections[key].deleteMany({})
    );
    
    await Promise.all(clearPromises);
  }
}

export default TestDatabase;
