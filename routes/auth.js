const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const regEmail = require("../emails/signup");
const resetEmail = require("../emails/reset");
const { regValidators, loginValidators } = require("../utils/validators");

const router = Router();

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: process.env.SG_API_KEY },
  })
);

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Auth",
    isLogin: true,
    regErr: req.flash("regErr"),
    loginErr: req.flash("loginErr"),
  });
});

router.post("/login", loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("loginErr", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#login");
    }

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
  } catch (err) {
    console.log(err);
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/signup", regValidators, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("regErr", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#signup");
    }

    const hashPass = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPass,
      cart: { items: [] },
    });

    await user.save();
    res.redirect("/auth/login#login");

    await transporter.sendMail(regEmail(email));
  } catch (err) {
    console.log(err);
  }
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Reset",
    error: req.flash("error"),
  });
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Something went wrong! Try again later.");
        return res.redirect("/auth/reset");
      }

      const token = buffer.toString("hex");
      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect("/auth/login#login");
      } else {
        req.flash("error", "User with this email does not exists!");
        return res.redirect("/auth/reset");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/password/:token", async (req, res) => {
  if (!req.params.token) {
    return res.redirect("/auth/login");
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect("/auth/login");
    } else {
      res.render("auth/password", {
        title: "Access recovery",
        error: req.flash("error"),
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect("/auth/login");
    } else {
      req.flash("loginErr", "Token has expired!");
      res.redirect("/auth/login");
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
