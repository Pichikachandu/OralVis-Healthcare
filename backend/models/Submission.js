const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  patientID: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String }, // Added to match demo report
  note: { type: String },
  originalUpperUrl: { type: String },
  originalFrontUrl: { type: String },
  originalLowerUrl: { type: String },
  annotatedUpperUrl: { type: String },
  annotatedFrontUrl: { type: String },
  annotatedLowerUrl: { type: String },
  upperAnnotations: { type: Object }, // JSON
  frontAnnotations: { type: Object },
  lowerAnnotations: { type: Object },
  reportUrl: { type: String },
  status: { type: String, enum: ['uploaded', 'annotated', 'reported'], default: 'uploaded' },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', submissionSchema);