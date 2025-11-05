'use client';
import { useState, useEffect, useRef } from 'react';
import { Room, RemoteParticipant, ParticipantEvent } from 'livekit-client';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  async function joinRoom() {
    const roomName = 'demo-room';
    const participantName = 'visitor-' + Math.floor(Math.random() * 10000);

    const res = await fetch('/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, participantName }),
    });

    const { token } = await res.json();
    if (!token) return alert('Failed to get token');

    const { Room } = await import('livekit-client');
    const newRoom = new Room();

    // Connect to LiveKit
    await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

    try{

      // Enable local mic & camera
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      await newRoom.localParticipant.setCameraEnabled(true);
    } catch(err){
      console.error('Error enabling mic/camera:', err);
    }

    // Wait for camera to be enabled and attach dynamically
    newRoom.localParticipant.on('trackPublished', (pub) => {
      const track = pub.videoTrack;
      if (track && localVideoRef.current) {
        track.attach(localVideoRef.current);
      }
    });

    // Handle remote participants joining
    newRoom.on(ParticipantEvent.TrackSubscribed, (track, pub, participant) => {
      console.log('Remote track subscribed:', participant.identity);
      if (track.kind === 'video' && remoteVideoRef.current) {
        track.attach(remoteVideoRef.current);
      }
    });

    setRoom(newRoom);
    setConnected(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-64 h-48 rounded-lg border" />
        <video ref={remoteVideoRef} autoPlay className="w-64 h-48 rounded-lg border" />
      </div>

      <button
        onClick={joinRoom}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {connected ? 'Connected!' : 'Join Room'}
      </button>
    </div>
  );
}
