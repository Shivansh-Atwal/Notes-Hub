import express from 'express';
import PYQ from '../models/pyq.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import auth from '../middleware/auth.js';
import Subject from '../models/subject.js';
import Trade from '../models/trade.js';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import User from '../models/users.js';

const router = express.Router();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG and JPEG files are allowed'));
    }
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


router.get('/', auth, async (req, res) => {
  if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Only students or admins can access PYQs.' });
  }
  const { trade, subject, semester } = req.query;
  const filter = {};
  if (trade) filter.trade = trade;
  if (subject) filter.subject = subject;
  if (semester) filter.semester = semester;
  try {
    const pyqs = await PYQ.find(filter)
      .populate({ path: 'trade', select: 'tradeCode tradeName' })
      .populate({ path: 'subject', select: 'code name' });
    res.json(pyqs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/upload',
  auth,
  upload.single('file'),
  [
    body('title').isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters.'),
    body('trade').notEmpty().withMessage('Trade is required.'),
    body('subject').notEmpty().withMessage('Subject is required.'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Only students or admins can upload PYQs.' });
      }

      const { title, trade, subject, semester, year } = req.body;
      if (!req.file) return res.status(400).json({ error: 'File is required.' });

      const streamUpload = (file, mimetype) => {
        return new Promise((resolve, reject) => {
          const resourceType = mimetype === 'application/pdf' ? 'raw' : 'auto';
          const originalName = file.originalname;
          const publicId = `pyqs/${originalName.substring(0, originalName.lastIndexOf('.'))}`;
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              resource_type: resourceType,
              overwrite: true,
              format: originalName.split('.').pop()
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file, req.file.mimetype);

      const fileType = req.file.mimetype === 'application/pdf'
        ? 'pdf'
        : req.file.mimetype === 'image/png'
          ? 'png'
          : 'jpeg';

      const pyq = new PYQ({
        title,
        trade,
        subject,
        semester,
        year,
        fileUrl: result.secure_url,
        fileType: fileType,
        uploadedBy: req.user._id
      });

      await pyq.save();

      // Send email notification to admins
      const user = req.user;
      const name = user.username;
      const rollno = user.email.split('@')[0];
      const adminUsers = await User.find({ role: 'admin' });
      const adminEmails = adminUsers.map(u => u.email);
      const adminMsg = `PYQ Document uploaded by: ${name} (Roll No: ${rollno})`;

      if (adminEmails.length > 0) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: adminEmails,
          subject: 'New PYQ Document Uploaded',
          text: adminMsg
        });
      }

      res.status(201).json({
        pyq,
        message: adminMsg
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Server error' });
    }
  }
);


router.get('/preview/:id', auth, async (req, res) => {
  if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Only students or admins can preview PYQs.' });
  }

  try {
    const pyq = await PYQ.findById(req.params.id)
      .populate({ path: 'subject', select: 'code name' })
      .populate({ path: 'trade', select: 'tradeCode tradeName' });

    if (!pyq) {
      return res.status(404).json({ error: 'PYQ not found' });
    }

    // Extract public_id and version from fileUrl
    const urlParts = pyq.fileUrl.split('/');
    const fullFileName = urlParts[urlParts.length - 1];
    const version = urlParts[urlParts.length - 2];
    
    const fileExtension = fullFileName.split('.').pop();
    const publicId = `pyqs/${fullFileName}`;

    const options = {
      secure: true,
      resource_type: pyq.fileType === 'pdf' ? 'raw' : 'image',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + (60 * 60),
      version: version.replace('v', ''),
      format: fileExtension
    };

    const secureUrl = cloudinary.url(publicId, options);

    return res.json({
      type: pyq.fileType,
      url: secureUrl,
      title: pyq.title
    });

  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ error: 'Server error generating preview URL' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete PYQs.' });
  }
  const { adminCode } = req.body;
  const validCode = process.env.ADMIN_DELETE_CODE || 'admin123';
  if (adminCode !== validCode) {
    return res.status(401).json({ error: 'Invalid admin verification code.' });
  }
  try {
    const pyq = await PYQ.findByIdAndDelete(req.params.id);
    if (!pyq) return res.status(404).json({ error: 'PYQ not found.' });
    
    if (pyq.fileUrl) {
      const urlParts = pyq.fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = 'pyqs/' + fileName.substring(0, fileName.lastIndexOf('.'));
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error('Cloudinary deletion error:', cloudErr);
      }
    }
    res.json({ message: 'PYQ deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;