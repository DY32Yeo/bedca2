const express = require('express');
const router = express.Router();

const petController = require('../controllers/petController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// 1. Let users view all available pets to adopt

router.get('/', petController.readAllPet);

// 2. user can delete the pet from their userpet_id
router.delete('/:userpet_id', 
    jwtMiddleware.verifyToken, 
    petController.deleteUserPetById
);

module.exports = router;