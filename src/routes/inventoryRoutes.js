const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const userController = require('../controllers/userController');
const foodController = require('../controllers/foodController');
const userpetController = require('../controllers/userpetController');
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

router.post('/pet/:userpet_id/feed', 
    jwtMiddleware.verifyToken,
    userController.checkUserById,
    userpetController.checkUserPetById, 
    foodController.checkFoodById,
    inventoryController.feedPet
);

module.exports = router;