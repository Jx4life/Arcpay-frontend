import React from "react";
import FeatureCard from "./FeatureCard";
import {
  DollarSign,
  Wallet,
  UserPlus,
  ArrowRightLeft,
  Calendar,
  Shield,
} from "lucide-react";
import { CircleSignUpModal } from "../CircleSignUp";
import { CircleLoginModal } from "../CircleLogin";
import { useOnboarding } from "../context/OnboardingContext";

/**
 * LandingPage now consumes OnboardingContext directly via useOnboarding.
 * It no longer expects onboarding setters as props; instead it reads actions/state
 * from context so the router and context manage the flow.
 */
export default function LandingPage() {
  const {
    connectWallet,
    showSignUpModal,
    setShowSignUpModal,
    showLoginModal,
    setShowLoginModal,
    handleCircleSuccess,
    handleCircleLoginSuccess,
  } = useOnboarding();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                <DollarSign className="text-white" size={40} />
              </div>
            </div>
            <h1 className="text-6xl font-black text-black mb-4">ArcPay</h1>
            <p className="text-xl text-gray-600 mb-8">
              Cross-chain payroll automation for the modern workforce
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <button
                onClick={connectWallet}
                className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Wallet size={24} />
                Connect Wallet
              </button>

              <div className="text-gray-400 font-semibold">OR</div>

              <button
                onClick={() => setShowSignUpModal(true)}
                className="bg-white text-black border-2 border-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <UserPlus size={24} />
                Sign Up
              </button>
            </div>

            <p className="text-sm text-gray-500">
              New to crypto?{" "}
              <span className="font-semibold text-black">
                Sign up with just your email
              </span>{" "}
              - no extensions needed!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ArrowRightLeft size={28} />}
              title="Cross-Chain Bridge"
              description="Bridge USDC from 6+ networks seamlessly"
            />
            <FeatureCard
              icon={<Calendar size={28} />}
              title="Automated Payments"
              description="Schedule recurring payroll with ease"
            />
            <FeatureCard
              icon={<Shield size={28} />}
              title="Secure & Trustless"
              description="Non-custodial smart contracts"
            />
          </div>
        </div>
      </div>

      {/* Circle modals are controlled by OnboardingContext */}
      <CircleSignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSuccess={handleCircleSuccess}
      />

      <CircleLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleCircleLoginSuccess}
      />
    </>
  );
}
