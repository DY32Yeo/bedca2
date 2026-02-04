const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const userController = require('../controllers/userController');
const foodController = require('../controllers/foodController');
const userpetController = require('../controllers/userpetController');
const petController = require('../controllers/petController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/', 
    jwtMiddleware.verifyToken,
    userController.checkUserById,
    inventoryController.getUserInventory
);

router.post('/buy', 
    jwtMiddleware.verifyToken,
    userController.checkUserById,
    foodController.checkFoodById,
    inventoryController.buyFood
);

router.post('/pet/feed', 
    jwtMiddleware.verifyToken,
    userController.checkUserById,
    petController.checkPetById,
    userpetController.checkPetOwnership, 
    foodController.checkFoodById,
    inventoryController.feedPet
);


module.exports = router;