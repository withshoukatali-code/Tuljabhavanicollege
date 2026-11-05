const db = require("../config/db");

const allowedCategories = [
    "ncc",
    "sports",
    "cultural",
    "career-guidance",
    "womens-empowerment"
];

const getActivity = async (slug) => {
    const [rows] = await db.query(
        `
        SELECT *
        FROM student_activities
        WHERE slug = ?
        LIMIT 1
        `,
        [slug]
    );

    return rows[0] || null;
};


/* =========================================================
   PUBLIC
========================================================= */

exports.getPublicActivity = async (req, res) => {

    try {

        const { slug } = req.params;

        const activity = await getActivity(slug);

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: "Activity not found"
            });
        }

        const [coordinators] = await db.query(
            `
            SELECT *
            FROM student_activity_coordinators
            WHERE activity_id = ?
              AND is_active = 1
            ORDER BY id ASC
            `,
            [activity.id]
        );

        const [items] = await db.query(
            `
            SELECT *
            FROM student_activity_items
            WHERE activity_id = ?
              AND is_active = 1
            ORDER BY
                display_order ASC,
                event_date DESC,
                id DESC
            `,
            [activity.id]
        );

        res.json({
            success: true,
            activity,
            coordinator: coordinators[0] || null,
            coordinators,
            items
        });

    } catch (error) {

        console.error(
            "getPublicActivity:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


/* =========================================================
   ADMIN - ACTIVITIES
========================================================= */

exports.getAdminActivities = async (req, res) => {

    try {

        const [rows] = await db.query(
            `
            SELECT *
            FROM student_activities
            ORDER BY display_order ASC, id ASC
            `
        );

        res.json({
            success: true,
            activities: rows
        });

    } catch (error) {

        console.error(
            "getAdminActivities:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.getAdminActivity = async (req, res) => {

    try {

        const { id } = req.params;

        const [activityRows] = await db.query(
            `
            SELECT *
            FROM student_activities
            WHERE id = ?
            `,
            [id]
        );

        if (!activityRows.length) {
            return res.status(404).json({
                success: false,
                message: "Activity not found"
            });
        }

        const activity = activityRows[0];

        const [coordinators] = await db.query(
            `
            SELECT *
            FROM student_activity_coordinators
            WHERE activity_id = ?
            ORDER BY id ASC
            `,
            [id]
        );

        const [items] = await db.query(
            `
            SELECT *
            FROM student_activity_items
            WHERE activity_id = ?
            ORDER BY display_order ASC, id DESC
            `,
            [id]
        );

        res.json({
            success: true,
            activity,
            coordinators,
            items
        });

    } catch (error) {

        console.error(
            "getAdminActivity:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.updateActivity = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            subtitle,
            description,
            display_order,
            is_active
        } = req.body;

        await db.query(
            `
            UPDATE student_activities
            SET
                title = ?,
                subtitle = ?,
                description = ?,
                display_order = ?,
                is_active = ?
            WHERE id = ?
            `,
            [
                title,
                subtitle || null,
                description || null,
                Number(display_order || 0),
                Number(is_active ?? 1),
                id
            ]
        );

        res.json({
            success: true,
            message: "Activity updated successfully"
        });

    } catch (error) {

        console.error(
            "updateActivity:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


/* =========================================================
   ADMIN - COORDINATOR
========================================================= */

exports.saveCoordinator = async (req, res) => {

    try {

        const {
            activity_id,
            coordinator_id,
            name,
            designation,
            achievements,
            qualification,
            experience,
            profile_file_title
        } = req.body;

        if (!activity_id || !name) {
            return res.status(400).json({
                success: false,
                message: "Activity and coordinator name are required"
            });
        }

        let profile_file_name = null;
        let profile_file_url = null;

        if (req.file) {

            profile_file_name =
                req.file.filename;

            profile_file_url =
                `/uploads/student-activities/${req.file.filename}`;
        }

        if (coordinator_id) {

            if (req.file) {

                await db.query(
                    `
                    UPDATE student_activity_coordinators
                    SET
                        name = ?,
                        designation = ?,
                        achievements = ?,
                        qualification = ?,
                        experience = ?,
                        profile_file_title = ?,
                        profile_file_name = ?,
                        profile_file_url = ?
                    WHERE id = ?
                    `,
                    [
                        name,
                        designation || null,
                        achievements || null,
                        qualification || null,
                        experience || null,
                        profile_file_title || null,
                        profile_file_name,
                        profile_file_url,
                        coordinator_id
                    ]
                );

            } else {

                await db.query(
                    `
                    UPDATE student_activity_coordinators
                    SET
                        name = ?,
                        designation = ?,
                        achievements = ?,
                        qualification = ?,
                        experience = ?,
                        profile_file_title = ?
                    WHERE id = ?
                    `,
                    [
                        name,
                        designation || null,
                        achievements || null,
                        qualification || null,
                        experience || null,
                        profile_file_title || null,
                        coordinator_id
                    ]
                );
            }

        } else {

            await db.query(
                `
                INSERT INTO student_activity_coordinators
                (
                    activity_id,
                    name,
                    designation,
                    achievements,
                    qualification,
                    experience,
                    profile_file_title,
                    profile_file_name,
                    profile_file_url
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    activity_id,
                    name,
                    designation || null,
                    achievements || null,
                    qualification || null,
                    experience || null,
                    profile_file_title || null,
                    profile_file_name,
                    profile_file_url
                ]
            );
        }

        res.json({
            success: true,
            message: "Coordinator saved successfully"
        });

    } catch (error) {

        console.error(
            "saveCoordinator:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.deleteCoordinator = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(
            `
            DELETE FROM student_activity_coordinators
            WHERE id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Coordinator deleted successfully"
        });

    } catch (error) {

        console.error(
            "deleteCoordinator:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


/* =========================================================
   ADMIN - ACTIVITY ITEMS / REPORTS
========================================================= */

exports.saveItem = async (req, res) => {

    try {

        const {
            activity_id,
            item_id,
            academic_year,
            title,
            event_date,
            description,
            file_title,
            display_order,
            is_active
        } = req.body;

        if (!activity_id || !title) {
            return res.status(400).json({
                success: false,
                message: "Activity and title are required"
            });
        }

        let file_name = null;
        let file_url = null;

        if (req.file) {

            file_name =
                req.file.filename;

            file_url =
                `/uploads/student-activities/${req.file.filename}`;
        }

        if (item_id) {

            if (req.file) {

                await db.query(
                    `
                    UPDATE student_activity_items
                    SET
                        academic_year = ?,
                        title = ?,
                        event_date = ?,
                        description = ?,
                        file_title = ?,
                        file_name = ?,
                        file_url = ?,
                        display_order = ?,
                        is_active = ?
                    WHERE id = ?
                    `,
                    [
                        academic_year || null,
                        title,
                        event_date || null,
                        description || null,
                        file_title || null,
                        file_name,
                        file_url,
                        Number(display_order || 0),
                        Number(is_active ?? 1),
                        item_id
                    ]
                );

            } else {

                await db.query(
                    `
                    UPDATE student_activity_items
                    SET
                        academic_year = ?,
                        title = ?,
                        event_date = ?,
                        description = ?,
                        file_title = ?,
                        display_order = ?,
                        is_active = ?
                    WHERE id = ?
                    `,
                    [
                        academic_year || null,
                        title,
                        event_date || null,
                        description || null,
                        file_title || null,
                        Number(display_order || 0),
                        Number(is_active ?? 1),
                        item_id
                    ]
                );
            }

        } else {

            await db.query(
                `
                INSERT INTO student_activity_items
                (
                    activity_id,
                    academic_year,
                    title,
                    event_date,
                    description,
                    file_title,
                    file_name,
                    file_url,
                    display_order,
                    is_active
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    activity_id,
                    academic_year || null,
                    title,
                    event_date || null,
                    description || null,
                    file_title || null,
                    file_name,
                    file_url,
                    Number(display_order || 0),
                    Number(is_active ?? 1)
                ]
            );
        }

        res.json({
            success: true,
            message: "Activity/report saved successfully"
        });

    } catch (error) {

        console.error(
            "saveItem:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.deleteItem = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(
            `
            DELETE FROM student_activity_items
            WHERE id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Activity/report deleted successfully"
        });

    } catch (error) {

        console.error(
            "deleteItem:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};