import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function GET(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
  const region = process.env.TWILIO_REGION; // e.g., 'ie1' for Ireland

  if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
    return NextResponse.json(
      { error: 'Missing Twilio credentials in environment variables' },
      { status: 500 }
    );
  }

  // Generate a random identity for the user
  const identity = `user_${Math.random().toString(36).substring(7)}`;

  // Create an access token with region support
  const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
    identity: identity,
    region: region, // Specify the region if set
  });

  // Create a Voice grant and add it to the token
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: true,
  });
  
  // Set region on the grant if specified
  if (region) {
    voiceGrant.pushCredentialSid = undefined; // Ensure proper grant configuration
  }

  accessToken.addGrant(voiceGrant);

  // Serialize the token to JWT
  return NextResponse.json({
    token: accessToken.toJwt(),
    identity: identity,
    region: region || 'us1', // Return the region for client configuration
  });
}
