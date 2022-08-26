const nodemailer = require('nodemailer');
const handlebars = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.use(
  'compile',
  handlebars({
    viewEngine: {
      extName: '.handlebars',
      defaultLayout: false
    },
    viewPath: './views/'
  })
);
module.exports = transporter;
