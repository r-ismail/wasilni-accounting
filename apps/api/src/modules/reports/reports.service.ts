import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { Unit } from '../units/schemas/unit.schema';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
  ) { }

  async getRevenueReport(companyId: string, filters?: { fromDate?: string; toDate?: string }) {
    const match: any = { companyId: new Types.ObjectId(companyId) };

    if (filters?.fromDate || filters?.toDate) {
      match.issueDate = {};
      if (filters.fromDate) {
        match.issueDate.$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        match.issueDate.$lte = new Date(filters.toDate);
      }
    }

    const [summary] = await this.invoiceModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
          },
        },
      ])
      .exec();

    const monthly = await this.invoiceModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: '$issueDate' },
              month: { $month: '$issueDate' },
            },
            invoiced: { $sum: '$totalAmount' },
            paid: { $sum: '$paidAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ])
      .exec();

    return {
      totalInvoiced: summary?.totalInvoiced || 0,
      totalPaid: summary?.totalPaid || 0,
      totalUnpaid: (summary?.totalInvoiced || 0) - (summary?.totalPaid || 0),
      monthly: monthly.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        invoiced: item.invoiced,
        paid: item.paid,
      })),
    };
  }

  async getOccupancyReport(companyId: string) {
    const companyObjectId = new Types.ObjectId(companyId);

    const [unitSummary, perBuilding] = await Promise.all([
      this.unitModel.aggregate([
        { $match: { companyId: companyObjectId } },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: 1 },
            occupiedUnits: {
              $sum: {
                $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0],
              },
            },
          },
        },
      ]),
      this.unitModel
        .aggregate([
          { $match: { companyId: companyObjectId } },
          {
            $group: {
              _id: '$buildingId',
              total: { $sum: 1 },
              occupied: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0],
                },
              },
            },
          },
          {
            $lookup: {
              from: 'buildings',
              localField: '_id',
              foreignField: '_id',
              as: 'building',
            },
          },
          { $unwind: { path: '$building', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              buildingId: '$_id',
              buildingName: '$building.name',
              total: 1,
              occupied: 1,
              occupancyRate: {
                $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$occupied', '$total'] }],
              },
            },
          },
          { $sort: { buildingName: 1 } },
        ])
        .exec(),
    ]);

    const totals = unitSummary?.[0];
    const totalUnits = totals?.totalUnits || 0;
    const occupiedUnits = totals?.occupiedUnits || 0;
    const occupancyRate = totalUnits === 0 ? 0 : occupiedUnits / totalUnits;

    const activeContracts = await this.contractModel
      .countDocuments({
        companyId: companyObjectId,
        isActive: true,
      })
      .exec();

    return {
      totalUnits,
      occupiedUnits,
      occupancyRate,
      activeContracts,
      perBuilding: perBuilding.map((item) => ({
        buildingId: item.buildingId,
        buildingName: item.buildingName || 'Unassigned',
        totalUnits: item.total,
        occupiedUnits: item.occupied,
        occupancyRate: item.occupancyRate,
      })),
    };
  }

  async getOverdueReport(companyId: string) {
    const now = new Date();
    const companyObjectId = new Types.ObjectId(companyId);

    const [summary] = await this.invoiceModel
      .aggregate([
        {
          $match: {
            companyId: companyObjectId,
            status: { $in: ['draft', 'posted'] },
            dueDate: { $lt: now },
          },
        },
        {
          $group: {
            _id: null,
            overdueCount: { $sum: 1 },
            overdueAmount: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
          },
        },
      ])
      .exec();

    const topOverdue = await this.invoiceModel
      .find({
        companyId: companyObjectId,
        status: { $in: ['draft', 'posted'] },
        dueDate: { $lt: now },
      })
      .populate({
        path: 'contractId',
        populate: [{ path: 'customerId' }, { path: 'unitId' }],
      })
      .sort({ dueDate: 1 })
      .limit(10)
      .exec();

    return {
      overdueCount: summary?.overdueCount || 0,
      overdueAmount: summary?.overdueAmount || 0,
      topOverdue: topOverdue.map((invoice) => ({
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate,
        status: invoice.status,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        remainingAmount: invoice.totalAmount - invoice.paidAmount,
        customerName: (invoice.contractId as any)?.customerId?.name,
        unitNumber: (invoice.contractId as any)?.unitId?.unitNumber,
      })),
    };
  }

  async getCustomersReport(companyId: string) {
    const companyObjectId = new Types.ObjectId(companyId);

    const customers = await this.invoiceModel.aggregate([
      { $match: { companyId: companyObjectId } },
      {
        $lookup: {
          from: 'contracts',
          localField: 'contractId',
          foreignField: '_id',
          as: 'contract',
        },
      },
      { $unwind: '$contract' },
      {
        $lookup: {
          from: 'customers',
          localField: 'contract.customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: '$customer._id',
          name: { $first: '$customer.name' },
          totalInvoiced: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          invoiceCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalInvoiced: 1,
          totalPaid: 1,
          balance: { $subtract: ['$totalInvoiced', '$totalPaid'] },
          invoiceCount: 1,
        },
      },
      { $sort: { balance: -1, name: 1 } },
    ]);

    return customers;
  }

  async getUnitsReport(companyId: string) {
    const companyObjectId = new Types.ObjectId(companyId);

    const units = await this.invoiceModel.aggregate([
      { $match: { companyId: companyObjectId } },
      {
        $lookup: {
          from: 'contracts',
          localField: 'contractId',
          foreignField: '_id',
          as: 'contract',
        },
      },
      { $unwind: '$contract' },
      {
        $lookup: {
          from: 'units',
          localField: 'contract.unitId',
          foreignField: '_id',
          as: 'unit',
        },
      },
      { $unwind: '$unit' },
      {
        $group: {
          _id: '$unit._id',
          unitNumber: { $first: '$unit.unitNumber' },
          totalInvoiced: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          invoiceCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          unitNumber: 1,
          totalInvoiced: 1,
          totalPaid: 1,
          balance: { $subtract: ['$totalInvoiced', '$totalPaid'] },
          invoiceCount: 1,
        },
      },
      { $sort: { balance: -1, unitNumber: 1 } },
    ]);

    return units;
  }
}
