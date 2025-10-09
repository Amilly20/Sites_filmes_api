/**
 * 💳 Payment Repository
 * Repositório para gerenciar operações de dados de pagamentos
 */

import Payment from '../models/Payment.js';

class PaymentRepository {
  /**
   * 🔍 Buscar pagamentos com filtros e paginação
   */
  static async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      populate = true
    } = options;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    let query = Payment.find(filters)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip);

    if (populate) {
      query = query.populate('userId', 'name email');
    }

    const [payments, total] = await Promise.all([
      query.exec(),
      Payment.countDocuments(filters)
    ]);

    return {
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * 📊 Buscar pagamentos por usuário
   */
  static async findByUser(userId, options = {}) {
    const filters = { userId };
    return this.findWithFilters(filters, options);
  }

  /**
   * 🔍 Buscar pagamento por transaction ID
   */
  static async findByTransactionId(transactionId) {
    return Payment.findOne({ transactionId })
      .populate('userId', 'name email');
  }

  /**
   * 🔍 Buscar pagamento por external ID
   */
  static async findByExternalId(externalId) {
    return Payment.findOne({ externalId })
      .populate('userId', 'name email');
  }

  /**
   * 📈 Obter estatísticas de pagamentos
   */
  static async getPaymentStats(dateRange = {}) {
    const { startDate, endDate } = dateRange;
    
    let matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          approvedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejectedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      approvedPayments: 0,
      pendingPayments: 0,
      rejectedPayments: 0,
      approvedAmount: 0
    };
  }

  /**
   * 📊 Estatísticas por método de pagamento
   */
  static async getPaymentMethodStats(dateRange = {}) {
    const { startDate, endDate } = dateRange;
    
    let matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    return Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
          }
        }
      },
      {
        $project: {
          method: '$_id',
          count: 1,
          totalAmount: 1,
          approvedCount: 1,
          approvedAmount: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$approvedCount', '$count'] },
              100
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * 📅 Pagamentos por período
   */
  static async getPaymentsByPeriod(period = 'day', dateRange = {}) {
    const { startDate, endDate } = dateRange;
    
    let matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let dateGroup;
    switch (period) {
      case 'hour':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'month':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'year':
        dateGroup = {
          year: { $year: '$createdAt' }
        };
        break;
      default:
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    return Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateGroup,
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  /**
   * 🔍 Buscar pagamentos expirados
   */
  static async findExpiredPayments() {
    const now = new Date();
    return Payment.find({
      status: 'pending',
      expiresAt: { $lt: now }
    });
  }

  /**
   * ⏰ Marcar pagamentos como expirados
   */
  static async markExpiredPayments() {
    const now = new Date();
    const result = await Payment.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: now }
      },
      {
        $set: {
          status: 'expired',
          updatedAt: now
        }
      }
    );

    return result;
  }

  /**
   * 📊 Buscar pagamentos por status
   */
  static async findByStatus(status, options = {}) {
    const filters = { status };
    return this.findWithFilters(filters, options);
  }

  /**
   * 💰 Buscar pagamentos por método
   */
  static async findByPaymentMethod(paymentMethod, options = {}) {
    const filters = { paymentMethod };
    return this.findWithFilters(filters, options);
  }

  /**
   * 🏦 Buscar pagamentos por gateway
   */
  static async findByGateway(gateway, options = {}) {
    const filters = { gateway };
    return this.findWithFilters(filters, options);
  }

  /**
   * 📅 Buscar pagamentos por período
   */
  static async findByDateRange(startDate, endDate, options = {}) {
    const filters = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    return this.findWithFilters(filters, options);
  }

  /**
   * 💵 Buscar pagamentos por faixa de valor
   */
  static async findByAmountRange(minAmount, maxAmount, options = {}) {
    const filters = {
      amount: {
        $gte: minAmount,
        $lte: maxAmount
      }
    };
    return this.findWithFilters(filters, options);
  }

  /**
   * ✅ Criar novo pagamento
   */
  static async create(paymentData) {
    return Payment.create(paymentData);
  }

  /**
   * 🔄 Atualizar pagamento
   */
  static async updateById(id, updateData) {
    return Payment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('userId', 'name email');
  }

  /**
   * 🔍 Buscar por ID
   */
  static async findById(id) {
    return Payment.findById(id).populate('userId', 'name email');
  }

  /**
   * 🗑️ Excluir pagamento (soft delete)
   */
  static async deleteById(id) {
    return Payment.findByIdAndUpdate(id, {
      status: 'cancelled',
      deletedAt: new Date()
    });
  }

  /**
   * 📈 Relatório de conversão
   */
  static async getConversionReport(dateRange = {}) {
    const stats = await this.getPaymentStats(dateRange);
    const methodStats = await this.getPaymentMethodStats(dateRange);

    return {
      overall: {
        ...stats,
        conversionRate: stats.totalPayments > 0 
          ? ((stats.approvedPayments / stats.totalPayments) * 100).toFixed(2)
          : 0
      },
      byMethod: methodStats
    };
  }
}

export default PaymentRepository;