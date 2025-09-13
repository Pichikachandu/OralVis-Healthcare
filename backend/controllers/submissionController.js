const Submission = require('../models/Submission');
const { uploadToS3 } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const axios = require('axios');

const issues = [
  { name: 'Inflamed / Red gums', color: '#800080', recommendation: 'Scaling.' },
  { name: 'Malaligned', color: '#FFFF00', recommendation: 'Braces or Clear Aligner.' },
  { name: 'Receded gums', color: '#A52A2A', recommendation: 'Gum Surgery.' },
  { name: 'Stains', color: '#FF0000', recommendation: 'Teeth cleaning and polishing.' },
  { name: 'Attrition', color: '#00FFFF', recommendation: 'Filling/Night Guard.' },
  { name: 'Crowns', color: '#FF00FF', recommendation: 'If the crown is loose or broken, better get it checked. Tooth coloured caps are the best ones.' },
];

const colors = {
  header: '#800080',
  headerText: '#FFFFFF',
  screeningBg: '#E8F0FE',
  labelBg: '#EF5350',
  labelText: '#FFFFFF',
  legendBg: '#FFF3E0',
  text: '#000000',
  subtitle: '#000000',
};

const getBufferFromUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxRedirects: 5,
    });
    return Buffer.from(response.data);
  } catch (err) {
    console.error(`Failed to fetch buffer from ${url}:`, {
      message: err.message,
      code: err.code,
      response: err.response?.status,
    });
    throw err;
  }
};

// Shared PDF generation function
const generatePDFContent = async (doc, submission, usedColors) => {
  // Header
  doc.rect(0, 0, doc.page.width, 80).fill(colors.header);
  doc.fillColor(colors.headerText)
     .fontSize(24)
     .text('Oral Health Screening Report', 0, 25, { align: 'center', width: doc.page.width });

  // Patient info
  let y = 100;
  doc.fillColor(colors.text)
     .fontSize(12)
     .text(`Name: ${submission.name}`, 50, y);
  doc.text(`Phone: ${submission.phone || 'N/A'}`, 200, y);
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}`, 400, y);
  y += 30;

  // Screening report title
  doc.fontSize(14).text('SCREENING REPORT:', 50, y);
  y += 20;

  // Screening box
  const boxX = 50;
  const boxW = doc.page.width - 100;
  const boxH = 220; // Adjusted for images and labels
  doc.roundedRect(boxX, y, boxW, boxH, 10).fill(colors.screeningBg);

  // Images
  const imgWidth = (boxW - 40) / 3;
  const imgHeight = 150;
  const imgY = y + 20;
  const left = boxX + 10;
  const mid = left + imgWidth + 10;
  const right = mid + imgWidth + 10;

  const imagePositions = [
    { url: submission.upperAnnotatedUrl, x: left, label: 'Upper Teeth' },
    { url: submission.frontAnnotatedUrl, x: mid, label: 'Front Teeth' },
    { url: submission.lowerAnnotatedUrl, x: right, label: 'Lower Teeth' },
  ];

  for (const { url, x, label } of imagePositions) {
    if (!url) {
      console.warn(`Skipping ${label} image: No URL provided`);
      continue;
    }
    try {
      const buffer = await getBufferFromUrl(url);
      doc.image(buffer, x, imgY, { width: imgWidth, align: 'center' });
    } catch (err) {
      console.error(`Failed to add ${label} image:`, err);
      throw new Error(`Failed to add ${label} image to PDF`);
    }
  }

  // Image labels
  const labelY = imgY + imgHeight + 10;
  const labelH = 25;
  const labelR = 10;
  for (const { x, label } of imagePositions) {
    doc.roundedRect(x, labelY, imgWidth, labelH, labelR).fill(colors.labelBg);
    doc.fillColor(colors.labelText)
       .fontSize(12)
       .text(label, x, labelY + 5, { align: 'center', width: imgWidth });
  }

  y += boxH + 30;

  // Legend
  const legendH = 40;
  doc.roundedRect(50, y, boxW, legendH, 10).fill(colors.legendBg);

  let currentX = 60;
  const legendY = y + 15;
  const usedIssues = issues.filter(issue => usedColors.has(issue.color.toUpperCase()));
  usedIssues.forEach((issue) => {
    doc.fillColor(issue.color).text(issue.name, currentX, legendY);
    currentX += doc.widthOfString(issue.name) + 15;
  });

  y += legendH + 40;

  // Treatment Recommendations
  doc.fontSize(16).fillColor(colors.subtitle).text('Treatment Recommendations:', 50, y);
  y += 25;
  doc.fontSize(12).fillColor(colors.text);
  usedIssues.forEach((issue) => {
    const recText = `${issue.name} : ${issue.recommendation}`;
    doc.fillColor(issue.color).rect(50, y + 1, 10, 10).fill();
    doc.fillColor(colors.text);
    doc.text(recText, 65, y, { width: doc.page.width - 115 });
    y += doc.heightOfString(recText, { width: doc.page.width - 115 }) + 10;
  });
};

const createSubmission = async (req, res) => {
  const { name, patientID, email, phone, note } = req.body;
  const files = req.files;

  if (!name || !patientID || !email) {
    return res.status(400).json({ msg: 'Name, patientID, and email are required' });
  }

  if (!files || !files.upper || !files.front || !files.lower) {
    return res.status(400).json({ msg: 'All three images (upper, front, lower) are required' });
  }

  if (!files.upper[0]?.buffer || !files.front[0]?.buffer || !files.lower[0]?.buffer) {
    return res.status(400).json({ msg: 'Invalid file data: missing buffer' });
  }

  try {
    const upperKey = `images/original/${uuidv4()}.png`;
    const frontKey = `images/original/${uuidv4()}.png`;
    const lowerKey = `images/original/${uuidv4()}.png`;

    const [upperUrl, frontUrl, lowerUrl] = await Promise.all([
      uploadToS3(files.upper[0].buffer, upperKey, 'image/png'),
      uploadToS3(files.front[0].buffer, frontKey, 'image/png'),
      uploadToS3(files.lower[0].buffer, lowerKey, 'image/png'),
    ]);

    const submission = new Submission({
      userId: req.user.id,
      name,
      patientID,
      email,
      phone,
      note,
      originalUpperUrl: upperUrl,
      originalFrontUrl: frontUrl,
      originalLowerUrl: lowerUrl,
      status: 'uploaded',
    });

    await submission.save();
    console.log('Submission saved successfully:', { id: submission._id, email, patientID });
    res.status(201).json(submission);
  } catch (err) {
    console.error('Create submission error:', {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    res.status(500).json({ msg: `Failed to create submission: ${err.message}` });
  }
};

const getOwnSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id });
    res.json(submissions);
  } catch (err) {
    console.error('Get own submissions error:', { message: err.message });
    res.status(500).json({ msg: `Failed to fetch submissions: ${err.message}` });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.json(submissions);
  } catch (err) {
    console.error('Get all submissions error:', { message: err.message });
    res.status(500).json({ msg: `Failed to fetch submissions: ${err.message}` });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    if (req.user.role !== 'admin' && submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    res.json(submission);
  } catch (err) {
    console.error('Get submission by ID error:', { message: err.message });
    res.status(500).json({ msg: `Failed to fetch submission: ${err.message}` });
  }
};

const saveAnnotations = async (req, res) => {
  try {
    const { upperAnnotations, frontAnnotations, lowerAnnotations, upperBase64, frontBase64, lowerBase64 } = req.body;

    console.log('Received annotations payload:', {
      id: req.params.id,
      hasUpper: !!upperAnnotations?.objects?.length,
      hasFront: !!frontAnnotations?.objects?.length,
      hasLower: !!lowerAnnotations?.objects?.length,
      upperBase64: upperBase64 ? `${upperBase64.slice(0, 30)}... (${upperBase64.length} chars)` : null,
      frontBase64: frontBase64 ? `${frontBase64.slice(0, 30)}... (${frontBase64.length} chars)` : null,
      lowerBase64: lowerBase64 ? `${lowerBase64.slice(0, 30)}... (${lowerBase64.length} chars)` : null,
    });

    // Validate at least one annotation
    if (!upperAnnotations?.objects?.length && !frontAnnotations?.objects?.length && !lowerAnnotations?.objects?.length) {
      return res.status(400).json({ msg: 'At least one annotation is required' });
    }

    // Validate base64 data size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    const validateBase64 = (base64) => {
      if (!base64) return null;
      const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      if (buffer.length > maxSize) {
        throw new Error('Base64 image exceeds 5MB limit');
      }
      return buffer;
    };

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    if (req.user.role !== 'admin' && submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Upload annotated images to S3
    const uploads = [];
    if (upperBase64) {
      const upperKey = `images/annotated/${uuidv4()}.jpg`;
      uploads.push(uploadToS3(validateBase64(upperBase64), upperKey, 'image/jpeg')
        .then(url => submission.upperAnnotatedUrl = url));
    }
    if (frontBase64) {
      const frontKey = `images/annotated/${uuidv4()}.jpg`;
      uploads.push(uploadToS3(validateBase64(frontBase64), frontKey, 'image/jpeg')
        .then(url => submission.frontAnnotatedUrl = url));
    }
    if (lowerBase64) {
      const lowerKey = `images/annotated/${uuidv4()}.jpg`;
      uploads.push(uploadToS3(validateBase64(lowerBase64), lowerKey, 'image/jpeg')
        .then(url => submission.lowerAnnotatedUrl = url));
    }

    await Promise.all(uploads);

    // Update annotations and status
    submission.upperAnnotations = upperAnnotations || null;
    submission.frontAnnotations = frontAnnotations || null;
    submission.lowerAnnotations = lowerAnnotations || null;
    submission.status = 'annotated';
    await submission.save();

    console.log('Annotations saved successfully:', {
      id: submission._id,
      upperUrl: submission.upperAnnotatedUrl,
      frontUrl: submission.frontAnnotatedUrl,
      lowerUrl: submission.lowerAnnotatedUrl,
    });

    // Check unique issue types
    const usedColors = new Set();
    [submission.upperAnnotations, submission.frontAnnotations, submission.lowerAnnotations].forEach(json => {
      if (json?.objects) {
        json.objects.forEach(obj => {
          if (obj.stroke) usedColors.add(obj.stroke.toUpperCase());
        });
      }
    });

    if (usedColors.size < 2) {
      return res.json({
        ...submission.toObject(),
        pdfStatus: 'requires_more_annotations',
        requiredAnnotations: Math.max(0, 2 - usedColors.size)
      });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfKey = `reports/${uuidv4()}.pdf`;
      const reportUrl = await uploadToS3(pdfBuffer, pdfKey, 'application/pdf');

      submission.reportUrl = reportUrl;
      submission.status = 'reported';
      await submission.save();

      console.log('PDF generated and saved:', { id: submission._id, reportUrl });
      res.json({ ...submission.toObject(), pdfStatus: 'completed' });
    });

    try {
      await generatePDFContent(doc, submission, usedColors);
      doc.end();
    } catch (pdfErr) {
      console.error('Error generating PDF:', pdfErr);
      res.status(500).json({ msg: `Failed to generate PDF: ${pdfErr.message}` });
    }
  } catch (err) {
    console.error('Save annotations error:', {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    res.status(500).json({ msg: `Failed to save annotations: ${err.message}` });
  }
};

const generatePDF = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    if (req.user.role !== 'admin' && submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Count unique issue types
    const usedColors = new Set();
    [submission.upperAnnotations, submission.frontAnnotations, submission.lowerAnnotations].forEach(json => {
      if (json?.objects) {
        json.objects.forEach(obj => {
          if (obj.stroke) usedColors.add(obj.stroke.toUpperCase());
        });
      }
    });

    if (usedColors.size < 2) {
      return res.status(400).json({ msg: 'At least two different issue types are required for PDF generation' });
    }

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfKey = `reports/${uuidv4()}.pdf`;
      const reportUrl = await uploadToS3(pdfBuffer, pdfKey, 'application/pdf');

      submission.reportUrl = reportUrl;
      submission.status = 'reported';
      await submission.save();

      console.log('PDF generated and saved:', { id: submission._id, reportUrl });
      res.json({ reportUrl });
    });

    try {
      await generatePDFContent(doc, submission, usedColors);
      doc.end();
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
      return res.status(500).json({ msg: `Failed to generate PDF: ${pdfErr.message}` });
    }
  } catch (err) {
    console.error('PDF generation error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
    });
    res.status(500).json({ msg: `Failed to generate PDF: ${err.message}` });
  }
};

module.exports = {
  createSubmission,
  getOwnSubmissions,
  getAllSubmissions,
  getSubmissionById,
  saveAnnotations,
  generatePDF,
};