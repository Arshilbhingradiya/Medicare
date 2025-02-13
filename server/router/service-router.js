const express = require("express");
const router = express.Router();
const services = require("../controllers/service-controller");

router.route("/service").post(services);

module.exports = router;
