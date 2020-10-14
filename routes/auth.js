const { Router } = require("express");
const User = require("../models/user");

const router = Router();

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Auth",
    isLogin: true,
  });
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findById("5f85e108248dcf140b74cca2");
    req.session.user = user;
    req.session.isAuthenticated = true;
    req.session.save((err) => {
      if (err) throw err;
      else {
        res.redirect("/");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

module.exports = router;
