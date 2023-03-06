const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const fs = require("fs");

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

async function sendEmail(subject, recipiant, pathToEmailFile) {
  try {
    const source = fs.readFileSync(pathToEmailFile, "utf-8").toString();
    const template = Handlebars.compile(source);
    const replacements = {
      email: recipiant,
    };
    const htmlToSend = template(replacements);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "customer.service@thesneakerssociety.com",
        pass: "izpqadsgiuvuuydh",
      },
    });

    const mailOptions = {
      from: "alanis.yates@thesneakerssociety.com",
      to: "alanis.yates@thesneakerssociety.com",
      subject: subject,
      //   text: "YOOOOOOO THIS WORKED",
      html: htmlToSend,
      attachments: [
        {
          filename: "fb.png",
          path: "/Users/alanisyates/Documents/dev/ss_scripts/emails-emailify-html-06-Mar-2023-161614/social-template/img/fb.png",
          cid: "fb",
        },
        {
          filename: "ig.png",
          path: "/Users/alanisyates/Documents/dev/ss_scripts/emails-emailify-html-06-Mar-2023-161614/social-template/img/ig.png",
          cid: "ig",
        },
        {
          filename: "yt.png",
          path: "/Users/alanisyates/Documents/dev/ss_scripts/emails-emailify-html-06-Mar-2023-161614/social-template/img/yt.png",
          cid: "yt",
        },
        {
          filename: "tw.png",
          path: "/Users/alanisyates/Documents/dev/ss_scripts/emails-emailify-html-06-Mar-2023-161614/social-template/img/tw.png",
          cid: "tw",
        },
        {
          filename: "ssLogo.png",
          path: "/Users/alanisyates/Documents/dev/ss_scripts/emails-emailify-html-06-Mar-2023-161614/social-template/img/ssLogo.png",
          cid: "ssLogo",
        },
        {
          filename: "redMp.jpg",
          path: "emails-emailify-html-06-Mar-2023-164417/welcome-email/img/redMp.jpg",
          cid: "redMp",
        },
      ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function logEmails(client) {
  const emails = await client
    .db("sneaker-society")
    .collection("emails")
    .find()
    .toArray();
  const emailArr = emails.map((email) => email.email);

  return emailArr;
}

async function main() {
  const uri =
    "mongodb+srv://ssadmin:ssadmin@cluster0.wbd12.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const emails = await logEmails(client);

    await sendEmail(
      "this is a test",
      "URGENT",
      "/Users/alanisyates/Documents/dev/ss_scripts/emails-emailify-html-06-Mar-2023-164417/welcome-email/index.html"
    );
    console.log(emails);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
