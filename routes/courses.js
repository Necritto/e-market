const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();

    res.render("courses", {
      title: "Courses",
      isCourses: true,
      courses,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    res.render("course", {
      layout: "empty",
      title: `Course ${course.title}`,
      course,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  try {
    const course = await Course.findById(req.params.id);

    res.render("course-edit", {
      title: `Update course ${course.title}`,
      course,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/edit", auth, async (req, res) => {
  try {
    const { id } = req.body;
    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id });
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
