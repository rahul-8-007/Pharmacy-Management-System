import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prismaClient';

export const getPredictions = async (req: AuthRequest, res: Response) => {
  try {
    const pharmacistId = req.pharmacistId!;
    
    // Fetch all medicines for this pharmacist
    const medicines = await prisma.medicine.findMany({
      where: { pharmacistId }
    });

    // Fetch all sales for this pharmacist in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await prisma.sale.findMany({
      where: {
        pharmacistId,
        soldAt: { gte: thirtyDaysAgo }
      }
    });

    // Simple predictions
    const predictions = medicines.map(medicine => {
      const medSales = sales.filter(s => s.medicineId === medicine.id);
      const totalSoldLast30Days = medSales.reduce((acc, sale) => acc + sale.quantitySold, 0);
      
      return {
        medicineId: medicine.id,
        name: medicine.name,
        dosage: medicine.dosage,
        currentStock: medicine.quantityAvailable,
        soldLast30Days: totalSoldLast30Days,
        // Basic predictive logic: require next month what was sold last month + 10% buffer
        nextMonthEstimate: Math.ceil(totalSoldLast30Days * 1.1),
        status: medicine.quantityAvailable < totalSoldLast30Days ? 'Reorder Needed' : 'Stock Sufficient'
      };
    });

    // Filter to only items that actually have movement or are in stock
    const activePredictions = predictions.filter(p => p.soldLast30Days > 0 || p.currentStock > 0);

    // Sales trend summary (aggregate sales per day for chart)
    const trendsByDay: Record<string, number> = {};
    sales.forEach(sale => {
      const dateKey = sale.soldAt.toISOString().split('T')[0];
      trendsByDay[dateKey] = (trendsByDay[dateKey] || 0) + sale.quantitySold;
    });

    const trendArray = Object.keys(trendsByDay).sort().map(date => ({
      date,
      sales: trendsByDay[date]
    }));

    res.json({
      predictions: activePredictions,
      trends: trendArray
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
