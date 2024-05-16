import PDFDocument from 'pdfkit';
import qr from 'qr-image';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();
const sendMail=async (req, res) => {
    console.log("Entering /sendMail for sending mail");
    console.log("receiving data ...");
    console.log("body is ", req.body);
  
    const currentDate = new Date();
    const paymentDate = currentDate.toLocaleDateString(); 
    const paymentTime = currentDate.toLocaleTimeString();
  
    const { email, ticketType, amount, paymentId, orderID } = req.body;
  
    console.log("Trying to send mail ");
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL,
          pass: process.env.PASS
        }
      });
  
      // Create PDF dynamically using pdfkit
      const doc = new PDFDocument();
      doc.image('./public/hopehouse_logo.png', { fit: [500, 1000] }).moveDown(7)
      doc.fontSize(20).text('Hope House Ticket', { align: 'center' }).moveDown();
      doc.fontSize(20).text(ticketType, { align: 'center' }).moveDown();
      doc.fontSize(14).text(`Email: ${email}`).moveDown();
      doc.fontSize(14).text(`Ticket Type: ${ticketType}`).moveDown();
      doc.fontSize(14).text(`Amount: ${amount}`).moveDown();
      doc.fontSize(14).text(`Date and Time of Payment: ${paymentDate} ${paymentTime}`).moveDown();
      doc.fontSize(14).text(`Payment ID: ${paymentId}`).moveDown();
      doc.fontSize(14).text(`PaymentRef ID: ${orderID}`).moveDown();
  
      // Generate QR code for payment ID
      const qrImage = qr.imageSync(paymentId, { type: 'png' });
      doc.image(qrImage, { fit: [200, 200], align: 'center', valign: 'center' });
  
      // Create a buffer from the PDF content
      const pdfBuffer = await new Promise((resolve, reject) => {
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.end();
      });
  
      const mailOptions = {
        from: process.env.MAIL,
        to: email,
        subject: 'Hope House Ticket Information',
        html: `
          <h1><strong>Hope House Ticket Information</strong></h1>
          <p>Ticket Type: ${ticketType}</p>
          <p>Amount: ${amount}</p>
          <p>Date and Time of Payment: ${paymentDate} ${paymentTime}</p>
          <p>Payment ID: ${paymentId}</p>
          <p>PaymentRef ID: ${orderID}</p>
          <p>Please find the ticket attached below.</p>
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
  
      res.sendStatus(200);
    } catch (error) {
      console.error("Error sending email:", error);
      res.sendStatus(500);
    }
  }


  export {sendMail}