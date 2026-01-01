    

import express from 'express'
import offersController from "../../controller/adminModules/offers.js";
const router = express.Router();

router.get('/', offersController.getOffers)
router.post('/', offersController.addOffer)
router.put('/:editId', offersController.editOffer)
router.patch('/block/:offerId', offersController.blockOffer)
router.patch('/unblock/:offerId', offersController.unblockOffer)
router.patch('/restore/:offerId', offersController.restoreOffer)
router.delete('/:offerId', offersController.deleteOffer)
router.get('/loadTargets',offersController.getTargets)


export default router