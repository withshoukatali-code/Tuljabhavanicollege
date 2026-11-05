import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAlumni, getPage, savePage, listItems, createItem, updateItem, deleteItem
} from '../controllers/alumniController.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads/alumni');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getAlumni);
router.get('/page', getPage);
router.put('/page', upload.single('hero_image_file'), savePage);
router.get('/:section', listItems);
router.post('/:section', upload.single('photo_file'), createItem);
router.put('/:section/:id', upload.single('photo_file'), updateItem);
router.delete('/:section/:id', deleteItem);

export default router;
