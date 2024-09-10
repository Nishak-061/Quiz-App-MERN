const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController')
//const authMiddleware = require('../middlewares/authMiddleware'); // Ensure user is authenticated
const authMiddleware = require ('../middleware/authMiddlewarte')

// Route to create a new question
router.post('/create', authMiddleware, questionController.createQuestion);

// Route to edit an existing question
router.put('/edit/:id', authMiddleware, questionController.editQuestion);

// Route to delete a question
router.delete('/delete/:id', authMiddleware, questionController.deleteQuestion);

// Route to get a specific question by ID
router.get('/:id', questionController.getQuestionById);

// Route to get all questions for a specific quiz
router.get('/quiz/:quizId', questionController.getQuestionsByQuizId);

module.exports = router;
