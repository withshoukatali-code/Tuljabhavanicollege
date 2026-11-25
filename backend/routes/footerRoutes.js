
import express from "express";
import db from "../config/db.js";

const router = express.Router();

const FOOTER_LINKS_TABLE = "footer_links";

/*
|--------------------------------------------------------------------------
| MAIN FOOTER DATABASE FIELDS
|--------------------------------------------------------------------------
*/

const FOOTER_FIELDS = [
  "college_name",
  "tagline",
  "description",
  "affiliation",
  "established_year",
  "naac_grade",
  "address",
  "phone",
  "email",
  "logo",

  "principal_name",
  "principal_designation",
  "principal_mobile",

  "administration_name",
  "administration_designation",
  "administration_mobile",

  "grievance_name",
  "grievance_designation",
  "grievance_mobile",

  "facilitation_name",
  "facilitation_designation",
  "facilitation_mobile",

  "library_name",
  "library_designation",
  "library_mobile",

  "placement_name",
  "placement_designation",
  "placement_mobile",

  "anti_ragging_name",
  "anti_ragging_designation",
  "anti_ragging_mobile",

  "women_harassment_name",
  "women_harassment_designation",
  "women_harassment_mobile",

  "women_empowerment_name",
  "women_empowerment_designation",
  "women_empowerment_mobile",

  "copyright_text",
  "developer_name",
  "developer_text",
  "developer_url",

  "is_active",
];

/*
|--------------------------------------------------------------------------
| COMMON HELPERS
|--------------------------------------------------------------------------
*/

const normalizeStatus = (value, defaultValue = 1) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  ) ? 1 : 0;
};

const normalizeFooter = (body = {}) => {
  const data = {};

  FOOTER_FIELDS.forEach((field) => {
    if (field === "is_active") {
      data[field] = normalizeStatus(body[field], 1);
    } else {
      data[field] = body[field] ?? null;
    }
  });

  if (data.college_name !== null) {
    data.college_name = String(data.college_name).trim();
  }

  return data;
};

const validateFooter = (data) => {
  if (!data.college_name) {
    return "College name is required.";
  }

  if (String(data.college_name).length > 255) {
    return "College name cannot exceed 255 characters.";
  }

  return null;
};

const normalizeLink = (body = {}) => {
  const displayOrder =
    body.display_order === undefined ||
    body.display_order === ""
      ? 0
      : Number(body.display_order);

  return {
    section_title: String(body.section_title ?? "").trim(),
    link_title: String(body.link_title ?? "").trim(),
    link_url: String(body.link_url ?? "").trim(),
    open_new_tab: normalizeStatus(body.open_new_tab, 0),
    display_order: displayOrder,
    is_active: normalizeStatus(body.is_active, 1),
  };
};

const validateLink = (data) => {
  if (
    !data.section_title ||
    !data.link_title ||
    !data.link_url
  ) {
    return "Section title, link title and URL are required.";
  }

  if (
    data.section_title.length > 255 ||
    data.link_title.length > 255 ||
    data.link_url.length > 1000
  ) {
    return "One or more footer link fields exceed the allowed length.";
  }

  if (!Number.isSafeInteger(data.display_order)) {
    return "Display order must be a valid integer.";
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| 1. GET PUBLIC FOOTER
|--------------------------------------------------------------------------
| GET /api/footer
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM footer
      WHERE is_active = 1
      ORDER BY id DESC
      LIMIT 1
    `);

    return res.status(200).json({
      success: true,
      data: rows.length ? rows[0] : null,
      message: rows.length
        ? "Footer fetched successfully."
        : "No active footer found.",
    });

  } catch (error) {
    console.error("GET PUBLIC FOOTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch footer.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 2. GET ADMIN FOOTER
|--------------------------------------------------------------------------
| GET /api/footer/admin
|
| IMPORTANT:
| Returns one object, not an array.
| Your existing React component expects data.id.
|--------------------------------------------------------------------------
*/

router.get("/admin", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM footer
      ORDER BY id DESC
      LIMIT 1
    `);

    return res.status(200).json({
      success: true,
      data: rows.length ? rows[0] : null,
    });

  } catch (error) {
    console.error("GET ADMIN FOOTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin footer.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 3. CREATE MAIN FOOTER
|--------------------------------------------------------------------------
| POST /api/footer
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
  try {
    const data = normalizeFooter(req.body);
    const validationError = validateFooter(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const columns = FOOTER_FIELDS;
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((field) => data[field]);

    const [result] = await db.query(
      `
      INSERT INTO footer (${columns.join(", ")})
      VALUES (${placeholders})
      `,
      values
    );

    const [rows] = await db.query(
      "SELECT * FROM footer WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Footer created successfully.",
      data: rows[0],
    });

  } catch (error) {
    console.error("CREATE FOOTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create footer.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 4. UPDATE MAIN FOOTER
|--------------------------------------------------------------------------
| PUT /api/footer/:id
|--------------------------------------------------------------------------
*/

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid footer ID.",
      });
    }

    const [existingRows] = await db.query(
      "SELECT * FROM footer WHERE id = ?",
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Footer record not found.",
      });
    }

    // Preserve existing values for fields omitted by the React form.
    const mergedData = {
      ...existingRows[0],
      ...req.body,
    };

    const data = normalizeFooter(mergedData);
    const validationError = validateFooter(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const setClause = FOOTER_FIELDS
      .map((field) => `${field} = ?`)
      .join(", ");

    const values = FOOTER_FIELDS.map(
      (field) => data[field]
    );

    await db.query(
      `UPDATE footer SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    const [updatedRows] = await db.query(
      "SELECT * FROM footer WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Footer updated successfully.",
      data: updatedRows[0],
    });

  } catch (error) {
    console.error("UPDATE FOOTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update footer.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 5. DELETE MAIN FOOTER
|--------------------------------------------------------------------------
| DELETE /api/footer/:id
|--------------------------------------------------------------------------
*/

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid footer ID.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM footer WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Footer record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Footer deleted successfully.",
    });

  } catch (error) {
    console.error("DELETE FOOTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete footer.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 6. TOGGLE MAIN FOOTER STATUS
|--------------------------------------------------------------------------
| PATCH /api/footer/:id/toggle
|--------------------------------------------------------------------------
*/

router.patch("/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid footer ID.",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM footer WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Footer record not found.",
      });
    }

    const newStatus = normalizeStatus(
      req.body?.is_active,
      Number(rows[0].is_active) === 1 ? 0 : 1
    );

    await db.query(
      "UPDATE footer SET is_active = ? WHERE id = ?",
      [newStatus, id]
    );

    const [updatedRows] = await db.query(
      "SELECT * FROM footer WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Footer status updated successfully.",
      data: updatedRows[0],
    });

  } catch (error) {
    console.error("TOGGLE FOOTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update footer status.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 7. GET PUBLIC FOOTER LINKS
|--------------------------------------------------------------------------
| GET /api/footer/links
|--------------------------------------------------------------------------
*/

router.get("/links", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM \`${FOOTER_LINKS_TABLE}\`
      WHERE is_active = 1
      ORDER BY section_title ASC, display_order ASC, id ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("GET PUBLIC FOOTER LINKS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch footer links.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 8. GET ADMIN FOOTER LINKS
|--------------------------------------------------------------------------
| GET /api/footer/links/admin
|--------------------------------------------------------------------------
*/

router.get("/links/admin", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM \`${FOOTER_LINKS_TABLE}\`
      ORDER BY section_title ASC, display_order ASC, id ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("GET ADMIN FOOTER LINKS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin footer links.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 9. ADD FOOTER LINK
|--------------------------------------------------------------------------
| POST /api/footer/links
|--------------------------------------------------------------------------
*/

router.post("/links", async (req, res) => {
  try {
    const data = normalizeLink(req.body);
    const validationError = validateLink(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO \`${FOOTER_LINKS_TABLE}\`
      (
        section_title,
        link_title,
        link_url,
        open_new_tab,
        display_order,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.section_title,
        data.link_title,
        data.link_url,
        data.open_new_tab,
        data.display_order,
        data.is_active,
      ]
    );

    const [rows] = await db.query(
      `SELECT * FROM \`${FOOTER_LINKS_TABLE}\` WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Footer link added successfully.",
      data: rows[0],
    });

  } catch (error) {
    console.error("ADD FOOTER LINK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add footer link.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 10. UPDATE FOOTER LINK
|--------------------------------------------------------------------------
| PUT /api/footer/links/:id
|--------------------------------------------------------------------------
*/

router.put("/links/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid footer link ID.",
      });
    }

    const [existingRows] = await db.query(
      `SELECT * FROM \`${FOOTER_LINKS_TABLE}\` WHERE id = ?`,
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Footer link not found.",
      });
    }

    const data = normalizeLink({
      ...existingRows[0],
      ...req.body,
    });

    const validationError = validateLink(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await db.query(
      `
      UPDATE \`${FOOTER_LINKS_TABLE}\`
      SET
        section_title = ?,
        link_title = ?,
        link_url = ?,
        open_new_tab = ?,
        display_order = ?,
        is_active = ?
      WHERE id = ?
      `,
      [
        data.section_title,
        data.link_title,
        data.link_url,
        data.open_new_tab,
        data.display_order,
        data.is_active,
        id,
      ]
    );

    const [updatedRows] = await db.query(
      `SELECT * FROM \`${FOOTER_LINKS_TABLE}\` WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Footer link updated successfully.",
      data: updatedRows[0],
    });

  } catch (error) {
    console.error("UPDATE FOOTER LINK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update footer link.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 11. DELETE FOOTER LINK
|--------------------------------------------------------------------------
| DELETE /api/footer/links/:id
|--------------------------------------------------------------------------
*/

router.delete("/links/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid footer link ID.",
      });
    }

    const [result] = await db.query(
      `DELETE FROM \`${FOOTER_LINKS_TABLE}\` WHERE id = ?`,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Footer link not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Footer link deleted successfully.",
    });

  } catch (error) {
    console.error("DELETE FOOTER LINK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete footer link.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 12. TOGGLE FOOTER LINK STATUS
|--------------------------------------------------------------------------
| PATCH /api/footer/links/:id/toggle
|--------------------------------------------------------------------------
*/

router.patch("/links/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid footer link ID.",
      });
    }

    const [rows] = await db.query(
      `SELECT is_active FROM \`${FOOTER_LINKS_TABLE}\` WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Footer link not found.",
      });
    }

    const newStatus =
      Number(rows[0].is_active) === 1 ? 0 : 1;

    await db.query(
      `
      UPDATE \`${FOOTER_LINKS_TABLE}\`
      SET is_active = ?
      WHERE id = ?
      `,
      [newStatus, id]
    );

    const [updatedRows] = await db.query(
      `SELECT * FROM \`${FOOTER_LINKS_TABLE}\` WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Footer link status updated successfully.",
      data: updatedRows[0],
    });

  } catch (error) {
    console.error("TOGGLE FOOTER LINK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update footer link status.",
      error: error.message,
    });
  }
});

export default router;
