const StudyTask = require('../models/StudyTask');

const getStudyTasks = async (req, res) => {
  try {
    const tasks = await StudyTask.find({ user: req.user._id }).populate('course', 'name code color');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStudyTask = async (req, res) => {
  try {
    const { course, title, description, date, durationMinutes, isCompleted } = req.body;
    const task = await StudyTask.create({
      user: req.user._id,
      course,
      title,
      description,
      date,
      durationMinutes,
      isCompleted,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStudyTask = async (req, res) => {
  try {
    const task = await StudyTask.findById(req.params.id);

    if (task && task.user.toString() === req.user._id.toString()) {
      task.course = req.body.course || task.course;
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.date = req.body.date || task.date;
      task.durationMinutes = req.body.durationMinutes || task.durationMinutes;
      if (req.body.isCompleted !== undefined) {
        task.isCompleted = req.body.isCompleted;
      }

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Study task not found or unauthorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudyTask = async (req, res) => {
  try {
    const task = await StudyTask.findById(req.params.id);

    if (task && task.user.toString() === req.user._id.toString()) {
      await task.deleteOne();
      res.json({ message: 'Study task removed' });
    } else {
      res.status(404).json({ message: 'Study task not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudyTasks, createStudyTask, updateStudyTask, deleteStudyTask };
