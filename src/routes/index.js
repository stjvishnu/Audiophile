import express from "express"
import adminIndex from "./admin/adminIndex.js"
import userIndex from "./user/userIndex.js"
import homeRouter  from "./user/homeRouter.js";

const router = express.Router();

router.use('/user',userIndex)
router.use('/admin',adminIndex)
router.use('/',homeRouter)

export default router
