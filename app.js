import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import generatePDF from "./routes/generatePDF.js";
import savetodb from "./routes/saveToDB.js";
import createOrder from "./routes/createOrder.js";
import sendMail from "./routes/sendMail.js";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'PAVAN@203',
  resave: false,
  saveUninitialized: true,
}));

app.use("/createOrder", createOrder);
app.use("/savetodb", savetodb);
app.use('/generate-pdf', generatePDF);
app.use("/sendMail", sendMail);
app.use("/admin", adminRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
