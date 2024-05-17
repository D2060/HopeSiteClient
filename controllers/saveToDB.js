import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };
import dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hopehousesite89-default-rtdb.firebaseio.com/'
});

const db = admin.firestore();

const saveToDB = async (req, res) => {
  console.log("Entering /savetodb for saving database to server");
  console.log("receiving data ...");
  console.log("body is ", req.body);

  const currentDate = new Date();
  const paymentDate = currentDate.toLocaleDateString(); 
  const paymentTime = currentDate.toLocaleTimeString();

  const { year, email, ticketType, amount, paymentId, orderID } = req.body;
  const payment = {
    year: year,
    email: email,
    ticketType: ticketType,
    amount: amount,
    paymentId: paymentId,
    paymentRefId: orderID,
    date: paymentDate,
    time: paymentTime
  };
  console.log("Trying to save");
  try {
    await db.collection('payments').add(payment);
    console.log("Payment saved successfully");
  } catch (error) {
    console.error("Error saving payment:", error);
  }
  res.sendStatus(200);
};

export { saveToDB };
