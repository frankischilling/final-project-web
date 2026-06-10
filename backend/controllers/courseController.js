const Course = require('../models/Course');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user._id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { name, code, instructor, term, color } = req.body;
    const course = await Course.create({
      user: req.user._id,
      name,
      code,
      instructor,
      term,
      color,
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course && course.user.toString() === req.user._id.toString()) {
      course.name = req.body.name || course.name;
      course.code = req.body.code || course.code;
      course.instructor = req.body.instructor || course.instructor;
      course.term = req.body.term || course.term;
      course.color = req.body.color || course.color;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found or unauthorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course && course.user.toString() === req.user._id.toString()) {
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
