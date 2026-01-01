import express from "express"
import adminAuthRoutes from "./adminAuthRoutes.js"
import dashboardrouter from "./dashboardRoutes.js";
import adminLoadRouter from "./adminLoadRouter.js";
import usersRouter from "./userRouter.js"
import categoryRouter  from "./categoryRoutes.js";
import productRouter from "./productRoutes.js";
import ordersRouter from "./ordersRoutes.js";
import offersRouter from "./offersRoutes.js";
import couponsRouter from "./couponsRoutes.js";
import salesReportRouter from './salesReportRoutes.js'


import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();


router.use('/auth',adminAuthRoutes)
router.use('/dashboard',adminMiddleware.restrictedAdminLogin,dashboardrouter)
router.use('/',adminLoadRouter)


router.use('/users',adminMiddleware.restrictedAdminLogin,usersRouter) //list users
router.use('/category',adminMiddleware.restrictedAdminLogin,categoryRouter)
router.use('/products',adminMiddleware.restrictedAdminLogin,productRouter)
router.use('/orders',adminMiddleware.restrictedAdminLogin,ordersRouter)
router.use('/offers',adminMiddleware.restrictedAdminLogin,offersRouter)
router.use('/coupons',adminMiddleware.restrictedAdminLogin,couponsRouter)
router.use('/sales-report',adminMiddleware.restrictedAdminLogin,salesReportRouter)





export default router