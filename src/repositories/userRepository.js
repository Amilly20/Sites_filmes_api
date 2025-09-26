import User from "../models/User.js";

export default class UserRepository {
	static async create({ name, email, password, role = 'user', plan, devices, history, downloads }) {
		const user = await User.create({
			name,
			email,
			password,
			role,
			plan,
			devices,
			history,
			downloads,
		});
		return user;
	}

	static async findByEmail(email) {
		return await User.findOne({ email });
	}

	static async findById(userId) {
		return await User.findById(userId);
	}

	static async findOne(query) {
		return await User.findOne(query);
	}

	static async buscarPorId(userId) {
		return await User.findById(userId);
	}

	static async findMany(filtros) {
		const query = {};
		if (filtros.id) query._id = filtros.id;
		if (filtros.name) query.name = { $regex: filtros.name, $options: 'i' };
		if (filtros.email) query.email = { $regex: filtros.email, $options: 'i' };
		return await User.find(query).select("-password");
	}

	static async update(userId, data) {
		const updateData = {};
		if (data.name) updateData.name = data.name;
		if (data.email) updateData.email = data.email;
		if (data.password) updateData.password = data.password;
		if (data.role) updateData.role = data.role;
		if (data.plan) updateData.plan = data.plan;
		if (data.devices) updateData.devices = data.devices;
		if (data.history) updateData.history = data.history;
		if (data.downloads) updateData.downloads = data.downloads;
		if (data.resetToken !== undefined) updateData.resetToken = data.resetToken;
		if (data.resetTokenExpires !== undefined) updateData.resetTokenExpires = data.resetTokenExpires;

		return await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
	}

	static async delete(userId) {
		return await User.findByIdAndDelete(userId).select("-password");
	}

	/**
	 * Método para administradores buscarem todos os usuários
	 * Retorna todos os usuários exceto as senhas
	 */
	static async findAll() {
		return await User.find({}).select("-password").sort({ createdAt: -1 });
	}
}
