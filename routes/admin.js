import express from "express";
import db from '../firebase.js'
const router = express.Router();



router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Replace with your own authentication logic
  if (username === 'admin' && password === 'HopeSite@2023') {
    req.session.loggedIn = true;
    res.redirect('/admin/scan');
  } else {
    res.redirect('/admin/login');
  }
});

router.get('/scan', (req, res) => {
  if (req.session.loggedIn) {
    res.render('scan');
  } else {
    res.redirect('/admin/login');
  }
});

router.post('/scan', async (req, res) => {
    const { paymentId } = req.body;
    console.log(paymentId)


    const docRef = await db.collection('payments').doc(paymentId).get();
  
    if (!docRef.exists) {
      res.json({ valid: false, message: 'Ticket is not valid' });
    }else {
    const ticket = docRef.data();

    if(ticket.used){
        res.json({valid:false,message:"Ticket is already used!"})
    }else{
        await db.collection('payments').doc(paymentId).update({used:true})
        res.json({ valid: true, ticket ,message:"Valid Ticket"});
    }

  }
});

export default router;
