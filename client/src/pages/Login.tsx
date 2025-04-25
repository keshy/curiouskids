import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle, signInAsGuest, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setLocation('/');
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const handleGuestSignIn = () => {
    signInAsGuest();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-gradient-to-br from-purple-100 to-green-100 rounded-3xl p-8 shadow-lg border-2 border-purple-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Ask Me Buddy!</h1>
          <p className="text-xl text-gray-700">
            The fun learning companion for curious kids!
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 rounded-xl p-6 shadow-md border border-purple-200">
            <h2 className="text-2xl font-bold text-center mb-4 text-primary">Choose how to continue</h2>
            
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="button-press bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-full shadow-md transition-colors flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Sign in with Google
                {loading && <span className="ml-2 animate-spin">⟳</span>}
              </button>
              
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-gray-300 flex-grow"></div>
                <div className="mx-4 text-gray-500">or</div>
                <div className="border-t border-gray-300 flex-grow"></div>
              </div>
              
              <button
                onClick={handleGuestSignIn}
                disabled={loading}
                className="button-press bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-800 font-bold py-4 px-6 rounded-full shadow-md transition-colors flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Continue as Guest
                {loading && <span className="ml-2 animate-spin">⟳</span>}
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border border-purple-200">
            <h3 className="font-bold text-primary mb-2">Why sign in?</h3>
            <ul className="space-y-2 text-gray-700 pl-6 list-disc">
              <li>Save your favorite questions and answers</li>
              <li>Get personalized learning recommendations</li>
              <li>Track your progress and learning journey</li>
              <li>Access special features for registered users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}