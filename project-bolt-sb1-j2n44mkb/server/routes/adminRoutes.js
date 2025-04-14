import express from 'express';
import adminHotelsRoutes from './adminHotelsRoutes.js';
import adminTransportRoutes from './adminTransportRoutes.js';
import adminTouristSpotsRoutes from './adminTouristSpotsRoutes.js';
import adminLocation from './adminLocation.js';
import adminStatsRoutes from './adminStatsRoutes.js';
import adminAgency from './adminAgency.js';


const router = express.Router();


// Consolidate all admin routes under /api/admin

router.use('/stats', adminStatsRoutes); 
router.use('/hotels', adminHotelsRoutes);
router.use('/transport', adminTransportRoutes);
router.use('/tourist-spots', adminTouristSpotsRoutes);
router.use('/locations', adminLocation);
router.use('/agency', adminAgency); 

export default router;
