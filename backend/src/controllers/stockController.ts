import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prismaClient';

export const addStock = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, 
      dosage, 
      batchNo, 
      manufacturer, 
      expiryDate, 
      quantityAdded 
    } = req.body;

    const pharmacistId = req.pharmacistId!;

    // Check if medicine with this batch already exists for this pharmacist
    let medicine = await prisma.medicine.findFirst({
      where: { batchNo, pharmacistId }
    });

    if (medicine) {
      // Update quantity
      medicine = await prisma.medicine.update({
        where: { id: medicine.id },
        data: { quantityAvailable: medicine.quantityAvailable + Number(quantityAdded) }
      });
    } else {
      // Create new medicine
      medicine = await prisma.medicine.create({
        data: {
          name,
          dosage,
          batchNo,
          manufacturer,
          expiryDate: new Date(expiryDate),
          quantityAvailable: Number(quantityAdded),
          pharmacistId
        }
      });
    }

    // Record the stock entry
    const stockEntry = await prisma.stockEntry.create({
      data: {
        medicineId: medicine.id,
        pharmacistId,
        quantityAdded: Number(quantityAdded)
      }
    });

    res.status(201).json({ message: 'Stock added successfully', medicine, stockEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
