import express from "express";
import {saveToDB  } from "../controllers/saveToDB.js";

const app = express();

const  router=express.Router();

router.post("/", saveToDB);

export default router;
