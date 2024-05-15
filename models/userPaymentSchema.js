import mongoose from 'mongoose';
const Schema=mongoose.Schema;

const paymentSchema = new Schema({
    year:String,
    email: String,
    ticketType:String,
    amount: Number,
    paymentId: String,
    paymentRefId:String,
    date:String,
    time:String
});

export const Payment = mongoose.model("Payment", paymentSchema);
