const express = require('express');
const raidController = require('../controllers/raidControllers');
const router = express.Router();

router.use(raidController.validateRaid);

router.route('/raid').get(raidController.fetchRaid);
router
  .route('/reserve')
  .post(raidController.reserveItem)
  .delete(raidController.deleteItem);
router.route('/bonus').patch(raidController.patchBonus);

module.exports = router;
