import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

console.log('--- LiveKit Credential Check ---');
console.log('URL:', url);
console.log('API Key:', apiKey);
console.log('API Secret:', apiSecret ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}` : 'MISSING');

if (!url || !apiKey || !apiSecret) {
  console.error('\n❌ One or more LiveKit credentials are missing in .env.local');
  process.exit(1);
}

async function main() {
  // Try to generate a token
  try {
    const at = new AccessToken(apiKey!, apiSecret!, { identity: 'test-user' });
    at.addGrant({ roomJoin: true, room: 'test-room' });
    const token = await at.toJwt();
    console.log('\n✅ Token generated successfully (length:', token.length, ')');
  } catch (e: any) {
    console.error('\n❌ Token generation failed:', e.message);
  }

  // Try to list rooms (this will tell us if keys are valid against the server)
  try {
    const httpUrl = url!.replace('wss://', 'https://');
    const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    const rooms = await svc.listRooms();
    console.log('✅ Connected to LiveKit Cloud successfully! Active rooms:', rooms.length);
  } catch (e: any) {
    console.error('❌ Failed to connect to LiveKit Cloud:', e.message);
    console.error('   This means your API Key or Secret is INCORRECT for this project URL.');
    console.error('   Please go to https://cloud.livekit.io → your project → Settings → Keys');
    console.error('   and copy the correct API Key and Secret.');
  }
}

main();
