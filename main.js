const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const fs = require("fs");

const baseAttachments = [
  {
    filename: "fb.png",
    path: "assets/fb.png",
    cid: "fb",
  },
  {
    filename: "ig.png",
    path: "assets/ig.png",
    cid: "ig",
  },
  {
    filename: "tw.png",
    path: "assets/tw.png",
    cid: "tw",
  },
  {
    filename: "ssLogo.png",
    path: "assets/ssLogo.png",
    cid: "ssLogo",
  },
];
const emailsTemplate = [
  {
    tag: "welcome",
    subject: "Welcome!",
    path: "welcome-email/index.html",
    attachments: [
      ...baseAttachments,
      {
        filename: "redMp.jpg",
        path: "welcome-email/img/redMp.jpg",
        cid: "redMp",
      },
    ],
  },
  {
    tag: "social",
    subject: "New 🔥",
    path: "social-template/index.html",
    attachments: [
      ...baseAttachments,
      {
        filename: "mediaPost.jpg",
        path: "social-template/img/mediaPost.jpg",
        cid: "mediaPost",
      },
    ],
  },
];

function pickTemplate(recievedArr) {
  if (recievedArr.includes("welcome")) {
    return emailsTemplate[1];
  }
  return emailsTemplate[0];
}

async function sendEmail(subject, recipiant, pathToEmailFile, attachments) {
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
      to: recipiant,
      subject: subject,
      html: htmlToSend,
      attachments: attachments,
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

async function updateRecieved(client, email, content) {
  await client
    .db("sneaker-society")
    .collection("emails")
    .updateOne({ email: email }, { $push: { recieved: content } });
}

async function logEmails(client) {
  const emails = await client
    .db("sneaker-society")
    .collection("emails")
    .find()
    .toArray();

  const emailArr = emails.map((email) => {
    return { email: email.email, recieved: email.recieved };
  });

  return emailArr;
}

async function main() {
  const uri =
    "mongodb+srv://ssadmin:ssadmin@cluster0.wbd12.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const emails = await logEmails(client);
    console.log(emails);

    for (const [i, email] of emails.entries()) {
      const template = pickTemplate(email.recieved);
      await sendEmail(
        template.subject,
        email.email,
        template.path,
        template.attachments
      );
      await updateRecieved(client, email.email, template.tag);
      // await updateRecieved(client, email.email, []);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
