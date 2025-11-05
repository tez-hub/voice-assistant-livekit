import { NextResponse } from 'next/server';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';

export async function POST(req: Request) {
  try {
    const { roomName, participantName } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 });
    }

    const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
      identity: participantName,
    });

    const grant: VideoGrant = {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    };

    at.addGrant(grant);

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
