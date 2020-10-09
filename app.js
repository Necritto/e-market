const express = require("express");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const homeRouter = require("./routes/home");
const coursesRouter = require("./routes/courses");
const addRouter = require("./routes/add");
const cartRouter = require("./routes/cart");

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  handlebars: allowInsecurePrototypeAccess(handlebars),
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use("/", homeRouter);
app.use("/courses", coursesRouter);
app.use("/add", addRouter);
app.use("/cart", cartRouter);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const DB_CONN = process.env.DB_CONN;
    await mongoose.connect(DB_CONN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT} port...`);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
