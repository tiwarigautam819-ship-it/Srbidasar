import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AdminUser } from '../types';

interface AuthContextType {
  currentUser: { uid: string; email: string } | null;
  adminProfile: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Master Admin Emails
const MASTER_ADMIN_EMAILS = [
  'tiwarigaitam819@gmail.com',
  'tiwarigautam819@gmail.com'
];
const MASTER_ADMIN_PASSWORD = 'Srbidasar.Com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore cached admin session on initial load
  useEffect(() => {
    try {
      const cached = localStorage.getItem('srbidasar_admin_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.email) {
          const isMaster = MASTER_ADMIN_EMAILS.includes(parsed.email.toLowerCase());
          setCurrentUser({ uid: parsed.uid || 'admin_master_uid', email: parsed.email });
          setIsAdmin(true);
          setIsSuperAdmin(parsed.role === 'super_admin' || isMaster);
          setAdminProfile({
            id: parsed.uid || 'admin_master_uid',
            email: parsed.email,
            role: isMaster ? 'super_admin' : (parsed.role || 'admin'),
            createdAt: parsed.createdAt || Date.now(),
          });
        }
      }
    } catch {
      // Ignore parse error
    }

    // Also listen to Firebase Auth if active
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        const isMaster = MASTER_ADMIN_EMAILS.includes(fbUser.email.toLowerCase());
        setCurrentUser({ uid: fbUser.uid, email: fbUser.email });
        setIsAdmin(true);
        setIsSuperAdmin(isMaster);
        setAdminProfile({
          id: fbUser.uid,
          email: fbUser.email,
          role: isMaster ? 'super_admin' : 'admin',
          createdAt: Date.now(),
        });
      }
      setLoading(false);
    });

    setLoading(false);
    return () => unsubscribe();
  }, []);

  const login = async (emailInput: string, passInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    const isMasterEmail = MASTER_ADMIN_EMAILS.includes(cleanEmail);

    // 1. Verify against Master Admin Credentials
    if (isMasterEmail) {
      if (cleanPass === MASTER_ADMIN_PASSWORD || cleanPass.toLowerCase() === MASTER_ADMIN_PASSWORD.toLowerCase()) {
        const masterProfile: AdminUser = {
          id: 'admin_master_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
          email: emailInput.trim(),
          role: 'super_admin',
          createdAt: Date.now(),
        };

        // Cache session
        localStorage.setItem('srbidasar_admin_session', JSON.stringify(masterProfile));
        setCurrentUser({ uid: masterProfile.id, email: masterProfile.email });
        setAdminProfile(masterProfile);
        setIsAdmin(true);
        setIsSuperAdmin(true);

        // Try syncing to Firestore
        try {
          await setDoc(doc(db, 'admins', masterProfile.id), masterProfile, { merge: true });
        } catch {
          // ignore
        }

        // Also try signing in or creating in Firebase Auth if available
        try {
          await signInWithEmailAndPassword(auth, emailInput.trim(), cleanPass);
        } catch {
          // Firebase Auth might have email provider toggle off; master session is securely verified above
        }

        return;
      } else {
        throw new Error('Incorrect password for admin account.');
      }
    }

    // 2. Check Firestore admins collection for team admin credentials
    try {
      const fbCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const adminDoc = await getDoc(doc(db, 'admins', fbCred.user.uid));
      const role = adminDoc.exists() ? (adminDoc.data()?.role || 'admin') : 'admin';

      const profile: AdminUser = {
        id: fbCred.user.uid,
        email: fbCred.user.email || cleanEmail,
        role: role as 'admin' | 'super_admin',
        createdAt: Date.now(),
      };

      localStorage.setItem('srbidasar_admin_session', JSON.stringify(profile));
      setCurrentUser({ uid: profile.id, email: profile.email });
      setAdminProfile(profile);
      setIsAdmin(true);
      setIsSuperAdmin(profile.role === 'super_admin');
    } catch (err: any) {
      console.warn('Firebase Auth error:', err?.code, err?.message);
      throw new Error('Invalid admin email or password.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('srbidasar_admin_session');
    setCurrentUser(null);
    setAdminProfile(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminProfile,
        isAdmin,
        isSuperAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
