import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

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
    async signIn({ user }) {
      // Restrict access to specific email addresses
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
      const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',').map(d => d.trim().toLowerCase()) || [];
      
      const email = user.email?.toLowerCase();
      const domain = email?.split('@')[1];
      
      // If no restrictions set, deny by default (security first)
      if (allowedEmails.length === 0 && allowedDomains.length === 0) {
        console.warn('No ALLOWED_EMAILS or ALLOWED_DOMAINS set - denying access');
        return false;
      }
      
      // Check if email is in allowed list
      if (email && allowedEmails.includes(email)) {
        return true;
      }
      
      // Check if domain is in allowed list
      if (domain && allowedDomains.includes(domain)) {
        return true;
      }
      
      return false; // Deny access
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
})
