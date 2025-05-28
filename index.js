const express = require('express');
const  OpenAI =require("openai");
const replyfromgpt= require('./call_gpt.js');
const createuser=require('./sendmessage.js')
const app = express();
const port = 8080;

app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.get("/",(req,res)=>{
  res.send("app is running");
})

app.post('/whatsapp', async(req, res) => {
  const from = req.body?.From;
  const body = req.body?.Body;

  const Nummedia= req.body?.NumMedia || 0;
  if(Nummedia>0 && req.body?.MediaContentType0.startsWith('audio/')){
    const audioUrl = req.body?.MediaUrl0;
    console.log(`Received audio message from ${from}: ${audioUrl}`);
    return res.send(`
      <Response>
        <Message>Audio messages received from ${from}.</Message>
      </Response>
    `);
  }


  if (!from || !body) {
      console.log('⚠️ Incoming webhook missing "From" or "Body". Raw body:', req.body.toString());
      return res.sendStatus(400);
    }
  console.log(`Message from ${from}: ${body}`);
  try{
  const responsefromgpt=await replyfromgpt(body);
  console.log(`Response from GPT: ${responsefromgpt}`);
  await createuser( from,responsefromgpt);
     
  }catch(error){
    console.log('Error:', error);
    res.status(500).send(`
      <Response>
        <Message>Sorry, something went wrong. Please try again later.</Message>
      </Response>
    `);
  }

});

app.post('/message-status', (req, res) => {
  const { MessageStatus, To } = req.body;
  console.log(`Message to ${To} status: ${MessageStatus}`);

  if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
    // Fallback: retry, log, or notify elsewhere
  }

  res.sendStatus(200);
});

module.exports = app;


