import express from 'express';
import PYQ from '../models/pyq.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import auth from '../middleware/auth.js';

const router = express.Router();

// Multer config (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and JPEG files are allowed'));
    }
  }
});

// Cloudinary config (set your env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// GET PYQs by trade, subject, and semester
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

// POST upload a PYQ (PDF/JPEG to Cloudinary)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    // Access control: only students or admins
    if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Only students or admins can upload PYQs.' });
    }
    const { title, trade, subject, semester } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File is required.' });
    // Upload to Cloudinary
    const streamUpload = (fileBuffer, mimetype) => {
      return new Promise((resolve, reject) => {
        const resourceType = mimetype === 'application/pdf' ? 'raw' : 'auto';
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder: 'pyqs' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer, req.file.mimetype);
    // Save PYQ
    const pyq = new PYQ({
      title,
      trade,
      subject,
      semester,
      fileUrl: result.secure_url,
      fileType: req.file.mimetype === 'application/pdf' ? 'pdf' : 'jpeg',
      uploadedBy: req.user._id
    });
    await pyq.save();
    res.status(201).json(pyq);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// DELETE a PYQ by ID (admin only, with verification code)
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
    // Delete from Cloudinary if fileUrl exists
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