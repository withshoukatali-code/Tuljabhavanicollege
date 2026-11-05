import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const uploadDir = path.resolve("uploads/student-initiatives");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeBase = path.basename(file.originalname || "upload", ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 70) || "upload";
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isImage = ["profile-photo", "achievement-photo", "gallery-photo"].includes(_req.query.type) &&
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype) &&
      [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    const isPdf = ["profile-pdf", "report", "achievement-pdf"].includes(_req.query.type) &&
      (file.mimetype === "application/pdf" || ext === ".pdf");
    if (isImage || isPdf) return cb(null, true);
    cb(new Error("Invalid file type. Use JPG/PNG/WebP for photos and PDF for documents."));
  },
});

const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function ok(res, extra = {}) {
  return res.json({ success: true, ...extra });
}
function bad(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}
function slugOnly(slug) {
  return ["ncc", "nss"].includes(String(slug || "").toLowerCase());
}
function safeId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function fileUrl(req, file) {
  if (!file) return "";
  return `/uploads/student-initiatives/${file.filename}`;
}

/*
 * IMPORTANT:
 * Keep this router registered only once:
 * app.use("/api/student-initiatives", studentInitiativeRoutes);
 *
 * The specific admin/report/upload routes are declared before GET /:slug
 * so that "admin" and "ncc/reports" are not mistaken for a slug.
 */

/* ---------- Upload endpoint ---------- */
router.post("/admin/:slug/upload", (req, res, next) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  next();
}, upload.single("file"), asyncRoute(async (req, res) => {
  if (!req.file) return bad(res, "Choose a file to upload.");
  return ok(res, { url: fileUrl(req, req.file), file_url: fileUrl(req, req.file) });
}));

/* ---------- Reports: public read ---------- */
router.get("/:slug/reports/public", asyncRoute(async (req, res) => {
  const { slug } = req.params;
  if (!slugOnly(slug)) return bad(res, "Unsupported initiative slug", 404);
  const [rows] = await pool.execute(
    `SELECT id, initiative_id, title, category, academic_year, file_url,
            display_order, is_active, created_at, updated_at
       FROM student_initiative_reports
      WHERE initiative_id = (SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1)
        AND is_active = 1
      ORDER BY display_order ASC, id DESC`,
    [slug]
  );
  return ok(res, { reports: rows });
}));

/* ---------- Reports: admin CRUD ---------- */
router.get("/:slug/reports", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const [rows] = await pool.execute(
    `SELECT r.* FROM student_initiative_reports r
     JOIN student_initiatives i ON i.id = r.initiative_id
     WHERE i.slug = ? ORDER BY r.display_order ASC, r.id DESC`,
    [req.params.slug]
  );
  return ok(res, { reports: rows });
}));

router.post("/:slug/reports", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const [initiativeRows] = await pool.execute("SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1", [req.params.slug]);
  if (!initiativeRows.length) return bad(res, "Initiative not found", 404);
  const body = req.body || {};
  if (!String(body.title || "").trim()) return bad(res, "Report title is required.");
  const [result] = await pool.execute(
    `INSERT INTO student_initiative_reports
      (initiative_id, title, category, academic_year, file_url, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [initiativeRows[0].id, String(body.title).trim(), body.category || "Activity Report",
      body.academic_year || null, body.file_url || null, Number(body.display_order) || 0,
      Number(body.is_active) === 0 ? 0 : 1]
  );
  return ok(res, { id: result.insertId, message: "Report created." });
}));

router.put("/:slug/reports/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid report ID.");
  const body = req.body || {};
  const [result] = await pool.execute(
    `UPDATE student_initiative_reports r
       JOIN student_initiatives i ON i.id = r.initiative_id
        SET r.title = ?, r.category = ?, r.academic_year = ?, r.file_url = ?,
            r.display_order = ?, r.is_active = ?
      WHERE r.id = ? AND i.slug = ?`,
    [String(body.title || "").trim(), body.category || "Activity Report",
      body.academic_year || null, body.file_url || null, Number(body.display_order) || 0,
      Number(body.is_active) === 0 ? 0 : 1, id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Report not found", 404);
  return ok(res, { message: "Report updated." });
}));

router.delete("/:slug/reports/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid report ID.");
  const [result] = await pool.execute(
    `DELETE r FROM student_initiative_reports r
     JOIN student_initiatives i ON i.id = r.initiative_id
     WHERE r.id = ? AND i.slug = ?`,
    [id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Report not found", 404);
  return ok(res, { message: "Report deleted." });
}));

/* ---------- Cadet achievements CRUD ---------- */
router.get("/:slug/achievements", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const [rows] = await pool.execute(
    `SELECT a.* FROM student_initiative_achievements a
     JOIN student_initiatives i ON i.id = a.initiative_id
     WHERE i.slug = ? ORDER BY a.display_order ASC, a.id DESC`, [req.params.slug]
  );
  return ok(res, { achievements: rows });
}));

router.get("/:slug/achievements/public", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const [rows] = await pool.execute(
    `SELECT a.* FROM student_initiative_achievements a
     JOIN student_initiatives i ON i.id = a.initiative_id
     WHERE i.slug = ? AND a.is_active = 1 ORDER BY a.display_order ASC, a.id DESC`, [req.params.slug]
  );
  return ok(res, { achievements: rows });
}));

router.post("/admin/:slug/achievements", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const b = req.body || {};
  if (!String(b.title || "").trim()) return bad(res, "Achievement title is required.");
  const [iRows] = await pool.execute("SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1", [req.params.slug]);
  if (!iRows.length) return bad(res, "Initiative not found", 404);
  const [result] = await pool.execute(
    `INSERT INTO student_initiative_achievements
      (initiative_id, title, cadet_name, achievement_date, award, description, photo_url, document_url, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [iRows[0].id, String(b.title).trim(), b.cadet_name || null, b.achievement_date || null,
      b.award || null, b.description || null, b.photo_url || null, b.document_url || null,
      Number(b.display_order) || 0, Number(b.is_active) === 0 ? 0 : 1]
  );
  return ok(res, { id: result.insertId, message: "Achievement created." });
}));

router.put("/admin/:slug/achievements/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id); if (!id) return bad(res, "Invalid achievement ID.");
  const b = req.body || {};
  const [result] = await pool.execute(
    `UPDATE student_initiative_achievements a JOIN student_initiatives i ON i.id = a.initiative_id
       SET a.title = ?, a.cadet_name = ?, a.achievement_date = ?, a.award = ?, a.description = ?,
           a.photo_url = ?, a.document_url = ?, a.display_order = ?, a.is_active = ?
     WHERE a.id = ? AND i.slug = ?`,
    [String(b.title || "").trim(), b.cadet_name || null, b.achievement_date || null, b.award || null,
      b.description || null, b.photo_url || null, b.document_url || null, Number(b.display_order) || 0,
      Number(b.is_active) === 0 ? 0 : 1, id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Achievement not found", 404);
  return ok(res, { message: "Achievement updated." });
}));

router.delete("/admin/:slug/achievements/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id); if (!id) return bad(res, "Invalid achievement ID.");
  const [result] = await pool.execute(
    `DELETE a FROM student_initiative_achievements a JOIN student_initiatives i ON i.id = a.initiative_id
     WHERE a.id = ? AND i.slug = ?`, [id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Achievement not found", 404);
  return ok(res, { message: "Achievement deleted." });
}));

/* ---------- Gallery and video media CRUD ---------- */
router.get("/:slug/media", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const [rows] = await pool.execute(
    `SELECT m.* FROM student_initiative_media m JOIN student_initiatives i ON i.id = m.initiative_id
     WHERE i.slug = ? ORDER BY m.display_order ASC, m.id DESC`, [req.params.slug]
  );
  return ok(res, { media: rows });
}));
router.post("/admin/:slug/media", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const b = req.body || {}; if (!String(b.title || "").trim()) return bad(res, "Media title is required.");
  if (!["photo", "video"].includes(b.media_type)) return bad(res, "Media type must be photo or video.");
  const [iRows] = await pool.execute("SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1", [req.params.slug]);
  if (!iRows.length) return bad(res, "Initiative not found", 404);
  if (!String(b.media_url || "").trim()) return bad(res, "Choose/upload a photo or provide a video URL.");
  const [result] = await pool.execute(
    `INSERT INTO student_initiative_media (initiative_id, media_type, title, caption, description, media_url, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [iRows[0].id, b.media_type, String(b.title).trim(), b.caption || null, b.description || null, b.media_url,
     Number(b.display_order) || 0, Number(b.is_active) === 0 ? 0 : 1]
  );
  return ok(res, { id: result.insertId, message: "Gallery media created." });
}));
router.put("/admin/:slug/media/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id); if (!id) return bad(res, "Invalid media ID."); const b = req.body || {};
  const [result] = await pool.execute(
    `UPDATE student_initiative_media m JOIN student_initiatives i ON i.id = m.initiative_id
     SET m.media_type = ?, m.title = ?, m.caption = ?, m.description = ?, m.media_url = ?, m.display_order = ?, m.is_active = ?
     WHERE m.id = ? AND i.slug = ?`,
    [b.media_type === "video" ? "video" : "photo", String(b.title || "").trim(), b.caption || null, b.description || null,
     b.media_url || "", Number(b.display_order) || 0, Number(b.is_active) === 0 ? 0 : 1, id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Gallery media not found", 404);
  return ok(res, { message: "Gallery media updated." });
}));
router.delete("/admin/:slug/media/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id); if (!id) return bad(res, "Invalid media ID.");
  const [result] = await pool.execute(`DELETE m FROM student_initiative_media m JOIN student_initiatives i ON i.id = m.initiative_id WHERE m.id = ? AND i.slug = ?`, [id, req.params.slug]);
  if (!result.affectedRows) return bad(res, "Gallery media not found", 404);
  return ok(res, { message: "Gallery media deleted." });
}));

/* ---------- Initiative page settings ---------- */
router.put("/admin/:slug", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const body = req.body || {};
  const [result] = await pool.execute(
    `UPDATE student_initiatives
        SET title = ?, subtitle = ?, description = ?, hero_image = ?, ncc_unit_started = ?, ncc_enrolment = ?, is_active = ?, display_order = ?
      WHERE slug = ?`,
    [String(body.title || "").trim(), body.subtitle || null, body.description || null, body.hero_image || null,
      body.ncc_unit_started || "1976", body.ncc_enrolment || "53 cadets",
      Number(body.is_active) === 0 ? 0 : 1, Number(body.display_order) || 0, req.params.slug]
  );
  if (!result.affectedRows) {
    const [rows] = await pool.execute("SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1", [req.params.slug]);
    if (!rows.length) return bad(res, "Initiative not found", 404);
  }
  return ok(res, { message: "Page settings saved." });
}));

/* ---------- Sections CRUD ---------- */
router.post("/admin/:slug/sections", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const body = req.body || {};
  const [iRows] = await pool.execute("SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1", [req.params.slug]);
  if (!iRows.length) return bad(res, "Initiative not found", 404);
  if (!String(body.title || "").trim()) return bad(res, "Section title is required.");
  const [result] = await pool.execute(
    `INSERT INTO student_initiative_sections
      (initiative_id, section_key, title, content, file_title, file_url, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [iRows[0].id, body.section_key || "", String(body.title).trim(), body.content || "",
      body.file_title || null, body.file_url || null, Number(body.display_order) || 0,
      Number(body.is_active) === 0 ? 0 : 1]
  );
  return ok(res, { id: result.insertId, message: "Section created." });
}));

router.put("/admin/:slug/sections/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid section ID.");
  const b = req.body || {};
  const [result] = await pool.execute(
    `UPDATE student_initiative_sections s
      JOIN student_initiatives i ON i.id = s.initiative_id
       SET s.section_key = ?, s.title = ?, s.content = ?, s.file_title = ?,
           s.file_url = ?, s.display_order = ?, s.is_active = ?
     WHERE s.id = ? AND i.slug = ?`,
    [b.section_key || "", String(b.title || "").trim(), b.content || "", b.file_title || null,
      b.file_url || null, Number(b.display_order) || 0, Number(b.is_active) === 0 ? 0 : 1,
      id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Section not found", 404);
  return ok(res, { message: "Section updated." });
}));

router.delete("/admin/:slug/sections/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid section ID.");
  const [result] = await pool.execute(
    `DELETE s FROM student_initiative_sections s
     JOIN student_initiatives i ON i.id = s.initiative_id
     WHERE s.id = ? AND i.slug = ?`,
    [id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Section not found", 404);
  return ok(res, { message: "Section deleted." });
}));

/* ---------- Sidebar CRUD ---------- */
router.post("/admin/:slug/sidebar", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const b = req.body || {};
  const [iRows] = await pool.execute("SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1", [req.params.slug]);
  if (!iRows.length) return bad(res, "Initiative not found", 404);
  if (!String(b.title || "").trim()) return bad(res, "Sidebar link title is required.");
  const [result] = await pool.execute(
    `INSERT INTO student_initiative_sidebar
      (initiative_id, title, url, display_order, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [iRows[0].id, String(b.title).trim(), b.url || b.file_url || "",
      Number(b.display_order) || 0, Number(b.is_active) === 0 ? 0 : 1]
  );
  return ok(res, { id: result.insertId, message: "Sidebar link created." });
}));

router.put("/admin/:slug/sidebar/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid sidebar link ID.");
  const b = req.body || {};
  const [result] = await pool.execute(
    `UPDATE student_initiative_sidebar s
      JOIN student_initiatives i ON i.id = s.initiative_id
       SET s.title = ?, s.url = ?, s.display_order = ?, s.is_active = ?
     WHERE s.id = ? AND i.slug = ?`,
    [String(b.title || "").trim(), b.url || b.file_url || "",
      Number(b.display_order) || 0, Number(b.is_active) === 0 ? 0 : 1, id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Sidebar link not found", 404);
  return ok(res, { message: "Sidebar link updated." });
}));

router.delete("/admin/:slug/sidebar/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid sidebar link ID.");
  const [result] = await pool.execute(
    `DELETE s FROM student_initiative_sidebar s
     JOIN student_initiatives i ON i.id = s.initiative_id
     WHERE s.id = ? AND i.slug = ?`,
    [id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Sidebar link not found", 404);
  return ok(res, { message: "Sidebar link deleted." });
}));

/* ---------- Unit leadership CRUD ---------- */
router.post("/admin/:slug/heads", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const b = req.body || {};
  const [iRows] = await pool.execute("SELECT id FROM student_initiatives WHERE slug = ? LIMIT 1", [req.params.slug]);
  if (!iRows.length) return bad(res, "Initiative not found", 404);
  if (!String(b.name || "").trim()) return bad(res, "Leadership name is required.");
  const [result] = await pool.execute(
    `INSERT INTO student_initiative_heads
      (initiative_id, name, designation, qualification, experience, achievements,
       photo_url, profile_pdf_url, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [iRows[0].id, String(b.name).trim(), b.designation || "Head of NCC",
      b.qualification || null, b.experience || null, b.achievements || null,
      b.photo_url || null, b.profile_pdf_url || null, Number(b.display_order) || 0,
      Number(b.is_active) === 0 ? 0 : 1]
  );
  return ok(res, { id: result.insertId, message: "Leadership profile created." });
}));

router.put("/admin/:slug/heads/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid leadership ID.");
  const b = req.body || {};
  const [result] = await pool.execute(
    `UPDATE student_initiative_heads h
      JOIN student_initiatives i ON i.id = h.initiative_id
       SET h.name = ?, h.designation = ?, h.qualification = ?, h.experience = ?,
           h.achievements = ?, h.photo_url = ?, h.profile_pdf_url = ?,
           h.display_order = ?, h.is_active = ?
     WHERE h.id = ? AND i.slug = ?`,
    [String(b.name || "").trim(), b.designation || "Head of NCC", b.qualification || null,
      b.experience || null, b.achievements || null, b.photo_url || null, b.profile_pdf_url || null,
      Number(b.display_order) || 0, Number(b.is_active) === 0 ? 0 : 1, id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Leadership profile not found", 404);
  return ok(res, { message: "Leadership profile updated." });
}));

router.delete("/admin/:slug/heads/:id", asyncRoute(async (req, res) => {
  if (!slugOnly(req.params.slug)) return bad(res, "Unsupported initiative slug", 404);
  const id = safeId(req.params.id);
  if (!id) return bad(res, "Invalid leadership ID.");
  const [result] = await pool.execute(
    `DELETE h FROM student_initiative_heads h
     JOIN student_initiatives i ON i.id = h.initiative_id
     WHERE h.id = ? AND i.slug = ?`,
    [id, req.params.slug]
  );
  if (!result.affectedRows) return bad(res, "Leadership profile not found", 404);
  return ok(res, { message: "Leadership profile deleted." });
}));

/* ---------- Public page response: keep after specific routes ---------- */
router.get("/:slug", asyncRoute(async (req, res) => {
  const { slug } = req.params;
  if (!slugOnly(slug)) return bad(res, "Unsupported initiative slug", 404);

  const [initiatives] = await pool.execute(
    "SELECT * FROM student_initiatives WHERE slug = ? AND is_active = 1 LIMIT 1",
    [slug]
  );
  if (!initiatives.length) return bad(res, "Initiative not found", 404);

  const initiative = initiatives[0];
  const [heads] = await pool.execute(
    `SELECT * FROM student_initiative_heads
     WHERE initiative_id = ?
     ORDER BY display_order ASC, id ASC`,
    [initiative.id]
  );
  const [sections] = await pool.execute(
    `SELECT * FROM student_initiative_sections
     WHERE initiative_id = ? AND is_active = 1
     ORDER BY display_order ASC, id ASC`,
    [initiative.id]
  );
  const [sidebar] = await pool.execute(
    `SELECT * FROM student_initiative_sidebar
     WHERE initiative_id = ? AND is_active = 1
     ORDER BY display_order ASC, id ASC`,
    [initiative.id]
  );
  const [reports] = await pool.execute(
    `SELECT * FROM student_initiative_reports
     WHERE initiative_id = ? AND is_active = 1
     ORDER BY display_order ASC, id DESC`,
    [initiative.id]
  );
  const [media] = await pool.execute(
    `SELECT * FROM student_initiative_media WHERE initiative_id = ? AND is_active = 1 ORDER BY display_order ASC, id DESC`, [initiative.id]
  );
  const [achievements] = await pool.execute(
    `SELECT * FROM student_initiative_achievements
     WHERE initiative_id = ? AND is_active = 1
     ORDER BY display_order ASC, id DESC`, [initiative.id]
  );
  return ok(res, { initiative, heads, sections, sidebar, reports, achievements, media });
}));

/* Consistent JSON errors for route/multer failures. */
router.use((err, _req, res, _next) => {
  console.error("Student initiative API error:", err);
  const status = err instanceof multer.MulterError ? 400 : 500;
  res.status(status).json({ success: false, message: err.message || "Internal server error" });
});

export default router;
