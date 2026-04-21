const User = require('../models/User');
const Subject = require('../models/Subject');

exports.getStudents = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    const subjects = await Subject.find();
    
    const studentData = users.map(user => {
      const userSubjects = subjects.filter(sub => sub.user.toString() === user._id.toString());
      
      const mappedSubjects = userSubjects.map(sub => {
        const totalTopics = sub.topics.length;
        const completed = sub.topics.filter(t => t.isCompleted).length;
        const progress = totalTopics === 0 ? 0 : Math.round((completed / totalTopics) * 100);
        
        let lastStudied = user.lastActiveDate; // Default to user's last active if no topics
        // Or if you want a simplistic approach, use examDate or Date.now() minus something
        
        return {
          id: sub._id,
          name: sub.name,
          progress,
          lastStudied: lastStudied
        };
      });

      return {
        _id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        streak: user.streak,
        lastActiveDate: user.lastActiveDate,
        subjects: mappedSubjects
      };
    });

    res.json(studentData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getGlobalStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const allSubjects = await Subject.find();
    
    let totalTopics = 0;
    let completedTopics = 0;

    allSubjects.forEach(subject => {
      totalTopics += subject.topics.length;
      subject.topics.forEach(topic => {
        if (topic.isCompleted) completedTopics++;
      });
    });

    res.json({
      userCount,
      subjectCount,
      totalTopics,
      completedTopics
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
