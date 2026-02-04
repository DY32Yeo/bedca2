const express = require('express');
const router = express.Router();

const challengeController = require('../controllers/challengeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/', challengeController.readAllChallenge);

router.get('/:challenge_id', challengeController.checkChallengeById);

router.post('/',
  jwtMiddleware.verifyToken,
  challengeController.createNewChallenge
);

router.delete('/:challenge_id', 
    jwtMiddleware.verifyToken,
    challengeController.deleteChallengeById
);

router.put('/:challenge_id', 
    jwtMiddleware.verifyToken,
    challengeController.updateChallengeById
);


module.exports = router;