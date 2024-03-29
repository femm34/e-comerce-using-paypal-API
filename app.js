require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const paypal = require("paypal-rest-sdk");
const path = require("path");
const port = process.env.PORT || 3000;

const app = express();

app.set("views", path.join(__dirname, "views"));
const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs",
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/cancel", (req, res) => {
  res.render("cancel");
});

app.get("/success", (req, res) => {
  res.render("success");
});

app.post("/create", function (req, res) {
  const { name, price } = req.body;

  // Construir solicitud de pago de PayPal
  var payReq = {
    intent: "sale",
    redirect_urls: {
      return_url:
        "https://e-comerce-using-paypal-api-production.up.railway.app/process",
      cancel_url:
        "https://e-comerce-using-paypal-api-production.up.railway.app/cancel",
    },
    payer: {
      payment_method: "paypal",
    },
    transactions: [
      {
        amount: {
          total: price,
          currency: "USD",
        },
        description: name,
      },
    ],
  };

  paypal.payment.create(payReq, function (error, payment) {
    if (error) {
      console.error(error);
    } else {
      var links = {};
      payment.links.forEach(function (linkObj) {
        links[linkObj.rel] = {
          href: linkObj.href,
          method: linkObj.method,
        };
      });

      if (links.hasOwnProperty("approval_url")) {
        res.redirect(links["approval_url"].href);
      } else {
        console.error("no hay URI de redirección presente");
      }
    }
  });
});

app.get("/process", function (req, res) {
  var paymentId = req.query.paymentId;
  var payerId = { payer_id: req.query.PayerID };

  paypal.payment.execute(paymentId, payerId, function (error, payment) {
    if (error) {
      console.error(error);
    } else {
      if (payment.state == "approved") {
        res.redirect(
          "https://e-comerce-using-paypal-api-production.up.railway.app/success"
        );
      } else {
        res.redirect(
          "https://e-comerce-using-paypal-api-production.up.railway.app/cancel"
        );
      }
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});
