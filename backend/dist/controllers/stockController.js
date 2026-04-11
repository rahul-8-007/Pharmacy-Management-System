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
exports.addStock = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const addStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, dosage, batchNo, manufacturer, expiryDate, quantityAdded } = req.body;
        const pharmacistId = req.pharmacistId;
        // Check if medicine with this batch already exists for this pharmacist
        let medicine = yield prismaClient_1.default.medicine.findFirst({
            where: { batchNo, pharmacistId }
        });
        if (medicine) {
            // Update quantity
            medicine = yield prismaClient_1.default.medicine.update({
                where: { id: medicine.id },
                data: { quantityAvailable: medicine.quantityAvailable + Number(quantityAdded) }
            });
        }
        else {
            // Create new medicine
            medicine = yield prismaClient_1.default.medicine.create({
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
        const stockEntry = yield prismaClient_1.default.stockEntry.create({
            data: {
                medicineId: medicine.id,
                pharmacistId,
                quantityAdded: Number(quantityAdded)
            }
        });
        res.status(201).json({ message: 'Stock added successfully', medicine, stockEntry });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.addStock = addStock;
