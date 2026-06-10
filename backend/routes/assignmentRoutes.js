const express = require('express');
const router = express.Router();
const { getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAssignments).post(protect, createAssignment);
router.route('/:id').put(protect, updateAssignment).delete(protect, deleteAssignment);

module.exports = router;
