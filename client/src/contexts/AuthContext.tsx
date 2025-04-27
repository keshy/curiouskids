import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, signInWithGoogle, signOut as firebaseSignOut } from '@/lib/firebase';

// Define the type for a guest user
export interface GuestUser {
  isGuest: true;
  id: string; // Generate a unique ID for guests
  displayName: string;
}

// Define the type for an authenticated user
export interface AuthUser {
  isGuest: false;
  firebaseUser: User;
}

// Combined user type
export type AppUser = GuestUser | AuthUser;

// Context type
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a unique ID for guests
const generateGuestId = () => {
  return `guest_${Math.random().toString(36).substring(2, 9)}`;
};

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
        isGuest: false,
        firebaseUser,
      });
    } catch (error) {
      console.error('Backend authentication error:', error);
      // Still set the user state so the app is usable, but in a degraded state
      setUser({
        isGuest: false,
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
        // Check if there's a saved guest user in localStorage
        const savedGuestUser = localStorage.getItem('guestUser');
        if (savedGuestUser) {
          setUser(JSON.parse(savedGuestUser));
        } else {
          setUser(null);
        }
      }
      
      setLoading(false);
    });

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

  // Sign in as guest
  const handleGuestSignIn = () => {
    const guestUser: GuestUser = {
      isGuest: true,
      id: generateGuestId(),
      displayName: 'Guest User',
    };
    
    // Save guest user to localStorage
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user && !user.isGuest) {
        // Sign out from Firebase
        await firebaseSignOut();
      }
      
      // Remove guest user from localStorage
      localStorage.removeItem('guestUser');
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
    signInAsGuest: handleGuestSignIn,
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