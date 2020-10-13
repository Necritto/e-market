const { Router } = require("express");
const Order = require("../models/order");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id }).populate(
      "user.userId"
    );

    res.render("orders", {
      isOrder: true,
      title: "Orders",
      orders: orders.map((order) => ({
        ...order._doc,
        price: order.courses.reduce((acc, course) => {
          return (acc += course.count * course.course.price);
        }, 0),
      })),
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId").execPopulate();

    const courses = user.cart.items.map((item) => ({
      count: item.count,
      course: { ...item.courseId._doc },
    }));

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
