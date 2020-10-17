const { EMAIL_FROM, BASE_URL } = require("../keys");

module.exports = function (email) {
  return {
    to: email,
    from: EMAIL_FROM,
    subject: "Account created",
    html: `
      <h1>Welcome to our shop!</h1>
      <p>You successful created with email - ${email}</p>
      <hr />
      <a href="${BASE_URL}" target="_blank" rel="noopener noreferrer">Our e-market</a>
    `,
  };
};
