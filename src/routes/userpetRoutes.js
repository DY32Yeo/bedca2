const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const petController = require('../controllers/petController');
const userpetController = require('../controllers/userpetController');
const actionController = require('../controllers/actionController');
const levelController = require('../controllers/levelController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


// 6. user can choose to either feed their pet or train their pet by using their userpet_id, user_id and also providing the action_id 
// which then allow the user to gain xp for their pet or decrease pet hunger
router.post(
    "/:userpet_id/action", 
    jwtMiddleware.verifyToken, 
    userpetController.checkUserPetById, 
    userController.checkUserById,
    actionController.checkActionById, 
    userpetController.performPetAction,
    levelController.levelUpPet
);

// 3.
router.get('/:user_id', userpetController.getUserPetById);

// 5. user can change their petname by using their userpet_id and user_id
router.put('/:userpet_id', userpetController.updatePetNameById);



// 4. user can adopt the pet they want, depends if the user_id, pet_id exist and lastly if they have sufficient points
router.post(
    '/adopt', 
    userController.checkUserById, 
    petController.checkPetById, 
    userpetController.adoptPet
);


module.exports = router;