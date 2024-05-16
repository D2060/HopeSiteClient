import express from "express";
import {generatePDF} from "../controllers/generatePDF.js"

const router=express.Router();

router.get('/', generatePDF);

export default router;

