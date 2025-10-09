import 'dotenv/config';
import { DbConnect } from '../config/dbConnect.js';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Plan from '../models/Plan.js';
import HashSenha from '../utils/hashSenha.js';

const criarUsuarios = async () => [
	{
		name: 'Caio Salencar',
		email: 'caioosalencar@gmail.com',
		password: await HashSenha.criarHashSenha('Admin@123'),
		role: 'admin',
		plan: { type: 'lifetime', startDate: new Date(), endDate: null, downloadsUsed: 0, monthlyDownloadsReset: new Date() },
		devices: ['PC'],
		history: [],
		downloads: []
	},
	{
		name: 'Admin Sistema',
		email: 'admin.sistema@outlook.com',
		password: await HashSenha.criarHashSenha('Admin@123'),
		role: 'admin',
		plan: { type: 'lifetime', startDate: new Date(), endDate: null, downloadsUsed: 0, monthlyDownloadsReset: new Date() },
		devices: ['PC'],
		history: [],
		downloads: []
	},
	{
		name: 'João Silva',
		email: 'joao.silva@hotmail.com',
		password: await HashSenha.criarHashSenha('User@123'),
		role: 'user',
		plan: { type: 'monthly', startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), downloadsUsed: 0, monthlyDownloadsReset: new Date() },
		devices: ['Celular'],
		history: [],
		downloads: []
	},
	{
		name: 'Maria Santos',
		email: 'maria.santos@yahoo.com',
		password: await HashSenha.criarHashSenha('Free@123'),
		role: 'user',
		plan: { type: 'free', startDate: new Date(), endDate: null, downloadsUsed: 3, monthlyDownloadsReset: new Date() },
		devices: ['Celular'],
		history: [],
		downloads: []
	},
	{
		name: 'Pedro Oliveira',
		email: 'pedro.oliveira@uol.com.br',
		password: await HashSenha.criarHashSenha('Premium@123'),
		role: 'user',
		plan: { type: 'lifetime', startDate: new Date(), endDate: null, downloadsUsed: 50, monthlyDownloadsReset: new Date() },
		devices: ['PC', 'Tablet'],
		history: [],
		downloads: []
	},
	{
		name: 'Ana Costa',
		email: 'ana.costa@icloud.com',
		password: await HashSenha.criarHashSenha('User@456'),
		role: 'user',
		plan: { type: 'monthly', startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), downloadsUsed: 15, monthlyDownloadsReset: new Date() },
		devices: ['iPhone'],
		history: [],
		downloads: []
	},
	{
		name: 'Carlos Ferreira',
		email: 'carlos.ferreira@globo.com',
		password: await HashSenha.criarHashSenha('Test@789'),
		role: 'user',
		plan: { type: 'free', startDate: new Date(), endDate: null, downloadsUsed: 5, monthlyDownloadsReset: new Date() },
		devices: ['Android'],
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

const createSeedMovies = (adminUserId) => [
	{
		title: 'Vingadores: Ultimato',
		synopsis: 'Após Thanos eliminar metade das criaturas vivas, os Vingadores têm de lidar com a perda de amigos e entes queridos. Com Tony Stark vagando perdido no espaço sem água e comida, Steve Rogers e Natasha Romanoff lideram a resistência contra o titã louco.',
		duration: 181,
		releaseYear: 2019,
		cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
		director: 'Anthony Russo, Joe Russo',
		genres: ['Ação', 'Aventura', 'Ficção Científica'],
		ageRating: '12',
		languages: ['Inglês', 'Português'],
		subtitles: ['Português', 'Inglês'],
		country: 'Estados Unidos',
		studio: 'Marvel Studios',
		images: {
			poster: 'https://exemplo.com/vingadores-poster.jpg',
			backdrop: 'https://exemplo.com/vingadores-backdrop.jpg',
			gallery: ['https://exemplo.com/vingadores-1.jpg', 'https://exemplo.com/vingadores-2.jpg']
		},
		trailer: {
			url: 'https://youtube.com/watch?v=TcMBFSGVi1c',
			platform: 'YouTube'
		},
		url: 'https://exemplo.com/vingadores-ultimato',
		downloadUrl: 'https://exemplo.com/download/vingadores',
		isPremium: true,
		status: 'published',
		createdBy: adminUserId
	},
	{
		title: 'Parasita',
		synopsis: 'A família Kim vive em uma casa semisubterrânea e luta para conseguir um emprego. Por acaso, o filho consegue um emprego como tutor de uma família rica, os Park, e planeja um golpe junto com sua família para enganar os patrões.',
		duration: 132,
		releaseYear: 2019,
		cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
		director: 'Bong Joon-ho',
		genres: ['Drama', 'Thriller', 'Comédia'],
		ageRating: '16',
		languages: ['Coreano'],
		subtitles: ['Português', 'Inglês'],
		country: 'Coreia do Sul',
		studio: 'CJ Entertainment',
		images: {
			poster: 'https://exemplo.com/parasita-poster.jpg',
			backdrop: 'https://exemplo.com/parasita-backdrop.jpg',
			gallery: ['https://exemplo.com/parasita-1.jpg']
		},
		trailer: {
			url: 'https://youtube.com/watch?v=5xH0HfJHsaY',
			platform: 'YouTube'
		},
		url: 'https://exemplo.com/parasita',
		downloadUrl: 'https://exemplo.com/download/parasita',
		isPremium: false,
		status: 'published',
		createdBy: adminUserId
	},
	{
		title: 'Cidade de Deus',
		synopsis: 'Buscapé é um jovem pobre, negro e muito sensível, que cresce em um universo de muita violência. Ele vive na Cidade de Deus, favela carioca conhecida por ser um dos locais mais violentos do Rio.',
		duration: 130,
		releaseYear: 2002,
		cast: ['Alexandre Rodrigues', 'Leandro Firmino', 'Phellipe Haagensen', 'Douglas Silva'],
		director: 'Fernando Meirelles, Kátia Lund',
		genres: ['Drama', 'Crime'],
		ageRating: '18',
		languages: ['Português'],
		subtitles: ['Inglês', 'Espanhol'],
		country: 'Brasil',
		studio: 'O2 Filmes',
		images: {
			poster: 'https://exemplo.com/cidade-deus-poster.jpg',
			backdrop: 'https://exemplo.com/cidade-deus-backdrop.jpg',
			gallery: ['https://exemplo.com/cidade-deus-1.jpg', 'https://exemplo.com/cidade-deus-2.jpg']
		},
		trailer: {
			url: 'https://youtube.com/watch?v=dcUOO4Itgmw',
			platform: 'YouTube'
		},
		url: 'https://exemplo.com/cidade-de-deus',
		downloadUrl: 'https://exemplo.com/download/cidade-deus',
		isPremium: false,
		status: 'published',
		createdBy: adminUserId
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
		
		// Encontrar o usuário admin para usar nos filmes
		const adminUser = users.find(user => user.email === 'caioosalencar@gmail.com');

		console.log('📦 Criando planos...');
		const plans = await Plan.insertMany(seedPlans);

		console.log('🎬 Criando filmes...');
		const seedMovies = createSeedMovies(adminUser._id);
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
