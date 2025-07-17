import express from 'express';
import Note from '../models/notes.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import auth from '../middleware/auth.js';
import Subject from '../models/subject.js';
import Trade from '../models/trade.js';
import { body, validationResult } from 'express-validator';

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

// GET notes by trade, subject, and semester
router.get('/', auth, async (req, res) => {
  if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Only students or admins can access notes.' });
  }
  
  let { tradeCode, semester } = req.query;
  const filter = {};

  if (tradeCode) {
    try {
      // Find the trade by tradeCode
      const trade = await Trade.findOne({ tradeCode });
      console.log(trade);
      if (!trade) {
        return res.json([]); // No trade found for code
      }
      
      // Filter notes directly by trade ObjectId
      filter.trade = trade._id;
      console.log(trade._id);
      
    } catch (err) {
      return res.status(500).json({ error: 'Error finding trade' });
    }
  }

  if (semester) {
    filter.semester = semester;
  }

  try {
    const notes = await Note.find(filter)
      .populate({ path: 'subject', select: 'code name' })
      .populate({ path: 'trade', select: 'tradeCode tradeName' });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST upload a note (PDF/JPEG to Cloudinary)
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
      // Access control: only students or admins
      if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Only students or admins can upload notes.' });
      }
      const { title, trade, subject, semester } = req.body;
      if (!req.file) return res.status(400).json({ error: 'File is required.' });
      // Upload to Cloudinary
      const streamUpload = (fileBuffer, mimetype) => {
        return new Promise((resolve, reject) => {
          const resourceType = mimetype === 'application/pdf' ? 'raw' : 'auto';
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, folder: 'notes' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };
      const result = await streamUpload(req.file.buffer, req.file.mimetype);
      // Save note
      const note = new Note({
        title,
        trade,
        subject,
        semester,
        fileUrl: result.secure_url,
        fileType: req.file.mimetype === 'application/pdf' ? 'pdf' : 'jpeg',
        uploadedBy: req.user._id
      });
      await note.save();
      res.status(201).json(note);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Server error' });
    }
  }
);

// DELETE a note by ID (admin only, with verification code)
router.delete('/:id', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete notes.' });
  }
  const { adminCode } = req.body;
  const validCode = process.env.ADMIN_DELETE_CODE || 'admin123';
  if (adminCode !== validCode) {
    return res.status(401).json({ error: 'Invalid admin verification code.' });
  }
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    // Delete from Cloudinary if fileUrl exists
    if (note.fileUrl) {
      const urlParts = note.fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = 'notes/' + fileName.substring(0, fileName.lastIndexOf('.'));
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error('Cloudinary deletion error:', cloudErr);
      }
    }
    res.json({ message: 'Note deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 