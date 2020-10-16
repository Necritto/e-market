const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");

const router = Router();

function mapCartItems(cart) {
  return cart.items.map((course) => ({
    ...course.courseId._doc,
    id: course.courseId.id,
    count: course.count,
  }));
}

function computePrice(courses) {
  return courses.reduce((acc, course) => {
    return (acc += course.price * course.count);
  }, 0);
}

router.post("/add", auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);
  res.redirect("/cart");
});

router.delete("/remove/:id", auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id);
  const user = await req.user.populate("cart.items.courseId").execPopulate();

  const courses = mapCartItems(user.cart);

  res.status(200).json({ courses, price: computePrice(courses) });
});

router.get("/", auth, async (req, res) => {
  const user = await req.user.populate("cart.items.courseId").execPopulate();

  const courses = mapCartItems(user.cart);

  res.render("cart", {
    title: "Cart",
    isCart: true,
    courses: courses,
    price: computePrice(courses),
  });
});

module.exports = router;
