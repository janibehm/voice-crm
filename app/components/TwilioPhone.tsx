'use client';

import { useEffect, useState, useRef } from 'react';
import { Device, Call } from '@twilio/voice-sdk';

export default function TwilioPhone() {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [status, setStatus] = useState<string>('Loading...');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [identity, setIdentity] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const deviceRef = useRef<Device | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    async function initializeDevice() {
      try {
        setStatus('Fetching access token...');
        const response = await fetch('/api/token');
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch token');
        }

        const data = await response.json();
        console.log('Token received:', { identity: data.identity, tokenLength: data.token?.length, region: data.region });
        console.log('Token preview:', data.token?.substring(0, 100));

        setIdentity(data.identity);
        setStatus('Setting up device...');

        const deviceOptions: Record<string, unknown> = {
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
          logLevel: 1,
        };

        // Set edge location for Ireland region
        if (data.region && data.region !== 'us1') {
          deviceOptions.edge = ['dublin', 'ashburn'];
          console.log('Using edge locations:', deviceOptions.edge);
        }

        const twilioDevice = new Device(data.token, deviceOptions);

        twilioDevice.on('registered', () => {
          console.log('Device registered successfully');
          setStatus('Ready to make calls');
        });

        twilioDevice.on('error', (error) => {
          console.error('Twilio Device Error:', error);
          setStatus(`Error: ${error.message || 'Device error'}`);
        });

        twilioDevice.on('incoming', (incomingCall) => {
          setStatus(`Incoming call from ${incomingCall.parameters.From}`);
          setCall(incomingCall);

          incomingCall.on('accept', () => {
            setStatus('Call in progress');
          });

          incomingCall.on('disconnect', () => {
            setStatus('Call ended');
            setCall(null);
          });

          incomingCall.on('reject', () => {
            setStatus('Call rejected');
            setCall(null);
          });
        });

        console.log('Attempting to register device...');
        await twilioDevice.register();
        console.log('Device registered');
        setDevice(twilioDevice);
        deviceRef.current = twilioDevice;
      } catch (error) {
        console.error('=== Error initializing device ===');
        console.error('Error:', error);
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error?.constructor?.name);
        
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        } else if (error && typeof error === 'object') {
          errorMessage = JSON.stringify(error);
        } else if (error) {
          errorMessage = String(error);
        }
        
        setStatus(`Failed to initialize: ${errorMessage}`);
      }
    }

    initializeDevice();

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
    };
  }, [mounted]);

  const makeCall = async () => {
    if (!device) {
      setStatus('Device not ready');
      return;
    }

    if (!phoneNumber) {
      setStatus('Please enter a phone number');
      return;
    }

    try {
      setStatus('Connecting...');
      const outgoingCall = await device.connect({
        params: {
          To: phoneNumber,
        },
      });

      setCall(outgoingCall);

      outgoingCall.on('accept', () => {
        setStatus('Call connected');
      });

      outgoingCall.on('disconnect', () => {
        setStatus('Call ended');
        setCall(null);
      });

      outgoingCall.on('cancel', () => {
        setStatus('Call cancelled');
        setCall(null);
      });

      outgoingCall.on('reject', () => {
        setStatus('Call rejected');
        setCall(null);
      });
    } catch (error) {
      console.error('Error making call:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatus(`Failed to make call: ${errorMessage}`);
    }
  };

  const hangUp = () => {
    if (call) {
      call.disconnect();
      setCall(null);
      setStatus('Call ended');
    }
  };

  const answerCall = () => {
    if (call) {
      call.accept();
    }
  };

  const rejectCall = () => {
    if (call) {
      call.reject();
      setCall(null);
      setStatus('Call rejected');
    }
  };

  if (!mounted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Twilio Voice Client</h1>
          <div style={styles.statusSection}>
            <p style={styles.statusLabel}>Status:</p>
            <p style={styles.statusValue}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Twilio Voice Client</h1>
        
        <div style={styles.statusSection}>
          <p style={styles.statusLabel}>Status:</p>
          <p style={styles.statusValue}>{status}</p>
          {identity && (
            <p style={styles.identity}>Identity: {identity}</p>
          )}
        </div>

        <div style={styles.inputSection}>
          <input
            type="tel"
            placeholder="Enter phone number (e.g., +1234567890)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={styles.input}
            disabled={!!call}
          />
        </div>

        <div style={styles.buttonSection}>
          {!call ? (
            <button
              onClick={makeCall}
              disabled={!device || !phoneNumber}
              style={{
                ...styles.button,
                ...styles.callButton,
                ...((!device || !phoneNumber) && styles.buttonDisabled),
              }}
            >
              📞 Call
            </button>
          ) : (
            <>
              {call.status() === 'pending' && (
                <>
                  <button
                    onClick={answerCall}
                    style={{ ...styles.button, ...styles.answerButton }}
                  >
                    ✅ Answer
                  </button>
                  <button
                    onClick={rejectCall}
                    style={{ ...styles.button, ...styles.hangUpButton }}
                  >
                    ❌ Reject
                  </button>
                </>
              )}
              {call.status() !== 'pending' && (
                <button
                  onClick={hangUp}
                  style={{ ...styles.button, ...styles.hangUpButton }}
                >
                  📴 Hang Up
                </button>
              )}
            </>
          )}
        </div>


      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center' as const,
    color: '#333',
  },
  statusSection: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  statusLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  statusValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  identity: {
    fontSize: '12px',
    color: '#888',
    marginTop: '10px',
  },
  inputSection: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  buttonSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  button: {
    flex: 1,
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.3s',
  },
  callButton: {
    background: '#0070f3',
    color: 'white',
  },
  answerButton: {
    background: '#00c853',
    color: 'white',
  },
  hangUpButton: {
    background: '#f44336',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  infoSection: {
    background: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  list: {
    marginLeft: '20px',
    color: '#555',
    lineHeight: '1.8',
  },
};
