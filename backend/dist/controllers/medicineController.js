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
exports.getByBatchNo = exports.getInventory = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const getInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const medicines = yield prismaClient_1.default.medicine.findMany({
            where: { pharmacistId: req.pharmacistId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(medicines);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.getInventory = getInventory;
const getByBatchNo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchNo } = req.params;
        // Check if the medicine exists for this pharmacist
        const medicine = yield prismaClient_1.default.medicine.findFirst({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.getByBatchNo = getByBatchNo;
