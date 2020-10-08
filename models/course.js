const { v4 } = require("uuid");
const fs = require("fs");
const path = require("path");

class Course {
  constructor(title, price, img) {
    this.id = v4();
    this.title = title;
    this.price = price;
    this.img = img;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      price: this.price,
      img: this.img,
    };
  }

  async save() {
    const courses = await Course.getAll();
    courses.push(this.toJSON());

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, "..", "db", "courses.json"),
        JSON.stringify(courses),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, "..", "db", "courses.json"),
        "utf-8",
        (err, content) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(content));
          }
        }
      );
    });
  }
}

module.exports = Course;
