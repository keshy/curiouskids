import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, signInWithGoogle, signOut as firebaseSignOut } from '@/lib/firebase';

// Define the type for an authenticated user
export interface AuthUser {
  firebaseUser: User;
}

// User type is now only authenticated users
export type AppUser = AuthUser;

// Context type
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticate with backend
  const authenticateWithBackend = async (firebaseUser: User) => {
    try {
      console.log('Authenticating with backend, Firebase user:', firebaseUser.uid);
      
      // Send Firebase user data to our backend
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoUrl: firebaseUser.photoURL || '',
        }),
        credentials: 'include', // Important for session cookies
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend authentication failed:', response.status, errorText);
        throw new Error(`Failed to authenticate with backend: ${response.status} ${errorText}`);
      }
      
      // Try to parse the response 
      const userData = await response.json();
      console.log('Successfully authenticated with backend', userData);
      
      // Set user state
      setUser({
        firebaseUser,
      });
    } catch (error) {
      console.error('Backend authentication error:', error);
      // Still set the user state so the app is usable, but in a degraded state
      setUser({
        firebaseUser,
      });
      // Store error message
      setError('Failed to authenticate with backend server. Some features may not work properly.');
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      if (firebaseUser) {
        // User is signed in with Firebase, authenticate with backend
        try {
          await authenticateWithBackend(firebaseUser);
        } catch (error) {
          console.error('Authentication error:', error);
        }
      } else {
        // No authenticated user
        setUser(null);
      }
      
      setLoading(false);
    });

    // Clean up any guest user data that might be in localStorage
    localStorage.removeItem('guestUser');

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Auth state listener will update the user state
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign out from Firebase
      await firebaseSignOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign out');
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};