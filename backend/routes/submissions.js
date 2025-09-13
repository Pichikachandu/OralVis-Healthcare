const express = require('express');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createSubmission,
  getOwnSubmissions,
  getAllSubmissions,
  getSubmissionById,
  saveAnnotations,
  generatePDF,
} = require('../controllers/submissionController');

const router = express.Router();

router.post('/', protect, upload, createSubmission);
router.get('/own', protect, getOwnSubmissions);
router.get('/', protect, admin, getAllSubmissions);
router.get('/:id', protect, getSubmissionById);
router.put('/:id/annotate', protect, admin, saveAnnotations);
router.post('/:id/generate-pdf', protect, admin, generatePDF);

module.exports = router;