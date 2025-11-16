import React, { useState } from 'react';
import { X, Mail, Loader, Lock } from 'lucide-react';
import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const CircleLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'pin' | 'loading'
  const [sdk] = useState(() => new W3SSdk());
  const [challengeId, setChallengeId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get user by email from backend
      const response = await fetch(`${BACKEND_URL}/api/circle/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'User not found');
      }

      const data = await response.json();
      
      setUserId(data.userId);
      setUserToken(data.userToken);
      setEncryptionKey(data.encryptionKey);
      setChallengeId(data.challengeId);
      setStep('pin');
      setLoading(false);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'User not found. Please sign up first.');
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    if (!sdk || !challengeId || !userToken || !encryptionKey) {
      setError('Authentication data missing');
      return;
    }

    try {
      setLoading(true);
      setError('');

      sdk.setAppSettings({
        appId: import.meta.env.VITE_CIRCLE_APP_ID || ''
      });

      sdk.setAuthentication({
        userToken: userToken,
        encryptionKey: encryptionKey
      });

      sdk.execute(challengeId, async (error, result) => {
        if (error) {
          console.error('PIN verification error:', error);
          setError('Invalid PIN. Please try again.');
          setLoading(false);
          return;
        }

        console.log('PIN verified:', result);
        
        // Get user's wallet
        try {
          const walletsResponse = await fetch(`${BACKEND_URL}/api/circle/wallets/${userId}`);
          const walletsData = await walletsResponse.json();
          
          if (walletsData.success && walletsData.wallets.length > 0) {
            const wallet = walletsData.wallets[0];
            
            onSuccess({
              email,
              userId,
              walletAddress: wallet.address,
              walletId: wallet.id,
              blockchain: wallet.blockchain,
            });
          } else {
            setError('No wallet found for this account');
            setLoading(false);
          }
        } catch (err) {
          setError('Failed to fetch wallet');
          setLoading(false);
        }
      });

    } catch (err) {
      console.error('PIN login error:', err);
      setError(err.message || 'Failed to verify PIN');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Login to ArcPay</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-black transition disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Loading...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {step === 'pin' && (
            <div className="text-center py-8">
              <Lock className="mx-auto mb-4 text-black" size={48} />
              <h3 className="text-lg font-semibold text-black mb-2">Enter Your PIN</h3>
              <p className="text-gray-600 mb-6">Enter your 6-digit PIN to access your wallet</p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handlePinLogin}
                disabled={loading}
                className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold"
              >
                {loading ? 'Verifying...' : 'Enter PIN'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
