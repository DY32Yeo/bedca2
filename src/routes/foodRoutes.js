const express = require('express');
const router = express.Router();

const foodController = require('../controllers/foodController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/', foodController.readAllFood);


module.exports = router;