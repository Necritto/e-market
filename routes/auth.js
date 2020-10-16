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
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = password === candidate.password;

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
        res.redirect("/auth/login#login");
      }
    } else {
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
      res.redirect("/auth/login#signup");
    } else {
      const user = new User({
        email,
        name,
        password,
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
