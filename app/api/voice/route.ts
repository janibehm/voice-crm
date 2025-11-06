import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const to = formData.get('To');

  const twiml = new VoiceResponse();

  // Check if the 'To' parameter starts with 'client:'
  if (to && typeof to === 'string' && to.startsWith('client:')) {
    // Call is to another Twilio client
    const dial = twiml.dial();
    dial.client(to.replace('client:', ''));
  } else if (to) {
    // Call is to a phone number
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER || '',
    });
    dial.number(to as string);
  } else {
    twiml.say('Thank you for calling. Goodbye.');
  }

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
