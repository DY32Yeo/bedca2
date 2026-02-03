const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const challengeRoutes = require('./challengeRoutes');
const completionRoutes = require('./completionRoutes');
const petRoutes = require('./petRoutes');
const userpetRoutes = require('./userpetRoutes');
const levelRoutes = require('./levelRoutes')


// encryption / middleware
const userController = require('../controllers/userController');
const bcryptMiddleware = require('../middlewares/bcryptMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


router.use("/users", userRoutes);
router.use("/challenges", challengeRoutes);
router.use("/completion", completionRoutes);
router.use("/pet", petRoutes);
router.use("/userpet", userpetRoutes);
router.use("/level", levelRoutes);



router.post("/login", userController.login, 
    bcryptMiddleware.comparePassword, 
    jwtMiddleware.generateToken, 
    jwtMiddleware.sendToken);

router.post("/register", userController.checkUsernameOrEmailExist, 
    bcryptMiddleware.hashPassword, 
    userController.register, 
    jwtMiddleware.generateToken, 
    jwtMiddleware.sendToken);


module.exports = router;