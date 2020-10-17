const { body } = require("express-validator");
const User = require("../models/user");

exports.regValidators = [
  body("email")
    .isEmail()
    .withMessage("Invalid email.")
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });

        if (user) {
          return Promise.reject("User with this email already exists");
        }
      } catch (err) {
        console.log(err);
      }
    })
    .normalizeEmail(),
  body("password", "The password must be at least 6 characters long.")
    .isLength({ min: 6, max: 32 })
    .isAlphanumeric()
    .trim(),
  body("confirm")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match.");
      }
      return true;
    })
    .trim(),
  body("name")
    .isLength({ min: 2 })
    .withMessage("The name must be at least 2 characters long.")
    .trim(),
];

exports.loginValidators = [
  body("email")
    .isEmail()
    .withMessage("Invalid email.")
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });

        if (!user) {
          return Promise.reject("User with this email does not exists");
        }
      } catch (err) {
        console.log(err);
      }
    })
    .normalizeEmail(),
  body("password", "The password must be at least 6 characters long.")
    .isLength({ min: 6, max: 32 })
    .isAlphanumeric()
    .trim(),
];
