import dotenv from 'dotenv';
dotenv.config();
const accountSid = process.env.TWILIO_SID; 
const authToken = process.env.TWILIO_AUTH; 
const twilioNumber = process.env.TWILIO_PHONE; 
import pkg from 'twilio';
const { Twilio } = pkg;
const client = new Twilio(accountSid, authToken);

const messageSlipt=(message)=>{
  const maxlength=1500;
  if (message.length <= maxlength) {
    return [message];
  }
  const junck=[];
  for(let i=0;i< message.length;i+=maxlength){
    junck.push(message.slice(i,i+maxlength));
  }
  return junck;

}

export default async (to, body) => {
  const junckes = messageSlipt(body);
  for (const junck of junckes) {
    await client.messages
      .create({
        body: junck,
        from: `whatsapp:${twilioNumber}`,
        to: to
      })
      .then(message => console.log(`✅ Message sent! SID: ${message.sid}`))
      .catch(error => console.error('❌ Error sending message:', error));
   }
}
