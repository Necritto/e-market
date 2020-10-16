const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const router = Router();

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Auth",
    isLogin: true,
    regErr: req.flash("regErr"),
    loginErr: req.flash("loginErr"),
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }
          res.redirect("/");
        });
      } else {
        req.flash("loginErr", "Invalid password");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("loginErr", "User with this email does not exists");
      res.redirect("/auth/login#login");
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/signup", async (req, res) => {
  try {
    const { email, name, password, confirm } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      req.flash("regErr", "User with this email already exists");
      res.redirect("/auth/login#signup");
    } else {
      const hashPass = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        name,
        password: hashPass,
        confirm,
        cart: { items: [] },
      });

      await user.save();
      res.redirect("/auth/login#login");
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
