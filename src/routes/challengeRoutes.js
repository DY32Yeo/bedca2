const express = require('express');
const router = express.Router();

const challengeController = require('../controllers/challengeController');


router.post('/', challengeController.createNewChallenge);
router.get('/', challengeController.readAllChallenge);

router.delete('/:challenge_id', challengeController.deleteChallengeById);
router.put('/:challenge_id', challengeController.updateChallengeById);


module.exports = router;