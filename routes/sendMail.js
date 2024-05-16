import express from "express";
import {sendMail} from '../controllers/sendMail.js'
const router=express.Router()

router.post("/", sendMail);

export default router;
