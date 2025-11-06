import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

// Simple approach: Just use PrismaClient with DATABASE_URL
// Turso connection string will work automatically
const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only apply restrictions after email verification (when account exists)
      // This allows the email to be sent, but checks access when they click the link
      if (account?.provider === 'resend') {
        const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',').map(d => d.trim().toLowerCase()) || [];
        
        const email = user.email?.toLowerCase();
        const domain = email?.split('@')[1];
        
        // If no restrictions set, allow all (change to false for security-first approach)
        if (allowedEmails.length === 0 && allowedDomains.length === 0) {
          console.log('No email restrictions set - allowing access');
          return true;
        }
        
        // Check if email is in allowed list
        if (email && allowedEmails.includes(email)) {
          return true;
        }
        
        // Check if domain is in allowed list
        if (domain && allowedDomains.includes(domain)) {
          return true;
        }
        
        console.warn(`Access denied for email: ${email}`);
        return false; // Deny access
      }
      
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
})
