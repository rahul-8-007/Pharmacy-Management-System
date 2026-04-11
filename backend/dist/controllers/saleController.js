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
exports.sellTablets = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const sellTablets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchNo, quantitySold } = req.body;
        const pharmacistId = req.pharmacistId;
        const qty = Number(quantitySold);
        const medicine = yield prismaClient_1.default.medicine.findFirst({
            where: { batchNo, pharmacistId }
        });
        if (!medicine) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        if (medicine.quantityAvailable < qty) {
            return res.status(400).json({ error: 'Insufficient stock available' });
        }
        // Transact the sale and stock deduct
        const [updatedMedicine, saleRecord] = yield prismaClient_1.default.$transaction([
            prismaClient_1.default.medicine.update({
                where: { id: medicine.id },
                data: { quantityAvailable: medicine.quantityAvailable - qty }
            }),
            prismaClient_1.default.sale.create({
                data: {
                    medicineId: medicine.id,
                    pharmacistId,
                    quantitySold: qty
                }
            })
        ]);
        // Check if reorder required (low stock threshold can be grabbed from env)
        const threshold = Number(process.env.LOW_STOCK_THRESHOLD || 20);
        const lowStockAlert = updatedMedicine.quantityAvailable < threshold;
        res.json({
            message: 'Sale recorded successfully',
            updatedMedicine,
            saleRecord,
            lowStockAlert
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.sellTablets = sellTablets;
