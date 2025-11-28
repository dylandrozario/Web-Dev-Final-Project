import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase auth is not initialized, skip auth
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email?.endsWith("@bc.edu")) {
        setUser(firebaseUser);
      } else {
        if (firebaseUser) {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("Sign out error:", error);
          }
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase is not configured. Please set VITE_FIREBASE_API_KEY in your .env file.");
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user?.email ?? "";

    if (!email.endsWith("@bc.edu")) {
      await signOut(auth);
      throw new Error("You must sign in with a @bc.edu email.");
    }
  };

  const logout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  // Create a normalized user object with name property for compatibility
  const normalizedUser = user ? {
    ...user,
    name: user.displayName || user.email?.split('@')[0] || 'User'
  } : null;

  const value = { 
    user: normalizedUser, 
    loading, 
    loginWithGoogle, 
    logout,
    isAuthenticated: !!user // Add isAuthenticated for compatibility
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
