'use client';
import { useState } from 'react';
import { Room } from 'livekit-client';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);

  async function joinRoom() {
    const roomName = 'demo-room';
    const participantName = 'visitor-' + Math.floor(Math.random() * 10000);

    // Request a token from your API route
    const res = await fetch('/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, participantName }),
    });

    const { token } = await res.json();

    if (!token) {
      alert('Failed to get token');
      return;
    }

    try {
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;
      const roomInstance = new Room();

      // Connect to LiveKit
      await roomInstance.connect(livekitUrl, token);

      // Enable your microphone (and camera if needed)
      await roomInstance.localParticipant.setMicrophoneEnabled(true);
      // await roomInstance.localParticipant.setCameraEnabled(true);

      setRoom(roomInstance);
      setConnected(true);

      console.log('✅ Connected to LiveKit room:', roomInstance.name);
    } catch (error) {
      console.error('❌ Failed to connect to LiveKit:', error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        onClick={joinRoom}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {connected ? 'Connected!' : 'Join Room'}
      </button>
    </div>
  );
}
