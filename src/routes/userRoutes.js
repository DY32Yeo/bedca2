const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');


router.post('/', userController.checkAllUser, userController.createNewUser);
router.get('/', userController.readAllUser);

// 7. gamification crud
// user can view the leaderboard which is ranked by the highest level_id which is 5 follow by the experience
router.get('/leaderboard', userController.getLeaderboard);

router.get('/:user_id', userController.readUserById);
router.put('/:user_id', userController.checkAllUser, userController.updateUserById);



module.exports = router;