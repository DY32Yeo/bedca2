const express = require('express');
const router = express.Router();

const levelController = require('../controllers/levelController');

// 8.
// Let users view all available pet level
router.get('/', levelController.readAllLevel);


module.exports = router;