"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPredictions = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const getPredictions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pharmacistId = req.pharmacistId;
        // Fetch all medicines for this pharmacist
        const medicines = yield prismaClient_1.default.medicine.findMany({
            where: { pharmacistId }
        });
        // Fetch all sales for this pharmacist in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sales = yield prismaClient_1.default.sale.findMany({
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
        const trendsByDay = {};
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.getPredictions = getPredictions;
