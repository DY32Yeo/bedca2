const express = require('express');
const router = express.Router();

const actionController = require('../controllers/actionController');

// 9.
// Let users view all available action
router.get('/', actionController.readAllAction);



module.exports = router;