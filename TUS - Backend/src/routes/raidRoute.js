const express = require('express');
const raidController = require('../controllers/raidControllers');
const router = express.Router();

router
  .route('/raid')
  .get(raidController.validateRaid, raidController.fetchRaid);
router
  .route('/reserve')
  .post(raidController.validateRaid, raidController.reserveItem)
  .delete(raidController.validateRaid, raidController.deleteItem);
router
  .route('/bonus')
  .patch(raidController.validateRaid, raidController.patchBonus);

module.exports = router;
