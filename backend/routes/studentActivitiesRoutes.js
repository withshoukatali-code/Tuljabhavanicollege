const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const controller = require(
    "../controllers/studentActivitiesController"
);


/* =========================================================
   PUBLIC
========================================================= */

router.get(
    "/public/:slug",
    controller.getPublicActivity
);


/* =========================================================
   ADMIN
========================================================= */

router.get(
    "/admin",
    controller.getAdminActivities
);

router.get(
    "/admin/:id",
    controller.getAdminActivity
);

router.put(
    "/admin/:id",
    controller.updateActivity
);


/* Coordinator */

router.post(
    "/admin/coordinator",
    upload.single("profile"),
    controller.saveCoordinator
);

router.delete(
    "/admin/coordinator/:id",
    controller.deleteCoordinator
);


/* Activities / Reports */

router.post(
    "/admin/item",
    upload.single("file"),
    controller.saveItem
);

router.delete(
    "/admin/item/:id",
    controller.deleteItem
);


module.exports = router;