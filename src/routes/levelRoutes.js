const express = require('express');
const router = express.Router();

const levelController = require('../controllers/levelController');
const userController = require('../controllers/userController');
const userpetController = require('../controllers/userpetController');
const petController = require('../controllers/petController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// 8.
// Let users view all available pet level
router.get('/', levelController.readAllLevel);

router.post('/pet/levelup', 
    jwtMiddleware.verifyToken,
    userController.checkUserById,
    petController.checkPetById,
    userpetController.checkPetOwnership, 
    levelController.levelUpPet
)


module.exports = router;