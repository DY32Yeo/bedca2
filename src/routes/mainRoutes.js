const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const challengeRoutes = require('./challengeRoutes');
const completionRoutes = require('./completionRoutes');
const petRoutes = require('./petRoutes');
const userpetRoutes = require('./userpetRoutes');
const levelRoutes = require('./levelRoutes')
const actionRoutes = require('./actionRoutes')

router.use("/users", userRoutes);
router.use("/challenges", challengeRoutes);
router.use("/completion", completionRoutes);
router.use("/pet", petRoutes);
router.use("/userpet", userpetRoutes);
router.use("/level", levelRoutes);
router.use("/action", actionRoutes);




module.exports = router;