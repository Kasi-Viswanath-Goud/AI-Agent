import {
  WorkerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as google from '@livekit/agents-plugin-google';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Map Next.js public URL to the internal LiveKit SDK variable
if (!process.env.LIVEKIT_URL && process.env.NEXT_PUBLIC_LIVEKIT_URL) {
  process.env.LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
}

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    console.log('Agent connected to room:', ctx.room.name);

    const vad = await silero.VAD.load();

    const agent = new voice.Agent({
      instructions: `You are an AI tele-calling voice agent representing our company. 
Your goal is to qualify the lead by having a natural conversation. 
You should ask about their requirements, budget, and timeline. 
Keep your responses very brief, conversational, and natural. Do not act like a robot.`,
      vad,
      stt: new deepgram.STT(),
      llm: new google.LLM({ model: 'gemini-3.6-flash' }),
      tts: new cartesia.TTS(),
    });

    const session = new voice.AgentSession({ turnDetection: 'vad' });
    await session.start({ agent, room: ctx.room });

    // Greet the user when they join
    session.say('Hi there, I am the AI assistant. How can I help you today?');
  },
});

cli.runApp(new WorkerOptions({ agent: process.argv[1] }));
