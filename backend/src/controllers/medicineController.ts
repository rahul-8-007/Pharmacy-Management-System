import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prismaClient';

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { pharmacistId: req.pharmacistId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(medicines);
  } catch (error) {
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
    res.status(500).json({ error: 'Server error' });
  }
};
