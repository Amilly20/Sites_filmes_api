import 'dotenv/config';
import DbConnect from '../config/dbConnect.js';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Plan from '../models/Plan.js';
import HashSenha from '../utils/hashSenha.js';

const criarUsuarios = async () => [
	{
		name: 'Admin',
		email: 'admin@filmes.com',
		password: await HashSenha.criarHashSenha('Admin@123'),
		role: 'admin',
		plan: { type: 'lifetime', startDate: new Date(), endDate: null },
		devices: ['PC'],
		history: [],
		downloads: []
	},
	{
		name: 'Usuário Teste',
		email: 'user@filmes.com',
		password: await HashSenha.criarHashSenha('User@123'),
		role: 'user',
		plan: { type: 'monthly', startDate: new Date(), endDate: null },
		devices: ['Celular'],
		history: [],
		downloads: []
	}
];

const seedPlans = [
	{
		name: 'Gratuito',
		price: 0,
		features: ['Acesso limitado', 'Com anúncios'],
		downloadLimit: 0,
		ads: true
	},
	{
		name: 'Mensal',
		price: 29.9,
		features: ['Acesso total', 'Sem anúncios', 'Downloads limitados'],
		downloadLimit: 10,
		ads: false
	},
	{
		name: 'Vitalício',
		price: 199.9,
		features: ['Acesso total', 'Sem anúncios', 'Downloads ilimitados'],
		downloadLimit: null,
		ads: false
	}
];

const seedMovies = [
	{
		title: 'Filme Exemplo',
		description: 'Um filme de exemplo para o seed.',
		duration: 120,
		genre: ['Ação', 'Aventura'],
		releaseYear: 2022,
		cast: ['Ator 1', 'Ator 2'],
		director: 'Diretor Exemplo',
		language: 'Português',
		url: 'https://exemplo.com/filme',
		downloadUrl: 'https://exemplo.com/download',
		thumbnail: 'https://exemplo.com/thumb.jpg',
		isPremium: false
	}
];

(async () => {
	try {
		console.log('🌱 Iniciando seed do banco de dados...');
		await DbConnect.conectar();

		console.log('🧹 Limpando coleções existentes...');
		await User.deleteMany({});
		await Plan.deleteMany({});
		await Movie.deleteMany({});

		console.log('🔐 Criando senhas criptografadas...');
		const seedUsers = await criarUsuarios();

		console.log('👥 Criando usuários...');
		const users = await User.insertMany(seedUsers);

		console.log('📦 Criando planos...');
		const plans = await Plan.insertMany(seedPlans);

		console.log('🎬 Criando filmes...');
		const movies = await Movie.insertMany(seedMovies);

		console.log('✅ Seed concluído! Coleções criadas e populadas.');
		console.log(`📈 ${users.length} usuários criados`);
		console.log(`💳 ${plans.length} planos criados`);
		console.log(`🎬 ${movies.length} filmes criados`);

		await DbConnect.desconectar();
		process.exit(0);
	} catch (error) {
		console.error('❌ Erro no seed:', error);
		await DbConnect.desconectar();
		process.exit(1);
	}
})();
