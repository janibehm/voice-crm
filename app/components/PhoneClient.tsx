'use client';

import dynamic from 'next/dynamic';

const TwilioPhone = dynamic(() => import('./TwilioPhone'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
      }}>
        <h1 style={{ fontSize: '32px', textAlign: 'center' }}>Loading...</h1>
      </div>
    </div>
  ),
});

export default function PhoneClient() {
  return <TwilioPhone />;
}
