const {register,login, getUser,updateUser} = require("../controller/userController");
const {images, messages, getGroups,createGroup,joinGroup, quitGroup, sendMessage} = require("../controller/groupController")
const router = require('express').Router();
router.post("/register", register);
router.post("/login",login);
router.post("/getGroupsOfUser", images)
router.post("/getMessages", messages)
router.post("/getGroups", getGroups)
router.post("/createGroup", createGroup)
router.post("/joinGroup", joinGroup)
router.post("/quitGroup", quitGroup)
router.post("/sendMessage",sendMessage)
router.post("/getUser", getUser)
router.post("/updateUser", updateUser)
router.post("/ping", (req, res) => {
    res.send("pong");
});
router.get("/ping", (req, res) => {
    res.send("pong");
});
router.post("/", (req, res) => {
    res.send("Hello World");
});
router.get("/", (req, res) => {
    res.send("Hello World");
});
module.exports = router;