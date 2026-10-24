import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* =========================================================
   UPLOAD CONFIGURATION
   Files are stored in uploads/student-initiatives
========================================================= */

const uploadDir = path.resolve("uploads/student-initiatives");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 70);

    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const allowedTypes = {
  heroImage: ["image/jpeg", "image/png", "image/webp"],
  profilePdf: ["application/pdf"],
  sectionImage: ["image/jpeg", "image/png", "image/webp"],
  sectionPdf: ["application/pdf"],
  profileImage: ["image/jpeg", "image/png", "image/webp"],
  headPdf: ["application/pdf"],
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const types = allowedTypes[file.fieldname];

    if (!types || !types.includes(file.mimetype)) {
      return cb(
        new Error(`Invalid file type for ${file.fieldname}.`)
      );
    }

    cb(null, true);
  },
});

const pageUpload = upload.fields([
  { name: "heroImage", maxCount: 1 },
  { name: "profilePdf", maxCount: 1 },
]);

const sectionUpload = upload.fields([
  { name: "sectionImage", maxCount: 1 },
  { name: "sectionPdf", maxCount: 1 },
]);

const headUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "headPdf", maxCount: 1 },
]);

/* =========================================================
   HELPERS
========================================================= */

const allowedSlugs = ["ncc", "nss"];

function validSlug(slug) {
  return allowedSlugs.includes(String(slug || "").toLowerCase());
}

function fileUrl(file) {
  return file
    ? `uploads/student-initiatives/${file.filename}`
    : null;
}

function publicError(res, error, message) {
  console.error(message, error);

  return res.status(500).json({
    success: false,
    message,
  });
}

async function getInitiative(slug) {
  const normalizedSlug = String(slug || "").toLowerCase();

  if (!validSlug(normalizedSlug)) {
    return null;
  }

  const [rows] = await pool.query(
    `SELECT id, category, title, slug, subtitle, description,
            hero_image, profile_pdf_url, display_order, is_active
     FROM student_initiatives
     WHERE slug = ?
     LIMIT 1`,
    [normalizedSlug]
  );

  return rows[0] || null;
}

async function getInitiativeId(slug) {
  const initiative = await getInitiative(slug);
  return initiative?.id ?? null;
}

async function findOwnedRow(table, id, initiativeId) {
  // Table name must come only from this internal allowlist.
  const allowedTables = [
    "student_initiative_sections",
    "student_initiative_sidebar",
    "student_initiative_heads",
  ];

  if (!allowedTables.includes(table)) {
    throw new Error("Invalid internal table name.");
  }

  const [rows] = await pool.query(
    `SELECT id FROM ${table}
     WHERE id = ? AND initiative_id = ?
     LIMIT 1`,
    [id, initiativeId]
  );

  return rows[0] || null;
}

/* =========================================================
   PUBLIC API
   GET /api/student-initiatives/ncc
   GET /api/student-initiatives/nss
========================================================= */

router.get("/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase();

    if (!validSlug(slug)) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const initiative = await getInitiative(slug);

    if (!initiative || Number(initiative.is_active) !== 1) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [heads] = await pool.query(
      `SELECT id, initiative_id, name, designation,
              profile_image_url, qualification, experience,
              achievements, profile_file_title,
              profile_file_name, profile_file_url
       FROM student_initiative_heads
       WHERE initiative_id = ? AND is_active = 1
       ORDER BY id ASC`,
      [initiative.id]
    );

    const [sections] = await pool.query(
      `SELECT id, section_key, title, content, image_url,
              file_title, file_url, display_order
       FROM student_initiative_sections
       WHERE initiative_id = ? AND is_active = 1
       ORDER BY display_order ASC, id ASC`,
      [initiative.id]
    );

    const [sidebar] = await pool.query(
      `SELECT id, label, target, display_order
       FROM student_initiative_sidebar
       WHERE initiative_id = ? AND is_active = 1
       ORDER BY display_order ASC, id ASC`,
      [initiative.id]
    );

    return res.json({
      success: true,
      initiative,
      heads,
      sections,
      sidebar,
    });
  } catch (error) {
    return publicError(
      res,
      error,
      "Unable to load initiative."
    );
  }
});

/* =========================================================
   ADMIN: PAGE DETAILS
   GET /api/student-initiatives/admin/ncc
   PUT /api/student-initiatives/admin/ncc
========================================================= */

router.get("/admin/:slug", async (req, res) => {
  try {
    if (!validSlug(req.params.slug)) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const initiative = await getInitiative(req.params.slug);

    if (!initiative) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    return res.json({ success: true, initiative });
  } catch (error) {
    return publicError(
      res,
      error,
      "Unable to load initiative settings."
    );
  }
});

router.put("/admin/:slug", pageUpload, async (req, res) => {
  try {
    if (!validSlug(req.params.slug)) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const current = await getInitiative(req.params.slug);

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const hero = req.files?.heroImage?.[0];
    const pdf = req.files?.profilePdf?.[0];

    const title =
      req.body.title !== undefined
        ? String(req.body.title).trim()
        : current.title;

    const subtitle =
      req.body.subtitle !== undefined
        ? String(req.body.subtitle).trim()
        : current.subtitle;

    const description =
      req.body.description !== undefined
        ? String(req.body.description)
        : current.description;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Page title is required.",
      });
    }

    await pool.query(
      `UPDATE student_initiatives
       SET title = ?,
           subtitle = ?,
           description = ?,
           hero_image = ?,
           profile_pdf_url = ?
       WHERE id = ?`,
      [
        title,
        subtitle,
        description,
        hero ? fileUrl(hero) : current.hero_image,
        pdf ? fileUrl(pdf) : current.profile_pdf_url,
        current.id,
      ]
    );

    const initiative = await getInitiative(req.params.slug);

    return res.json({
      success: true,
      message: "Initiative saved successfully.",
      initiative,
    });
  } catch (error) {
    return publicError(
      res,
      error,
      "Unable to save initiative."
    );
  }
});

/* =========================================================
   ADMIN: CONTENT SECTIONS
========================================================= */

// GET /admin/:slug/sections
router.get("/admin/:slug/sections", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [sections] = await pool.query(
      `SELECT *
       FROM student_initiative_sections
       WHERE initiative_id = ?
       ORDER BY display_order ASC, id ASC`,
      [initiativeId]
    );

    return res.json({ success: true, sections });
  } catch (error) {
    return publicError(res, error, "Unable to load sections.");
  }
});

// POST /admin/:slug/sections
router.post("/admin/:slug/sections", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const {
      section_key,
      title,
      content = "",
      display_order = 0,
      is_active = 1,
    } = req.body;

    if (!section_key?.trim() || !title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Section key and title are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO student_initiative_sections
       (initiative_id, section_key, title, content,
        display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        initiativeId,
        section_key.trim(),
        title.trim(),
        content,
        Number(display_order) || 0,
        Number(is_active) ? 1 : 0,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM student_initiative_sections WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Section created.",
      section: rows[0],
    });
  } catch (error) {
    return publicError(res, error, "Unable to create section.");
  }
});

// PUT /admin/:slug/sections/:id
router.put(
  "/admin/:slug/sections/:id",
  sectionUpload,
  async (req, res) => {
    try {
      const initiativeId = await getInitiativeId(req.params.slug);

      if (!initiativeId) {
        return res.status(404).json({
          success: false,
          message: "Initiative not found.",
        });
      }

      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid section ID.",
        });
      }

      const [rows] = await pool.query(
        `SELECT * FROM student_initiative_sections
         WHERE id = ? AND initiative_id = ?
         LIMIT 1`,
        [id, initiativeId]
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Section not found.",
        });
      }

      const current = rows[0];
      const image = req.files?.sectionImage?.[0];
      const pdf = req.files?.sectionPdf?.[0];

      const title = req.body.title ?? current.title;
      const key = req.body.section_key ?? current.section_key;

      if (!String(title).trim() || !String(key).trim()) {
        return res.status(400).json({
          success: false,
          message: "Section title and key are required.",
        });
      }

      await pool.query(
        `UPDATE student_initiative_sections
         SET section_key = ?,
             title = ?,
             content = ?,
             image_url = ?,
             file_title = ?,
             file_url = ?,
             display_order = ?,
             is_active = ?
         WHERE id = ? AND initiative_id = ?`,
        [
          String(key).trim(),
          String(title).trim(),
          req.body.content ?? current.content ?? "",
          image ? fileUrl(image) : current.image_url,
          req.body.file_title ?? current.file_title,
          pdf ? fileUrl(pdf) : current.file_url,
          req.body.display_order !== undefined
            ? Number(req.body.display_order) || 0
            : current.display_order,
          req.body.is_active !== undefined
            ? (Number(req.body.is_active) ? 1 : 0)
            : current.is_active,
          id,
          initiativeId,
        ]
      );

      const [updated] = await pool.query(
        `SELECT * FROM student_initiative_sections
         WHERE id = ? AND initiative_id = ?`,
        [id, initiativeId]
      );

      return res.json({
        success: true,
        message: "Section updated.",
        section: updated[0],
      });
    } catch (error) {
      return publicError(res, error, "Unable to update section.");
    }
  }
);

// DELETE /admin/:slug/sections/:id
router.delete("/admin/:slug/sections/:id", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [result] = await pool.query(
      `DELETE FROM student_initiative_sections
       WHERE id = ? AND initiative_id = ?`,
      [req.params.id, initiativeId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    return res.json({
      success: true,
      message: "Section deleted.",
    });
  } catch (error) {
    return publicError(res, error, "Unable to delete section.");
  }
});

/* =========================================================
   ADMIN: SIDEBAR LINKS
========================================================= */

// GET /admin/:slug/sidebar
router.get("/admin/:slug/sidebar", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [sidebar] = await pool.query(
      `SELECT *
       FROM student_initiative_sidebar
       WHERE initiative_id = ?
       ORDER BY display_order ASC, id ASC`,
      [initiativeId]
    );

    return res.json({ success: true, sidebar });
  } catch (error) {
    return publicError(res, error, "Unable to load sidebar.");
  }
});

// POST /admin/:slug/sidebar
router.post("/admin/:slug/sidebar", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const {
      label,
      target,
      display_order = 0,
      is_active = 1,
    } = req.body;

    if (!label?.trim() || !target?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Sidebar label and target are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO student_initiative_sidebar
       (initiative_id, label, target, display_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        initiativeId,
        label.trim(),
        target.trim(),
        Number(display_order) || 0,
        Number(is_active) ? 1 : 0,
      ]
    );

    return res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Sidebar link created.",
    });
  } catch (error) {
    return publicError(res, error, "Unable to create sidebar link.");
  }
});

// PUT /admin/:slug/sidebar/:id
router.put("/admin/:slug/sidebar/:id", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM student_initiative_sidebar
       WHERE id = ? AND initiative_id = ? LIMIT 1`,
      [req.params.id, initiativeId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Sidebar link not found.",
      });
    }

    const current = rows[0];
    const label = req.body.label ?? current.label;
    const target = req.body.target ?? current.target;

    if (!String(label).trim() || !String(target).trim()) {
      return res.status(400).json({
        success: false,
        message: "Sidebar label and target are required.",
      });
    }

    await pool.query(
      `UPDATE student_initiative_sidebar
       SET label = ?, target = ?, display_order = ?, is_active = ?
       WHERE id = ? AND initiative_id = ?`,
      [
        String(label).trim(),
        String(target).trim(),
        req.body.display_order !== undefined
          ? Number(req.body.display_order) || 0
          : current.display_order,
        req.body.is_active !== undefined
          ? (Number(req.body.is_active) ? 1 : 0)
          : current.is_active,
        req.params.id,
        initiativeId,
      ]
    );

    return res.json({
      success: true,
      message: "Sidebar link updated.",
    });
  } catch (error) {
    return publicError(res, error, "Unable to update sidebar link.");
  }
});

// DELETE /admin/:slug/sidebar/:id
router.delete("/admin/:slug/sidebar/:id", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [result] = await pool.query(
      `DELETE FROM student_initiative_sidebar
       WHERE id = ? AND initiative_id = ?`,
      [req.params.id, initiativeId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Sidebar link not found.",
      });
    }

    return res.json({
      success: true,
      message: "Sidebar link deleted.",
    });
  } catch (error) {
    return publicError(res, error, "Unable to delete sidebar link.");
  }
});

/* =========================================================
   ADMIN: UNIT LEADERSHIP / HEADS
========================================================= */

// GET /admin/:slug/heads
router.get("/admin/:slug/heads", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [heads] = await pool.query(
      `SELECT * FROM student_initiative_heads
       WHERE initiative_id = ?
       ORDER BY id ASC`,
      [initiativeId]
    );

    return res.json({ success: true, heads });
  } catch (error) {
    return publicError(res, error, "Unable to load unit leadership.");
  }
});

// POST /admin/:slug/heads
router.post("/admin/:slug/heads", headUpload, async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const { name, designation } = req.body;

    if (!name?.trim() || !designation?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and designation are required.",
      });
    }

    const image = req.files?.profileImage?.[0];
    const pdf = req.files?.headPdf?.[0];

    const [result] = await pool.query(
      `INSERT INTO student_initiative_heads
       (initiative_id, name, designation, profile_image_url,
        qualification, experience, achievements,
        profile_file_title, profile_file_name, profile_file_url,
        is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        initiativeId,
        name.trim(),
        designation.trim(),
        fileUrl(image),
        req.body.qualification || null,
        req.body.experience || null,
        req.body.achievements || null,
        pdf ? (req.body.profile_file_title || pdf.originalname) : null,
        pdf ? pdf.originalname : null,
        fileUrl(pdf),
        req.body.is_active === undefined
          ? 1
          : (Number(req.body.is_active) ? 1 : 0),
      ]
    );

    return res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Unit leader created.",
    });
  } catch (error) {
    return publicError(res, error, "Unable to create unit leader.");
  }
});

// PUT /admin/:slug/heads/:id
router.put("/admin/:slug/heads/:id", headUpload, async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM student_initiative_heads
       WHERE id = ? AND initiative_id = ? LIMIT 1`,
      [req.params.id, initiativeId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Unit leader not found.",
      });
    }

    const current = rows[0];
    const image = req.files?.profileImage?.[0];
    const pdf = req.files?.headPdf?.[0];

    const value = (key) =>
      req.body[key] !== undefined ? req.body[key] : current[key];

    await pool.query(
      `UPDATE student_initiative_heads
       SET name = ?, designation = ?, profile_image_url = ?,
           qualification = ?, experience = ?, achievements = ?,
           profile_file_title = ?, profile_file_name = ?,
           profile_file_url = ?, is_active = ?
       WHERE id = ? AND initiative_id = ?`,
      [
        value("name"),
        value("designation"),
        image ? fileUrl(image) : current.profile_image_url,
        value("qualification"),
        value("experience"),
        value("achievements"),
        pdf
          ? (req.body.profile_file_title || pdf.originalname)
          : value("profile_file_title"),
        pdf ? pdf.originalname : value("profile_file_name"),
        pdf ? fileUrl(pdf) : current.profile_file_url,
        req.body.is_active !== undefined
          ? (Number(req.body.is_active) ? 1 : 0)
          : current.is_active,
        req.params.id,
        initiativeId,
      ]
    );

    return res.json({
      success: true,
      message: "Unit leader updated.",
    });
  } catch (error) {
    return publicError(res, error, "Unable to update unit leader.");
  }
});

// DELETE /admin/:slug/heads/:id
router.delete("/admin/:slug/heads/:id", async (req, res) => {
  try {
    const initiativeId = await getInitiativeId(req.params.slug);

    if (!initiativeId) {
      return res.status(404).json({
        success: false,
        message: "Initiative not found.",
      });
    }

    const [result] = await pool.query(
      `DELETE FROM student_initiative_heads
       WHERE id = ? AND initiative_id = ?`,
      [req.params.id, initiativeId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Unit leader not found.",
      });
    }

    return res.json({
      success: true,
      message: "Unit leader deleted.",
    });
  } catch (error) {
    return publicError(res, error, "Unable to delete unit leader.");
  }
});

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "File size exceeds the 10 MB limit."
          : error.message,
    });
  }

  if (error.message?.startsWith("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
});

export default router;