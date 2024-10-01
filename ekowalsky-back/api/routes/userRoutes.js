const {register,login, getUser,updateUser} = require("../controller/userController");
const {images, messages, getSchools,createSchool,joinSchool, quitSchool, sendMessage} = require("../controller/schoolController")
const router = require('express').Router();
router.post("/register", register);
router.post("/login",login);
router.post("/getSchoolsOfUser", images)
router.post("/getMessages", messages)
router.post("/getSchools", getSchools)
router.post("/createSchool", createSchool)
router.post("/joinSchool", joinSchool)
router.post("/quitSchool", quitSchool)
router.post("/sendMessage",sendMessage)
router.post("/getUser", getUser)
router.post("/updateUser", updateUser)
router.post("/ping", (req, res) => {
    res.send("pong");
});
router.post("/", (req, res) => {
    res.send("Hello World");
});
module.exports = router;