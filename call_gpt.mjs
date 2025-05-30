
import dotenv from 'dotenv';
dotenv.config();
export default async (incomingMsg) => {

 const chatGPTRes = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: 'user', content: incomingMsg }]
  })
});
  if (!chatGPTRes.ok) {
    throw new Error(`Error: ${chatGPTRes.status} ${chatGPTRes.statusText}`);
  }

  const data = await chatGPTRes.json();
  const responseMessage = data.choices[0].message.content;

  return responseMessage;
}

