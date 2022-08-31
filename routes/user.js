const express = require('express');
const router = express.Router()

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { userById, read, update } = require('../controllers/user');

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req,res) => {
    res.json({
        user: req.profile
    });
});

//for user to look at their profile
router.get('/user/:userId', requireSignin, isAuth, read)
//for users to update their profile
router.put('/user/:userId', requireSignin, isAuth, update)

router.param('userId', userById)


module.exports = router;