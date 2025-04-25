// # ________________________________ROUTER FOR RAID QUERIES______________________________________ # //
const express = require('express');
const raidController = require('../controllers/raidControllers');
const router = express.Router();

// Validates raids, returns straigth away if not validates
router.use(raidController.validateRaid);

// Fetches all items for a raid
router.route('/raid').get(raidController.fetchRaid);

// Routes for single items
router
  .route('/reserve')
  .post(raidController.reserveItem) // Reserves one
  .delete(raidController.deleteItem); // Deletes one

// Updates "attendance" for given raid
router.route('/bonus').patch(raidController.patchBonus);

module.exports = router;
