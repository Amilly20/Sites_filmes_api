import 'dotenv/config';
import DbConnect from '../config/dbConnect.js';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Plan from '../models/Plan.js';
import BankAccount from '../models/BankAccount.js';
import HashSenha from '../utils/hashSenha.js';
import createDefaultBankAccount from './bankAccountSeed.js';

const criarUsuarios = async () => [
	{
		name: 'Admin',
		email: 'admin@filmes.com',
		password: await HashSenha.criarHashSenha('Admin@123'),
		role: 'admin',
		plan: { type: 'lifetime', startDate: new Date(), endDate: null, downloadsUsed: 0, monthlyDownloadsReset: new Date() },
		devices: ['PC'],
		history: [],
		downloads: []
	},
	{
		name: 'Usuário Teste',
		email: 'user@filmes.com',
		password: await HashSenha.criarHashSenha('User@123'),
		role: 'user',
		plan: { type: 'monthly', startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), downloadsUsed: 0, monthlyDownloadsReset: new Date() },
		devices: ['Celular'],
		history: [],
		downloads: []
	},
	{
		name: 'Usuário Gratuito',
		email: 'free@filmes.com',
		password: await HashSenha.criarHashSenha('Free@123'),
		role: 'user',
		plan: { type: 'free', startDate: new Date(), endDate: null, downloadsUsed: 3, monthlyDownloadsReset: new Date() },
		devices: ['Celular'],
		history: [],
		downloads: []
	}
];

const seedPlans = [
	{
		name: 'free',
		displayName: 'Gratuito',
		price: 0,
		currency: 'BRL',
		features: {
			showAds: true,
			monthlyDownloads: 10,
			unlimitedAccess: false,
			hdQuality: false,
			simultaneousDevices: 1,
			offlineDownload: false
		},
		duration: null,
		active: true
	},
	{
		name: 'monthly',
		displayName: 'Mensal',
		price: 19.90,
		currency: 'BRL',
		features: {
			showAds: false,
			monthlyDownloads: 100,
			unlimitedAccess: false,
			hdQuality: true,
			simultaneousDevices: 2,
			offlineDownload: true
		},
		duration: 30,
		active: true
	},
	{
		name: 'lifetime',
		displayName: 'Vitalício',
		price: 299.90,
		currency: 'BRL',
		features: {
			showAds: false,
			monthlyDownloads: 0, // 0 = ilimitado
			unlimitedAccess: true,
			hdQuality: true,
			simultaneousDevices: 5,
			offlineDownload: true
		},
		duration: null,
		active: true
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
		await BankAccount.deleteMany({});

		console.log('🔐 Criando senhas criptografadas...');
		const seedUsers = await criarUsuarios();

		console.log('👥 Criando usuários...');
		const users = await User.insertMany(seedUsers);

		console.log('📦 Criando planos...');
		const plans = await Plan.insertMany(seedPlans);

		console.log('🎬 Criando filmes...');
		const movies = await Movie.insertMany(seedMovies);

		console.log('🏦 Criando conta bancária padrão...');
		await createDefaultBankAccount();

		console.log('✅ Seed concluído! Coleções criadas e populadas.');
		console.log(`📈 ${users.length} usuários criados`);
		console.log(`💳 ${plans.length} planos criados`);
		console.log(`🎬 ${movies.length} filmes criados`);
		console.log(`🏦 1 conta bancária padrão criada`);

		await DbConnect.desconectar();
		process.exit(0);
	} catch (error) {
		console.error('❌ Erro no seed:', error);
		await DbConnect.desconectar();
		process.exit(1);
	}
})();
