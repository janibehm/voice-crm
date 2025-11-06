# Twilio Voice Client - CRM

A Next.js application that provides secure voice calling capabilities using Twilio Voice SDK with email-based authentication.

## Features

- 🔐 **Email Authentication** - Secure magic link authentication using NextAuth.js and Resend
- 📞 **Voice Calling** - Make and receive calls using Twilio Voice SDK
- 👥 **Team Access** - Whitelist specific email addresses for access control
- 🎨 **Modern UI** - Clean, responsive interface built with Next.js 16
- 💾 **Session Management** - Persistent sessions stored in SQLite database

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router, Turbopack)
- **Authentication**: NextAuth.js with Resend email provider
- **Voice**: Twilio Voice SDK (@twilio/voice-sdk)
- **Database**: Prisma + SQLite
- **Styling**: Inline styles (easily customizable)

## Prerequisites

- Node.js 18+ 
- A Twilio account ([sign up here](https://www.twilio.com/try-twilio))
- A Resend account ([sign up here](https://resend.com/signup))

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd crm
pnpm install
```

### 2. Set Up Twilio

1. Create a Twilio account at https://www.twilio.com
2. Get your **Account SID** and **Auth Token** from the Console
3. Create an **API Key**:
   - Go to Account → API Keys & Tokens → Create API Key
   - Choose "Standard" key type
   - Save the SID (starts with SK) and Secret
4. Create a **TwiML Application**:
   - Go to Voice → Manage → TwiML Apps → Create new
   - Set Voice URL to `https://demo.twilio.com/welcome/voice/` (temporary)
   - Save the App SID (starts with AP)
5. Get a **Phone Number** from Twilio Console

### 3. Set Up Resend

1. Sign up at https://resend.com
2. Create an API Key
3. (Optional) Verify your domain for custom email addresses

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=your_api_key_sid
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=your_twiml_app_sid
TWILIO_PHONE_NUMBER=+1234567890

# NextAuth Configuration
AUTH_SECRET=your_generated_secret  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=onboarding@resend.dev  # Or your verified domain email
DATABASE_URL="file:./dev.db"

# Access Control (comma-separated emails)
ALLOWED_EMAILS=user1@example.com,user2@example.com
# OR allow entire domain:
ALLOWED_DOMAINS=yourcompany.com
```

### 5. Initialize Database

```bash
pnpm prisma generate
pnpm prisma db push
```

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Local Testing with ngrok

For full calling functionality in development, you need to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Update your TwiML App Voice URL in Twilio Console:
# https://YOUR_NGROK_URL.ngrok.io/api/voice
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm install -g vercel

# Deploy
vercel
```

After deployment:

1. Add all environment variables in Vercel dashboard
2. Update `NEXTAUTH_URL` to your production URL
3. Update TwiML App Voice URL to: `https://your-app.vercel.app/api/voice`
4. (Optional) Verify your custom domain in Resend

## Project Structure

```
crm/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth.js routes
│   │   ├── token/               # Twilio token generation
│   │   └── voice/               # TwiML voice handler
│   ├── auth/
│   │   └── signin/              # Sign-in page
│   ├── components/
│   │   ├── PhoneClient.tsx      # Client wrapper component
│   │   └── TwilioPhone.tsx      # Main phone interface
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (protected)
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── dev.db                   # SQLite database (generated)
├── auth.ts                      # NextAuth configuration
└── .env.local                   # Environment variables (not in git)
```

## API Routes

- `POST /api/auth/signin/resend` - Send magic link email
- `GET /api/auth/callback/resend` - Handle magic link callback
- `GET /api/token` - Generate Twilio access token
- `POST /api/voice` - TwiML handler for incoming/outgoing calls

## Security

- ✅ Email-based authentication with magic links
- ✅ Session management with database storage
- ✅ Email/domain whitelisting for access control
- ✅ Environment variables for sensitive data
- ✅ CSRF protection via NextAuth.js

## Troubleshooting

### "AccessTokenInvalid" Error
- Verify your Twilio API Key is a "Standard" key, not "Main"
- Ensure TwiML App Voice URL is accessible (use ngrok for local dev)

### Email Not Sending
- Verify your Resend API key is correct
- Check if your domain is verified in Resend (for custom emails)
- Use `onboarding@resend.dev` for testing

### Blank Screen After Login
- Check browser console for JavaScript errors
- Ensure all environment variables are set correctly
- Restart the dev server after changing `.env.local`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Twilio Voice SDK](https://www.twilio.com/docs/voice/sdks/javascript)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)

# voice-crm
