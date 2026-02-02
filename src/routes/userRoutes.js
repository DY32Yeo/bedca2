const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/', userController.checkAllUser, userController.createNewUser);

// Only logged in user can see other users
router.get('/', 
    jwtMiddleware.verifyToken,
    userController.readAllUser
);

// 7. gamification crud
// user can view the leaderboard which is ranked by the highest level_id which is 5 follow by the experience
router.get('/leaderboard', userController.getLeaderboard);

// only logged in user can view their own profile
router.get('/:user_id', 
    jwtMiddleware.verifyToken,
    userController.readUserById
);

// logged in user can update their username
router.put('/:user_id', 
    jwtMiddleware.verifyToken,
    userController.checkAllUser, 
    userController.updateUserById
);



module.exports = router;