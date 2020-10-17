const express = require("express");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const flash = require("connect-flash");
const keys = require("./keys");

const homeRouter = require("./routes/home");
const coursesRouter = require("./routes/courses");
const addRouter = require("./routes/add");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const authRouter = require("./routes/auth");
const varMiddleware = require("./middleware/var");
const userMiddleware = require("./middleware/user");
const errorMiddleware = require("./middleware/error");

const app = express();
const DB_CONN = process.env.DB_CONN;
const PORT = process.env.PORT || 3000;

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  handlebars: allowInsecurePrototypeAccess(handlebars),
  helpers: require("./utils/hbs-helpers"),
});

const store = new MongoStore({
  collection: "sessions",
  uri: DB_CONN,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csurf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRouter);
app.use("/courses", coursesRouter);
app.use("/add", addRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/auth", authRouter);

app.use(errorMiddleware);

async function start() {
  try {
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
