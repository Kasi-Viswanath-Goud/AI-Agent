'use client';

import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';

export default function Home() {
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCall = async () => {
    try {
      setError(null);
      const roomName = 'test-room-' + Math.floor(Math.random() * 10000);
      const res = await fetch(`/api/token?room=${roomName}&participantName=AgentTester`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch token');
      }
      
      const data = await res.json();
      setRoomToken(data.token);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
  };

  const endCall = () => {
    setIsConnected(false);
    setRoomToken(null);
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-950 text-zinc-50 font-sans p-8">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            AI Voice Agent <span className="text-emerald-500">MVP</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Test the conversational AI agent in your browser. Ensure your microphone is enabled.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg max-w-md w-full">
            {error}
          </div>
        )}

        {!isConnected ? (
          <button
            onClick={startCall}
            className="group relative flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xl font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]"
          >
            <Phone className="w-6 h-6 fill-zinc-950" />
            Start Call
          </button>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full">
            <LiveKitRoom
              token={roomToken!}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              audio={true}
              video={false}
              onDisconnected={endCall}
              className="flex flex-col items-center gap-6 w-full"
            >
              <AgentVisualizer />
              <VoiceAssistantControlBar />
              <RoomAudioRenderer />
            </LiveKitRoom>
            
            <button
              onClick={endCall}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

function AgentVisualizer() {
  const { state, audioTrack } = useVoiceAssistant();
  
  let stateText = 'Connecting...';
  if (state === 'connected') stateText = 'Listening';
  if (state === 'speaking') stateText = 'Agent Speaking';
  if (state === 'listening') stateText = 'Listening...';
  if (state === 'initializing') stateText = 'Initializing...';
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl w-full max-w-md gap-6 shadow-2xl backdrop-blur-xl">
      <div className="text-zinc-400 font-medium tracking-widest uppercase text-sm">
        {stateText}
      </div>
      <div className="h-24 flex items-center justify-center">
        <BarVisualizer
          state={state}
          barCount={7}
          trackRef={audioTrack}
          className="w-full h-full text-emerald-500"
        />
      </div>
    </div>
  );
}
