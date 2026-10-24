
import express from "express";
import multer from "multer";
import pool from "../config/db.js";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.resolve(
  __dirname,
  "../uploads/ncc-reports"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}.pdf`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const isPdfExtension =
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (!isPdfExtension || file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }

    cb(null, true);
  },
});

const REPORT_CATEGORIES = [
  "NCC Activity Reports",
  "Annual Reports",
  "NCC Audit Reports",
  "Camp Reports",
  "Event-wise Activity Reports",
];

function parseActive(value, fallback = 1) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(
    String(value).toLowerCase()
  )
    ? 1
    : 0;
}

function parseOrder(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0
    ? parsed
    : fallback;
}

function reportFileUrl(filename) {
  return `/uploads/ncc-reports/${filename}`;
}

async function getNccId() {
  const [rows] = await pool.query(
    `SELECT id
     FROM student_initiatives
     WHERE slug = 'ncc'
     LIMIT 1`
  );

  return rows.length ? rows[0].id : null;
}

async function deleteUploadedFile(fileUrl) {
  if (!fileUrl) return;

  const filename = path.basename(fileUrl);
  if (!filename || filename !== fileUrl.split("/").pop()) return;

  const fullPath = path.join(uploadDirectory, filename);

  try {
    await fs.promises.unlink(fullPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not remove uploaded PDF:", error);
    }
  }
}

function handleError(res, error, message) {
  console.error(message, error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "PDF must be 20 MB or smaller."
          : error.message,
    });
  }

  if (
    error.message === "Only PDF files are allowed."
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
}

/*
  PUBLIC:
  GET /api/student-initiatives/ncc/reports/public
  Only published reports are returned.
*/
router.get("/public", async (_req, res) => {
  try {
    const initiativeId = await getNccId();

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "NCC initiative not found.",
      });
    }

    const [reports] = await pool.query(
      `SELECT id, title, category, academic_year,
              file_name, file_url, display_order
       FROM student_initiative_reports
       WHERE initiative_id = ? AND is_active = 1
       ORDER BY display_order ASC, id DESC`,
      [initiativeId]
    );

    return res.json({ success: true, reports });
  } catch (error) {
    return handleError(res, error, "Could not load public NCC reports.");
  }
});

/*
  ADMIN:
  GET /api/student-initiatives/ncc/reports
  Returns drafts and published reports.
  Protect this endpoint with your admin authentication middleware.
*/
router.get("/", async (_req, res) => {
  try {
    const initiativeId = await getNccId();

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "NCC initiative not found.",
      });
    }

    const [reports] = await pool.query(
      `SELECT *
       FROM student_initiative_reports
       WHERE initiative_id = ?
       ORDER BY display_order ASC, id DESC`,
      [initiativeId]
    );

    return res.json({ success: true, reports });
  } catch (error) {
    return handleError(res, error, "Could not load NCC reports.");
  }
});

/*
  ADMIN:
  POST /api/student-initiatives/ncc/reports
*/
router.post("/", upload.single("file"), async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const initiativeId = await getNccId();

    if (!initiativeId) {
      if (req.file) await deleteUploadedFile(req.file.filename);

      return res.status(404).json({
        success: false,
        message: "NCC initiative not found.",
      });
    }

    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "").trim();
    const academicYear = String(req.body.academic_year || "").trim();
    const displayOrder = parseOrder(req.body.display_order);
    const isActive = parseActive(req.body.is_active, 1);

    if (!title || !category || !req.file) {
      if (req.file) await deleteUploadedFile(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "Title, category and a PDF file are required.",
      });
    }

    if (!REPORT_CATEGORIES.includes(category)) {
      await deleteUploadedFile(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "Invalid report category.",
      });
    }

    uploadedFileUrl = reportFileUrl(req.file.filename);

    const [result] = await pool.query(
      `INSERT INTO student_initiative_reports
       (initiative_id, title, category, academic_year,
        file_name, file_url, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        initiativeId,
        title,
        category,
        academicYear || null,
        req.file.originalname,
        uploadedFileUrl,
        displayOrder,
        isActive,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "NCC report uploaded successfully.",
      id: result.insertId,
      file_url: uploadedFileUrl,
    });
  } catch (error) {
    if (req.file) await deleteUploadedFile(req.file.filename);

    return handleError(res, error, "Could not upload NCC report.");
  }
});

/*
  ADMIN:
  PUT /api/student-initiatives/ncc/reports/:id
  The PDF is optional when editing existing report details.
*/
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const initiativeId = await getNccId();

    if (!Number.isInteger(id) || id <= 0 || !initiativeId) {
      if (req.file) await deleteUploadedFile(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "Invalid report ID or missing NCC initiative.",
      });
    }

    const [existingRows] = await pool.query(
      `SELECT *
       FROM student_initiative_reports
       WHERE id = ? AND initiative_id = ?
       LIMIT 1`,
      [id, initiativeId]
    );

    if (!existingRows.length) {
      if (req.file) await deleteUploadedFile(req.file.filename);

      return res.status(404).json({
        success: false,
        message: "NCC report not found.",
      });
    }

    const existing = existingRows[0];

    const title =
      req.body.title !== undefined
        ? String(req.body.title).trim()
        : existing.title;

    const category =
      req.body.category !== undefined
        ? String(req.body.category).trim()
        : existing.category;

    const academicYear =
      req.body.academic_year !== undefined
        ? String(req.body.academic_year).trim()
        : existing.academic_year || "";

    const displayOrder =
      req.body.display_order !== undefined
        ? parseOrder(req.body.display_order)
        : existing.display_order;

    const isActive =
      req.body.is_active !== undefined
        ? parseActive(req.body.is_active)
        : Number(existing.is_active);

    if (!title || !REPORT_CATEGORIES.includes(category)) {
      if (req.file) await deleteUploadedFile(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "A valid title and report category are required.",
      });
    }

    const newFileName = req.file
      ? req.file.originalname
      : existing.file_name;

    const newFileUrl = req.file
      ? reportFileUrl(req.file.filename)
      : existing.file_url;

    await pool.query(
      `UPDATE student_initiative_reports
       SET title = ?, category = ?, academic_year = ?,
           file_name = ?, file_url = ?, display_order = ?,
           is_active = ?
       WHERE id = ? AND initiative_id = ?`,
      [
        title,
        category,
        academicYear || null,
        newFileName,
        newFileUrl,
        displayOrder,
        isActive,
        id,
        initiativeId,
      ]
    );

    if (req.file) {
      await deleteUploadedFile(existing.file_url);
    }

    return res.json({
      success: true,
      message: "NCC report updated successfully.",
      file_url: newFileUrl,
    });
  } catch (error) {
    if (req.file) await deleteUploadedFile(req.file.filename);

    return handleError(res, error, "Could not update NCC report.");
  }
});

/*
  ADMIN:
  DELETE /api/student-initiatives/ncc/reports/:id
*/
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const initiativeId = await getNccId();

    if (!Number.isInteger(id) || id <= 0 || !initiativeId) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID or missing NCC initiative.",
      });
    }

    const [rows] = await pool.query(
      `SELECT file_url
       FROM student_initiative_reports
       WHERE id = ? AND initiative_id = ?
       LIMIT 1`,
      [id, initiativeId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "NCC report not found.",
      });
    }

    await pool.query(
      `DELETE FROM student_initiative_reports
       WHERE id = ? AND initiative_id = ?`,
      [id, initiativeId]
    );

    await deleteUploadedFile(rows[0].file_url);

    return res.json({
      success: true,
      message: "NCC report deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Could not delete NCC report.");
  }
});

export default router;