const express = require('express');
const router = express.Router()


const { 
    create, 
    productById, 
    read, 
    remove, 
    update, 
    list,
    listRelated,
    listCategories,
    listBySearch,
    photo,
    listSearch
} = require('../controllers/product');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');



router.get('/product/:productId',read);
router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create);
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update)


router.get('/products',list);
router.get("/products/search", listSearch);
//based on the productId the product that we get in req
//based on that we will fetch the related product
router.get('/products/related/:productId', listRelated)
router.get('/products/categories', listCategories)
// route - make sure its post
router.post("/products/by/search", listBySearch);
router.get('/product/photo/:productId', photo);



router.param("userId", userById);
router.param("productId", productById);


module.exports = router;