const express = require("express");
const router=express.Router();
const contactform = require("../controllers/contact-controller");

// router.route('/contact').post(authController.contactform);

router.post('/contact',contactform);

module.exports = router;