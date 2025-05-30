
import { File } from 'fetch-blob/from.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const delay=(ms)=> new Promise((resolve)=> setTimeout(resolve,ms));

async function recall(stream){
  for(let i=0;i<3;i++){

    try{
          const transformedStream = await openai.audio.transcriptions.create({
          model: 'whisper-1',
          file: stream,
          response_format: 'text',
         });
       return transformedStream;
    }catch(err){
        console.log('Error in recall:', err);
        if(i<2){ // Retry up to 2 more times
          console.log(`Retrying... Attempt ${i + 1}`);
          await delay(1000*i); // Wait for 1 second before retrying
        }
       else throw err;
    }
  }
}

export default async (url) => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.TWILIO_SID}:${process.env.TWILIO_AUTH}`).toString('base64'),
      },
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.arrayBuffer();
    const buffer = Buffer.from(data);

    // Create Blob for OpenAI Whisper API
    const stream = new File([buffer], 'voice.ogg', { type: 'audio/ogg' });
/*     stream.name = 'voice.ogg'; */ // Required by OpenAI SDK
    console.log('File name:', stream.name);
    console.log('File type:', stream.type);
    console.log('File size (bytes):', stream.size);
    return recall(stream);

/*     const transformedStream = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: stream,
      response_format: 'text',
    }); */

    /* return transformedStream; */
  } catch (err) {
    console.log('Error processing audio:', err);
    throw new Error('Failed to process audio message');
  }
};
