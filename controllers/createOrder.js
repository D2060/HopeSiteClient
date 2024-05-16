import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();


const razorpayInstance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});

const createOrder=async(req, res) => {
    try {
      console.log("Creating order")
      const amount = req.body.amount * 100;
      const options = {
        amount: amount,
        currency: 'INR',
        receipt: req.body.email
      }
      razorpayInstance.orders.create(options, (err, order) => {
        if (order) {
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
}

export { createOrder };