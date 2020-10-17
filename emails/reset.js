const { EMAIL_FROM, BASE_URL } = require("../keys");

module.exports = function (email, token) {
  return {
    to: email,
    from: EMAIL_FROM,
    subject: "Reset password",
    html: `
      <h1>Access recovery</h1>
      <p>If you have not forgotten the password for your account, then ignore this letter.</p>
      <p>Otherwise click the link below:</p>
      <br />
      <p><a href="${BASE_URL}/auth/password/${token}" target="_blank" rel="noopener noreferrer">recovery link</a></p>
      <hr />
      <a href="${BASE_URL}" target="_blank" rel="noopener noreferrer">Our e-market</a>
    `,
  };
};
