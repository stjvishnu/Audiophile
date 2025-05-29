import express from "express"
import adminAuthRoutes from "./adminAuthRoutes.js"
import dashboardrouter from "./dashboardRoutes.js";
import adminLoadRouter from "./adminLoadRouter.js";
import usersRouter from "./userRouter.js"
import categoryRouter  from "./categoryRoutes.js";
import subCategoryRouter  from "./subCategoryRouter.js";
import productRouter from "./productRoutes.js"

const router = express.Router();


router.use('/auth',adminAuthRoutes)
router.use('/dashboard',dashboardrouter)
router.use('/',adminLoadRouter)

//testing route

router.use('/users',usersRouter) //list users
router.use('/category',categoryRouter)
router.use('/subCategory',subCategoryRouter)
router.use('/products',productRouter)




export default router