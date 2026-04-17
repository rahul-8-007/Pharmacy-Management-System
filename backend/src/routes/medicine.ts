import { Router } from 'express';
import { getInventory, getByBatchNo, getWastage } from '../controllers/medicineController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);
router.get('/scan/:code', async(req,res)=>{
 const code=req.params.code;

 const med = await prisma.medicine.findFirst({
   where:{
     OR:[
       {barcode:code},
       {batchNo:code}
     ]
   }
 });

 if(med) return res.json(med);

 return res.json({
   batchNo:code,
   name:"",
   dosage:"",
   manufacturer:"",
   expiryDate:""
 });
});
router.get('/', getInventory);
router.get('/wastage', getWastage);
router.get('/batch/:batchNo', getByBatchNo);

export default router;
