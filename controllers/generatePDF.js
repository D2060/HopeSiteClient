import PDFDocument from 'pdfkit';
import qr from 'qr-image';

import dotenv from "dotenv";
dotenv.config();


const generatePDF=async (req, res) => {
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
}

export {generatePDF}