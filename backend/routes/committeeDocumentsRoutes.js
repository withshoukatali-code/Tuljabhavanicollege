import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "../config/db.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads", "committees");
const antiRaggingPdf = "https://jascca.org/wp-content/uploads/2023/08/College-discipline-and-Anti-Ragging-committee-1.pdf";

const committees = [
  ["iqac", "IQAC", null],
  ["anti-ragging", "Anti-Ragging Committee", antiRaggingPdf],
  ["grievance", "Grievance Redressal Cell", null],
  ["icc", "Internal Complaints Committee (ICC)", null],
  ["sc-st", "SC/ST Cell", null],
  ["obc", "OBC Cell", null],
  ["minority", "Minority Cell", null],
  ["divyang", "Divyang Cell", null],
  ["student-welfare", "Student Welfare Committee", null],
];

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
      const safeName = path.basename(file.originalname)
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "");
      callback(null, `${Date.now()}-${safeName}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    const isPdf = path.extname(file.originalname).toLowerCase() === ".pdf" &&
      file.mimetype === "application/pdf";
    callback(isPdf ? null : new Error("Only PDF files are allowed."), isPdf);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

async function ensureCommitteeRecords() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS committee_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      committee_slug VARCHAR(100) NOT NULL UNIQUE,
      committee_title VARCHAR(255) NOT NULL,
      pdf_url TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  for (const [slug, title, pdfUrl] of committees) {
    await db.query(
      `INSERT IGNORE INTO committee_documents (committee_slug, committee_title, pdf_url)
       VALUES (?, ?, ?)`,
      [slug, title, pdfUrl]
    );
  }
}

function removeUploadedFile(fileUrl) {
  if (!fileUrl?.startsWith("/uploads/committees/")) return;
  const filePath = path.resolve(__dirname, "..", fileUrl.slice(1));
  const directory = path.resolve(uploadDir);
  if (filePath.startsWith(`${directory}${path.sep}`) && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

router.get("/", async (req, res) => {
  try {
    await ensureCommitteeRecords();
    const [rows] = await db.query(`
      SELECT id, committee_slug, committee_title, pdf_url, is_active, updated_at
      FROM committee_documents
      ORDER BY id ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET COMMITTEE DOCUMENTS ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load committee documents." });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    await ensureCommitteeRecords();
    const [rows] = await db.query(
      `SELECT committee_slug, committee_title, pdf_url, is_active
       FROM committee_documents WHERE committee_slug = ? AND is_active = 1 LIMIT 1`,
      [req.params.slug]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Committee not found." });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("GET COMMITTEE DOCUMENT ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load committee document." });
  }
});

router.put("/:slug", upload.single("pdf"), async (req, res) => {
  try {
    await ensureCommitteeRecords();
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Choose a PDF file to upload." });
    }

    const [rows] = await db.query(
      "SELECT pdf_url FROM committee_documents WHERE committee_slug = ? LIMIT 1",
      [req.params.slug]
    );
    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "Committee not found." });
    }

    const pdfUrl = `/uploads/committees/${req.file.filename}`;
    await db.query(
      "UPDATE committee_documents SET pdf_url = ?, is_active = 1 WHERE committee_slug = ?",
      [pdfUrl, req.params.slug]
    );
    removeUploadedFile(rows[0].pdf_url);
    res.json({ success: true, message: "Committee PDF saved.", pdf_url: pdfUrl });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("SAVE COMMITTEE DOCUMENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Unable to save committee PDF." });
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    await ensureCommitteeRecords();
    const [rows] = await db.query(
      "SELECT pdf_url FROM committee_documents WHERE committee_slug = ? LIMIT 1",
      [req.params.slug]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Committee not found." });
    }
    await db.query(
      "UPDATE committee_documents SET pdf_url = NULL WHERE committee_slug = ?",
      [req.params.slug]
    );
    removeUploadedFile(rows[0].pdf_url);
    res.json({ success: true, message: "Committee PDF removed." });
  } catch (error) {
    console.error("REMOVE COMMITTEE DOCUMENT ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to remove committee PDF." });
  }
});

export default router;