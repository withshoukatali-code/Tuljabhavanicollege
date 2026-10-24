
import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router = express.Router();

const uploadDir = path.resolve("uploads/student-initiatives");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
      && [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    const isPdf = file.mimetype === "application/pdf" && ext === ".pdf";

    if (isImage || isPdf) return cb(null, true);
    cb(new Error("Only JPG, PNG, WEBP images and PDF files are allowed."));
  },
});

const imagePdfFields = upload.fields([
  { name: "hero_image", maxCount: 1 },
  { name: "profile_pdf", maxCount: 1 },
  { name: "profile_image", maxCount: 1 },
  { name: "profile_file", maxCount: 1 },
]);

function fileUrl(file) {
  return file ? `/uploads/student-initiatives/${file.filename}` : null;
}

function removeLocalFile(url) {
  if (!url || !url.startsWith("/uploads/student-initiatives/")) return;

  const filename = path.basename(url);
  const fullPath = path.join(uploadDir, filename);

  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

function cleanBody(body, fields) {
  return Object.fromEntries(
    fields.map((key) => [key, body[key] === "" ? null : body[key] ?? null])
  );
}

function validSlug(value) {
  return ["ncc", "nss"].includes(String(value || "").toLowerCase());
}

// ADMIN: list initiatives and their leadership
router.get("/", async (_req, res) => {
  try {
    const [initiatives] = await pool.query(
      "SELECT * FROM student_initiatives ORDER BY display_order, id"
    );

    const [heads] = await pool.query(
      "SELECT * FROM student_initiative_heads ORDER BY initiative_id, id"
    );

    res.json({ success: true, initiatives, heads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load records." });
  }
});

// CREATE initiative
router.post("/", imagePdfFields, async (req, res) => {
  try {
    const { category, title, slug } = req.body;

    if (!category?.trim() || !title?.trim() || !validSlug(slug)) {
      return res.status(400).json({
        success: false,
        message: "Category, title and a valid NCC/NSS slug are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO student_initiatives
       (category, title, slug, subtitle, description, hero_image,
        profile_pdf_url, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category.trim(),
        title.trim(),
        slug.toLowerCase(),
        req.body.subtitle || null,
        req.body.description || null,
        fileUrl(req.files?.hero_image?.[0]) || req.body.existing_hero_image || null,
        fileUrl(req.files?.profile_pdf?.[0]) || req.body.existing_profile_pdf_url || null,
        req.body.is_active === "0" ? 0 : 1,
        Number(req.body.display_order) || 0,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM student_initiatives WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      initiative: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(error.code === "ER_DUP_ENTRY" ? 409 : 500).json({
      success: false,
      message: error.code === "ER_DUP_ENTRY"
        ? "This initiative slug already exists."
        : "Failed to create initiative.",
    });
  }
});

// UPDATE initiative
router.put("/:id", imagePdfFields, async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query(
      "SELECT * FROM student_initiatives WHERE id = ?",
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({ success: false, message: "Initiative not found." });
    }

    const old = existingRows[0];
    const slug = req.body.slug || old.slug;

    if (!validSlug(slug)) {
      return res.status(400).json({ success: false, message: "Slug must be ncc or nss." });
    }

    const hero = fileUrl(req.files?.hero_image?.[0]) || req.body.existing_hero_image || old.hero_image;
    const pdf = fileUrl(req.files?.profile_pdf?.[0]) || req.body.existing_profile_pdf_url || old.profile_pdf_url;

    await pool.query(
      `UPDATE student_initiatives SET
       category = ?, title = ?, slug = ?, subtitle = ?, description = ?,
       hero_image = ?, profile_pdf_url = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [
        req.body.category ?? old.category,
        req.body.title ?? old.title,
        slug.toLowerCase(),
        req.body.subtitle ?? old.subtitle,
        req.body.description ?? old.description,
        hero,
        pdf,
        req.body.is_active === undefined ? old.is_active : Number(req.body.is_active),
        req.body.display_order === undefined ? old.display_order : Number(req.body.display_order),
        id,
      ]
    );

    if (hero !== old.hero_image) removeLocalFile(old.hero_image);
    if (pdf !== old.profile_pdf_url) removeLocalFile(old.profile_pdf_url);

    const [rows] = await pool.query(
      "SELECT * FROM student_initiatives WHERE id = ?",
      [id]
    );

    res.json({ success: true, initiative: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(error.code === "ER_DUP_ENTRY" ? 409 : 500).json({
      success: false,
      message: error.code === "ER_DUP_ENTRY" ? "Slug already exists." : "Update failed.",
    });
  }
});

// ACTIVATE / DEACTIVATE initiative
router.patch("/:id/status", async (req, res) => {
  try {
    const active = Number(req.body.is_active);

    if (![0, 1].includes(active)) {
      return res.status(400).json({ success: false, message: "is_active must be 0 or 1." });
    }

    const [result] = await pool.query(
      "UPDATE student_initiatives SET is_active = ? WHERE id = ?",
      [active, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Initiative not found." });
    }

    res.json({ success: true, is_active: active });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Status update failed." });
  }
});

// CREATE leadership profile
router.post("/:id/heads", imagePdfFields, async (req, res) => {
  try {
    const { name } = req.body;

    const [parents] = await pool.query(
      "SELECT id FROM student_initiatives WHERE id = ?",
      [req.params.id]
    );

    if (!parents.length) {
      return res.status(404).json({ success: false, message: "Initiative not found." });
    }

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Leader name is required." });
    }

    const [result] = await pool.query(
      `INSERT INTO student_initiative_heads
       (initiative_id, name, designation, profile_image_url, qualification,
        experience, achievements, profile_file_title, profile_file_name,
        profile_file_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id,
        name.trim(),
        req.body.designation || null,
        fileUrl(req.files?.profile_image?.[0]),
        req.body.qualification || null,
        req.body.experience || null,
        req.body.achievements || null,
        req.body.profile_file_title || null,
        req.files?.profile_file?.[0]?.originalname || null,
        fileUrl(req.files?.profile_file?.[0]),
        req.body.is_active === "0" ? 0 : 1,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM student_initiative_heads WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, head: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create leader." });
  }
});

// UPDATE leadership profile
router.put("/heads/:headId", imagePdfFields, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM student_initiative_heads WHERE id = ?",
      [req.params.headId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Leader not found." });
    }

    const old = rows[0];
    const image = fileUrl(req.files?.profile_image?.[0]) || req.body.existing_profile_image_url || old.profile_image_url;
    const pdf = fileUrl(req.files?.profile_file?.[0]) || req.body.existing_profile_file_url || old.profile_file_url;

    await pool.query(
      `UPDATE student_initiative_heads SET
       name = ?, designation = ?, profile_image_url = ?, qualification = ?,
       experience = ?, achievements = ?, profile_file_title = ?,
       profile_file_name = ?, profile_file_url = ?, is_active = ?
       WHERE id = ?`,
      [
        req.body.name ?? old.name,
        req.body.designation ?? old.designation,
        image,
        req.body.qualification ?? old.qualification,
        req.body.experience ?? old.experience,
        req.body.achievements ?? old.achievements,
        req.body.profile_file_title ?? old.profile_file_title,
        req.files?.profile_file?.[0]?.originalname || old.profile_file_name,
        pdf,
        req.body.is_active === undefined ? old.is_active : Number(req.body.is_active),
        req.params.headId,
      ]
    );

    if (image !== old.profile_image_url) removeLocalFile(old.profile_image_url);
    if (pdf !== old.profile_file_url) removeLocalFile(old.profile_file_url);

    const [updated] = await pool.query(
      "SELECT * FROM student_initiative_heads WHERE id = ?",
      [req.params.headId]
    );

    res.json({ success: true, head: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update leader." });
  }
});

// ACTIVATE / DEACTIVATE leadership profile
router.patch("/heads/:headId/status", async (req, res) => {
  try {
    const active = Number(req.body.is_active);

    if (![0, 1].includes(active)) {
      return res.status(400).json({ success: false, message: "is_active must be 0 or 1." });
    }

    const [result] = await pool.query(
      "UPDATE student_initiative_heads SET is_active = ? WHERE id = ?",
      [active, req.params.headId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Leader not found." });
    }

    res.json({ success: true, is_active: active });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Status update failed." });
  }
});

export default router;

