const Assignment = require('../models/Assignment');

const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id }).populate('course', 'name code color');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { course, title, description, dueDate, status, priority } = req.body;
    const assignment = await Assignment.create({
      user: req.user._id,
      course,
      title,
      description,
      dueDate,
      status,
      priority,
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (assignment && assignment.user.toString() === req.user._id.toString()) {
      assignment.course = req.body.course || assignment.course;
      assignment.title = req.body.title || assignment.title;
      assignment.description = req.body.description || assignment.description;
      assignment.dueDate = req.body.dueDate || assignment.dueDate;
      assignment.status = req.body.status || assignment.status;
      assignment.priority = req.body.priority || assignment.priority;

      const updatedAssignment = await assignment.save();
      res.json(updatedAssignment);
    } else {
      res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (assignment && assignment.user.toString() === req.user._id.toString()) {
      await assignment.deleteOne();
      res.json({ message: 'Assignment removed' });
    } else {
      res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssignments, createAssignment, updateAssignment, deleteAssignment };
