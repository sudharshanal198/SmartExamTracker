const Subject = require('../models/Subject');

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id }).sort({ examDate: 1 });
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addSubject = async (req, res) => {
  try {
    const { name, examDate, priority } = req.body;

    const newSubject = new Subject({
      name,
      examDate,
      priority,
      user: req.user.id,
      topics: []
    });

    const subject = await newSubject.save();
    res.json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await subject.deleteOne();
    res.json({ message: 'Subject removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Subject not found' });
    res.status(500).send('Server error');
  }
};

exports.addTopic = async (req, res) => {
  try {
    const { subjectId, name, unit } = req.body;
    
    let subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    subject.topics.push({ name, isCompleted: false, unit: unit || 'General' });
    await subject.save();
    
    res.json(subject); // Return updated subject
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.toggleTopic = async (req, res) => {
  try {
    const { subjectId, topicId } = req.body;
    
    let subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const topic = subject.topics.id(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.isCompleted = !topic.isCompleted;
    await subject.save();
    
    res.json(subject); // Return updated subject
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { subjectId, topicId } = req.body;
    
    let subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    subject.topics.pull({ _id: topicId });
    await subject.save();
    
    res.json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
