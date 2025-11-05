import  adminAuthentication from './adminModules/auth.js'
import  dashboardController from './adminModules/dashboard.js'
import  adminSplashController from './adminModules/adminSplash.js'


//testing controllers
import usersController from './adminModules/users.js'
import categoryController from "./adminModules/category.js";
import productController from "./adminModules/products.js"


//Auth controllers

export const getLoadAdmin = adminAuthentication.getLoadAdmin;
export const getAdminLogin = adminAuthentication.getAdminLogin;
export const postAdminLogin = adminAuthentication.postAdminLogin;
export const getAdminLogout = adminAuthentication.getAdminLogout;


export const getAdminDasboard = dashboardController.getAdminDasboard;

export const getAdminSplash = adminSplashController.getAdminSplash;


// testing controllers

export const getUsers = usersController.getUsers;
export const blockUsers = usersController.blockUsers;
export const searchUsers = usersController.searchUsers;
//testing controllers

export const addCategory = categoryController.addCategory;
export const editCategory =categoryController.editCategory;
export const deleteCategory = categoryController.deleteCategory;
export const blockCategory = categoryController.blockCategory;
export const unblockCategory = categoryController.unblockCategory;
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