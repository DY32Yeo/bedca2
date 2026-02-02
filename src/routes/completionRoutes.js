const express = require('express');
const router = express.Router();


const userController = require('../controllers/userController');
const challengeController = require('../controllers/challengeController');
const completionController = require('../controllers/completionController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/challenges/:challenge_id', 
    jwtMiddleware.verifyToken,
    challengeController.checkChallengeById, 
    userController.checkUserById, 
    completionController.createNewCompletion
);

router.get('/challenges/:challenge_id', completionController.readAllChallengeById);

module.exports = router;