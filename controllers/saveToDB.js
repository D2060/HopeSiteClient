import mongoose from "mongoose";

import { Payment } from "../models/userPaymentSchema.js";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect("mongodb://localhost:27017/Hope");
const saveToDB=async (req, res) => {
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
  }

  export {saveToDB}