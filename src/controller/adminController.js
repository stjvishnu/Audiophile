import  adminAuthentication from './adminModules/auth.js'
import  dashboardController from './adminModules/dashboard.js'
import  adminSplashController from './adminModules/adminSplash.js'

import usersController from './adminModules/users.js'
import categoryController from "./adminModules/category.js";
import productController from "./adminModules/products.js";
import ordersController from "./adminModules/orders.js";
import offersController from "./adminModules/offers.js";
import couponsController from "./adminModules/coupons.js";
import salesReportController from './adminModules/sales-report.js'




//Auth controllers

export const getLoadAdmin = adminAuthentication.getLoadAdmin;
export const getAdminLogin = adminAuthentication.getAdminLogin;
export const postAdminLogin = adminAuthentication.postAdminLogin;
export const getAdminLogout = adminAuthentication.getAdminLogout;


export const getAdminDasboard = dashboardController.getAdminDasboard;
export const getSalesChart = dashboardController.getSalesChart;

export const getAdminSplash = adminSplashController.getAdminSplash;


// user controllers

export const getUsers = usersController.getUsers;
export const blockUsers = usersController.blockUsers;
export const searchUsers = usersController.searchUsers;
export const loadUsers = usersController.loadUsers;
//testing controllers

export const addCategory = categoryController.addCategory;
export const editCategory =categoryController.editCategory;
export const deleteCategory = categoryController.deleteCategory;
export const blockCategory = categoryController.blockCategory;
export const unblockCategory = categoryController.unblockCategory;
export const loadCategories = categoryController.loadCategories;
// export const addSubCategory = subcategoryController.addSubCategory

//products Controller

export const getProducts = productController.getProducts;
export const getSingleProduct = productController.getSingleProduct;
export const addProducts = productController.addProducts;
export const editProducts = productController.editProducts;
export const deleteProducts = productController.deleteProducts;
export const restoreProducts = productController.restoreProducts;
export const softDeleteProducts = productController.softDeleteProducts;
export const restoreSoftDeleteProducts = productController.restoreSoftDeleteProducts
export const blockProducts = productController.blockProducts;
export const unblockProducts = productController.unblockProducts;
export const getCategory = productController.getCategory;
export const searchProducts = productController.searchProducts;
export const loadProducts = productController.loadProducts;

//orders Controller

export const getOrders = ordersController.getOrders;
export const getOrderDetails = ordersController.getOrderDetails;
export const returnItem = ordersController.returnItem;
export const returnWholeItem = ordersController.returnWholeItem;
export const searchOrders = ordersController.searchOrders;
export const loadOrders = ordersController.loadOrders;
export const filterOrders = ordersController.filterOrders;

//offers Controller

export const getOffers = offersController.getOffers;
export const getTargets = offersController.getTargets
export const searchOffers = offersController.searchOffers
export const loadOffers = offersController.loadOffers
export const filterOffers = offersController.filterOffers

//coupons Controller

export const getCoupons = couponsController.getCoupons;
export const addCoupon = couponsController.addCoupon;
export const editCoupon = couponsController.editCoupon;
export const blockCoupon = couponsController.blockCoupon;
export const unblockCoupon = couponsController.unblockCoupon;
export const deleteCoupon = couponsController.deleteCoupon;
export const restoreCoupon = couponsController.restoreCoupon;
export const searchCoupons = couponsController.searchCoupons;
export const loadCoupons = couponsController.loadCoupons;

//Sales Report controller

export const salesReportRouter = salesReportController.getSalesReport;
export const paginatedgetCustomSalesReport = salesReportController.paginatedgetCustomSalesReport;
export const downloadSalesReportPdf = salesReportController.downloadSalesReportPdf