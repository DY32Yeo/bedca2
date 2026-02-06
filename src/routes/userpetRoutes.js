const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const petController = require('../controllers/petController');
const userpetController = require('../controllers/userpetController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


// // 3. get user's pets
// router.get('/:user_id', 
//     jwtMiddleware.verifyToken, 
//     userpetController.getUserPetById
// );

// 5. user can change their petname 
router.put('/:userpet_id', 
    jwtMiddleware.verifyToken, 
    userpetController.updatePetNameById
);



// 4. user can adopt the pet they want, depends if the user_id, pet_id exist and lastly if they have sufficient points
router.post(
    '/adopt', 
    jwtMiddleware.verifyToken, 
    userController.checkUserById,
    userpetController.checkUserHasPet, 
    petController.checkPetById, 
    userpetController.adoptPet
);


module.exports = router;