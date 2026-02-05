const express = require('express');
const router = express.Router();


const challengeController = require('../controllers/challengeController');
const completionController = require('../controllers/completionController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/challenges/:challenge_id', 
    jwtMiddleware.verifyToken,
    challengeController.checkChallengeById,  
    completionController.createNewCompletion
);

// router.get('/challenges/:challenge_id', completionController.readAllChallengeById);

router.get('/user', 
    jwtMiddleware.verifyToken,
    completionController.getUserCompletions
);

// router.get('/all', completionController.getAllCompletions)

module.exports = router;