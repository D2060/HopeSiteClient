import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import Razorpay from 'razorpay';
import PDFDocument from 'pdfkit';
import qr from 'qr-image';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch'; 

import { Payment } from "./models/userPaymentSchema.js";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect("mongodb://localhost:27017/Hope");

const app = express();


app.use(bodyParser.json());
app.use(express.json());

app.use(express.static("public"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_uvjbdK5ihnCJM0",
  key_secret: "Cu7t2dnZa7i7qdk6vYcoXbc6"
});

app.post("/createOrder", async(req, res) => {
  try {
    console.log("Creating order")
    const amount = req.body.amount * 100;
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: req.body.email
    }
    razorpayInstance.orders.create(options, (err, order) => {
      if(order) {
        console.log("Creating order completed")
        res.status(200).json({
          success: true,
          msg: 'Order Created',
          order_id: order.id,
          amount: amount,
          key_id: "rzp_test_uvjbdK5ihnCJM0",
          email: req.body.email
        });
      } else {
        console.log("Error creating order:", err);
        res.status(400).json({ success: false, msg: 'Unable to create Order!' });
      }
    });
  } catch (error) {
    console.log("Error creating order:", error.message);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  }
});

app.post("/savetodb", async (req, res) => {
  console.log("Entering /savetodb for saving database to server");
  console.log("receiving data ...");
  console.log("body is ", req.body);

  const currentDate = new Date();
  const paymentDate = currentDate.toLocaleDateString(); 
  const paymentTime = currentDate.toLocaleTimeString();

  const { year, email, ticketType, amount, paymentId, orderID } = req.body;
  const payment = new Payment({
    year: year,
    email: email,
    ticketType: ticketType,
    amount: amount,
    paymentId: paymentId,
    paymentRefId:orderID,
    date:paymentDate,
    time:paymentTime
  });
  console.log("Trying to save");
  try {
    await payment.save();
    console.log("Payment saved successfully");
  } catch (error) {
    console.error("Error saving payment:", error);
  }
  res.sendStatus(200);
});

app.get('/generate-pdf', (req, res) => {
  console.log("Making PDF");
  console.log(req.query)
  const { email, ticket_type, paymentId, amount ,paymentRefId} = req.query;

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=HopeHouseTicket_${paymentId}.pdf`);
  doc.pipe(res);

  const currentDate = new Date();
  const paymentDate = currentDate.toLocaleDateString(); 
  const paymentTime = currentDate.toLocaleTimeString(); 

  doc.image('./public/hopehouse_logo.png', { fit: [500, 1000] }).moveDown(7)
  doc.fontSize(20).text('Hope House Ticket', { align: 'center' }).moveDown();
  doc.fontSize(20).text(`${ticket_type}`, { align: 'center' }).moveDown();
  doc.fontSize(14).text(`Email: ${email}`).moveDown();
  doc.fontSize(14).text(`Ticket Type: ${ticket_type}`).moveDown();
  doc.fontSize(14).text(`Amount : ${amount}`).moveDown();
  doc.fontSize(14).text(`Date and Time of Payment : ${paymentDate} ${paymentTime}`).moveDown();
  doc.fontSize(14).text(`Payment ID: ${paymentId}`).moveDown();
  doc.fontSize(14).text(`PaymentRef ID: ${paymentRefId}`).moveDown();

  const qrImage = qr.imageSync(paymentId, { type: 'png' });
  doc.image(qrImage, { fit: [200, 200], align: 'center', valign: 'center' });

  doc.end();
  console.log("PDF making is Done");
});



app.post("/sendMail", async (req, res) => {
  console.log("Entering /sendMail for sending mail");
  console.log("receiving data ...");
  console.log("body is ", req.body);

  const currentDate = new Date();
  const paymentDate = currentDate.toLocaleDateString(); 
  const paymentTime = currentDate.toLocaleTimeString();

  const { year, email, ticketType, amount, paymentId, orderID } = req.body;

  console.log("Trying to send mail ");
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASS
      }
    });

    const pdfUrl = `http://localhost:${process.env.PORT}/generate-pdf?email=${email}&ticket_type=${ticketType}&amount=${amount}&paymentId=${paymentId}&paymentRefId=${orderID}`;
    
    fetch(pdfUrl)
      .then(res => res.arrayBuffer())
      .then(pdfArrayBuffer => {
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        
        const mailOptions = {
          from: process.env.MAIL,
          to: email,
          subject: 'Hope House Ticket Information',
          html: 
          `
              <p><strong>Hope House Ticket Information</strong></p>
              <p>Ticket Type: ${ticketType}</p>
              <p>Amount: ${amount}</p>
              <p>Date and Time of Payment: ${paymentDate} ${paymentTime}</p>
              <p>Payment ID: ${paymentId}</p>
              <p>PaymentRef ID: ${orderID}</p>
              <p>Please find the ticket attached below here.</p>
            `,
          attachments: [{
            filename: `HopeHouseTicket_${paymentId}.pdf`, // Name of the attached file
            content: pdfBuffer // Buffer containing the PDF content
          }]
        };

        // Send email with attachment
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      })
      .catch(error => {
        console.log('Error fetching PDF:', error);
      });
  } catch (error) {
    console.error("Error saving payment:", error);
  }
  res.sendStatus(200);
});
