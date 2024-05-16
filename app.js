import express from "express";
import bodyParser from "body-parser";

import generatePDF from "./routes/generatePDF.js"
import savetodb from "./routes/saveToDB.js"
import createOrder  from "./routes/createOrder.js"
import sendMail from "./routes/sendMail.js"

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));

app.use("/createOrder", createOrder);
app.use("/savetodb", savetodb);
app.use('/generate-pdf',generatePDF);
app.use("/sendMail",sendMail);


app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
