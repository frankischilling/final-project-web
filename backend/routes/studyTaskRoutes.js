const express = require('express');
const router = express.Router();
const { getStudyTasks, createStudyTask, updateStudyTask, deleteStudyTask } = require('../controllers/studyTaskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getStudyTasks).post(protect, createStudyTask);
router.route('/:id').put(protect, updateStudyTask).delete(protect, deleteStudyTask);

module.exports = router;
