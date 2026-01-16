import express from 'express'
import couponsController from "../../controller/adminModules/coupons.js";
const router = express.Router();

router.get('/',couponsController.getCoupons)
router.get('/search',couponsController.searchCoupons)
router.get('/loadCoupons',couponsController.loadCoupons)
router.put('/:editId',couponsController.editCoupon)
router.post('/',couponsController.addCoupon)
router.patch('/block/:couponId',couponsController.blockCoupon)
router.patch('/unblock/:couponId',couponsController.unblockCoupon)
router.patch('/restore/:couponId',couponsController.restoreCoupon)
router.delete('/:couponId',couponsController.deleteCoupon)

export default router