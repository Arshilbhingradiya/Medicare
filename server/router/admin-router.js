const express = require("express");
// const getAllUsers = require("../controllers/admin-controller");
// const getAllContacts = require("../controllers/admin-controller");
const admindata = require("../controllers/admin-controller");
const router  = express.Router();
const authMiddleware =require("../middleware/auth-middleware");
const adminMiddleware =require("../middleware/admin-middleware");


router.route("/users").get(authMiddleware,adminMiddleware,admindata.getAllUsers);
router.route("/users/delete/:id").delete(authMiddleware,adminMiddleware,admindata.getdeleteuserbyid);
router.route("/users/update/:id").patch(authMiddleware,adminMiddleware,admindata.updateuserbyid);
router.route("/users/:id").get(authMiddleware,adminMiddleware,admindata.userbyid);
router.route("/contacts").get(authMiddleware,adminMiddleware,admindata.getAllContacts);
router.route("/contacts/delete/:id").delete(authMiddleware,adminMiddleware,admindata.getdeleteContacts);


module.exports = router;