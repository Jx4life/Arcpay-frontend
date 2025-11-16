import React, { useState, useEffect } from 'react';
import { X, Mail, Loader, CheckCircle, Copy, ExternalLink, Lock } from 'lucide-react';
import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk';

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const CircleSignUpModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'pin' | 'creating' | 'success'
  const [userId, setUserId] = useState(null);
  const [challengeId, setChallengeId] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [sdk, setSdk] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);

  useEffect(() => {
    // Initialize SDK
    const w3sSdk = new W3SSdk();
    setSdk(w3sSdk);
  }, []);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating user for email:', email);
      
      // Create user on backend
      const createResponse = await fetch(`${BACKEND_URL}/api/circle/create-user-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const userData = await createResponse.json();
      console.log('User created:', userData);
      
      setUserId(userData.userId);
      setChallengeId(userData.challengeId);
      setUserToken(userData.userToken);
      setEncryptionKey(userData.encryptionKey);
      
      // Move to PIN setup
      setStep('pin');
      setLoading(false);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const handlePinSetup = async () => {
  if (!challengeId || !userToken || !encryptionKey) {
    setError('Missing authentication data');
    return;
  }

  try {
    setLoading(true);
    setError('');

    // Create a fresh SDK instance
    const w3sSdk = new W3SSdk();
    
    const appId = import.meta.env.VITE_CIRCLE_APP_ID;
    
    console.log('Using App ID:', appId);
    console.log('Challenge ID:', challengeId);

    // Set app settings first
    w3sSdk.setAppSettings({
      appId: appId
    });

    // Then set authentication
    w3sSdk.setAuthentication({
      userToken: userToken,
      encryptionKey: encryptionKey
    });

    console.log('Executing challenge...');

    // Execute the challenge
    w3sSdk.execute(challengeId, (error, result) => {
      if (error) {
        console.error('Challenge execution error:', error);
        setError(error.message || 'Failed to set PIN');
        setLoading(false);
        return;
      }

      console.log('Challenge completed:', result);
      
      // Start polling for wallet
      setStep('creating');
      setLoading(false);
      startPollingForWallet(userId);
    });

  } catch (err) {
    console.error('PIN setup error:', err);
    setError(err.message || 'Failed to set up PIN');
    setLoading(false);
  }
};

  const startPollingForWallet = async (userId) => {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const walletsResponse = await fetch(`${BACKEND_URL}/api/circle/wallets/${userId}`);

        if (!walletsResponse.ok) {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setError('Wallet creation timeout');
            setStep('pin');
          }
          return;
        }

        const walletsData = await walletsResponse.json();
        
        if (walletsData.success && walletsData.wallets.length > 0) {
          clearInterval(pollInterval);
          
          const wallet = walletsData.wallets[0];
          
          const finalData = {
            email,
            userId,
            walletAddress: wallet.address,
            walletId: wallet.id,
            blockchain: wallet.blockchain,
          };

          setWalletData(finalData);
          setStep('success');
          
          setTimeout(() => {
            onSuccess(finalData);
          }, 2000);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Create Your Wallet</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-black transition disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'email' && (
            <div>
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50" required />
                  </div>
                </div>
                {error && (<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>)}
                <button type="submit" disabled={loading || !email} className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2">
                  {loading ? (<><Loader className="animate-spin" size={20} />Creating Account...</>) : ('Continue')}
                </button>
              </form>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-700">You'll set up a secure PIN to protect your wallet.</p>
              </div>
            </div>
          )}

          {step === 'pin' && (
            <div className="text-center py-8">
              <Lock className="mx-auto mb-4 text-black" size={48} />
              <h3 className="text-lg font-semibold text-black mb-2">Set Up Your PIN</h3>
              <p className="text-gray-600 mb-6">Create a secure 6-digit PIN to protect your wallet</p>
              {error && (<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">{error}</div>)}
              <button onClick={handlePinSetup} disabled={loading} className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold">
                {loading ? 'Setting up...' : 'Set Up PIN'}
              </button>
            </div>
          )}

          {step === 'creating' && (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto mb-4 text-black" size={48} />
              <h3 className="text-lg font-semibold text-black mb-2">Creating Your Wallet</h3>
              <p className="text-gray-600">Setting up your secure wallet on the blockchain...</p>
            </div>
          )}

          {step === 'success' && walletData && (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <h3 className="text-lg font-semibold text-black mb-2">Wallet Created!</h3>
              <p className="text-gray-600 mb-4">Welcome, {walletData.email}</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                <div className="text-xs text-gray-500 mb-1">Wallet Address</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-black break-all">{walletData.walletAddress}</code>
                  <button onClick={() => copyToClipboard(walletData.walletAddress)} className="text-gray-600 hover:text-black p-2" title="Copy">
                    <Copy size={16} />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">Blockchain: {walletData.blockchain}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
