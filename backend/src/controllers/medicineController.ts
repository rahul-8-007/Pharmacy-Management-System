import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prismaClient';

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    
    // Auto-clean expired stock by zeroing out their quantities first
    await prisma.medicine.updateMany({
      where: {
        pharmacistId: req.pharmacistId,
        expiryDate: { lt: now },
        quantityAvailable: { gt: 0 }
      },
      data: {
        quantityAvailable: 0
      }
    });

    const medicines = await prisma.medicine.findMany({
      where: { pharmacistId: req.pharmacistId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(medicines);
  } catch (error) {
    console.error('Get Inventory Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getByBatchNo = async (req: AuthRequest, res: Response) => {
  try {
    const { batchNo } = req.params;
    
    // Check if the medicine exists for this pharmacist
    const medicine = await prisma.medicine.findFirst({
      where: { 
        batchNo,
        pharmacistId: req.pharmacistId
      }
    });

    if (medicine) {
      return res.json({ foundInDb: true, medicine });
    }

    // External simulation: if not found, we return a mock format so frontend can auto-fill
    // In a real app, this would call an external medicine API.
    if (batchNo.startsWith('EXT')) {
      return res.json({
        foundInDb: false,
        medicine: {
          name: 'Simulated Medicine',
          batchNo: batchNo,
          dosage: '500mg',
          manufacturer: 'Simulated Pharma Corp',
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        }
      });
    }

    res.json({ foundInDb: false, medicine: null });
  } catch (error) {
    console.error('Get Batch Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWastage = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredMedicines = await prisma.medicine.findMany({
      where: {
        pharmacistId: req.pharmacistId,
        expiryDate: { lt: today }
      },
      include: {
        stockEntries: true,
        sales: true
      },
      orderBy: { expiryDate: 'desc' }
    });

    const wastageData = expiredMedicines.map(med => {
      const totalAdded = med.stockEntries.reduce((sum, entry) => sum + entry.quantityAdded, 0);
      const totalSold = med.sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      const wastedQuantity = totalAdded - totalSold;

      return {
        id: med.id,
        name: med.name,
        batchNo: med.batchNo,
        dosage: med.dosage,
        expiryDate: med.expiryDate,
        wastedQuantity
      };
    }).filter(med => med.wastedQuantity > 0);

    res.json(wastageData);
  } catch (error) {
    console.error('Get Wastage Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
