import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prismaClient';
export const getStockHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.stockEntry.findMany({
      include: {
        medicine: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
};
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

    if (!name || !dosage || !batchNo || !expiryDate || !quantityAdded) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const parsedDate = new Date(expiryDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid expiry date format' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of today
    if (parsedDate < today) {
      return res.status(400).json({ error: 'Cannot add medicines that are already expired.' });
    }

    const addedQty = Number(quantityAdded);
    if (isNaN(addedQty) || addedQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a valid positive number' });
    }

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
    console.error('Add Stock Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
