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
  requestResubmission,
  reuploadImages,
  addMessage,
  getDashboardStats,
  getPatientStats,
} = require('../controllers/submissionController');

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/stats/patient', protect, getPatientStats);
router.post('/', protect, upload, createSubmission);
router.get('/own', protect, getOwnSubmissions);
router.get('/', protect, admin, getAllSubmissions);
router.get('/:id', protect, getSubmissionById);
router.put('/:id/annotate', protect, admin, saveAnnotations);
router.post('/:id/generate-pdf', protect, admin, generatePDF);
router.put('/:id/request-resubmission', protect, admin, requestResubmission);
router.put('/:id/reupload-images', protect, upload, reuploadImages);
router.post('/:id/message', protect, addMessage);

module.exports = router;