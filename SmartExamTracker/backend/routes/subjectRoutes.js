const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const subjectController = require('../controllers/subjectController');

// All routes require auth
router.use(auth);

router.route('/')
  .get(subjectController.getSubjects)
  .post(subjectController.addSubject);

router.delete('/:id', subjectController.deleteSubject);

router.post('/topic', subjectController.addTopic);
router.put('/topic/toggle', subjectController.toggleTopic);
router.delete('/topic', subjectController.deleteTopic);

module.exports = router;
