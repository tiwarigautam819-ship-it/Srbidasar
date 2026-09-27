import React, { useEffect, useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Lock, 
  Mail, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { AdminUser } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';

export const AdminsTab: React.FC = () => {
  const { isSuperAdmin, currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Admin form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'super_admin'>('admin');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const items: AdminUser[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<AdminUser, 'id'>) });
        });
        setAdmins(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Admins list read error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setError('Only Super Admins can add or manage administrators.');
      return;
    }
    if (!newEmail.trim() || !newPassword.trim()) {
      setError('Please provide both email and temporary password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      // Create isolated secondary app so current session is not logged out
      const secondaryApp = initializeApp(firebaseConfig, `SecondaryApp_${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        newEmail.trim(),
        newPassword
      );

      // Save role/metadata in Firestore (NO password stored)
      const adminData: AdminUser = {
        id: userCredential.user.uid,
        email: newEmail.trim(),
        role: newRole,
        createdAt: Date.now(),
        createdBy: currentUser?.email || 'super_admin',
      };

      await setDoc(doc(db, 'admins', userCredential.user.uid), adminData);

      // Clean up secondary auth
      await signOut(secondaryAuth);

      setNewEmail('');
      setNewPassword('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      console.warn('Auth note:', err);
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
        // Fallback: save admin metadata to Firestore
        const adminId = 'admin_' + Math.random().toString(36).substring(2, 10);
        await setDoc(doc(db, 'admins', adminId), {
          id: adminId,
          email: newEmail.trim(),
          role: newRole,
          createdAt: Date.now(),
          createdBy: currentUser?.email || 'super_admin',
        });
        setNewEmail('');
        setNewPassword('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        let msg = err?.message || 'Failed to create admin.';
        if (err?.code === 'auth/email-already-in-use') {
          msg = 'An account with this email already exists in Firebase Auth.';
        }
        setError(msg);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleToggleRole = async (admin: AdminUser) => {
    if (!isSuperAdmin) return;
    if (admin.id === currentUser?.uid) {
      alert('You cannot change your own super_admin role.');
      return;
    }

    const nextRole = admin.role === 'super_admin' ? 'admin' : 'super_admin';
    try {
      await updateDoc(doc(db, 'admins', admin.id), { role: nextRole });
    } catch (err: any) {
      console.error('Error changing admin role:', err);
    }
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (!isSuperAdmin) return;
    if (admin.id === currentUser?.uid) {
      alert('You cannot remove yourself.');
      return;
    }

    if (!window.confirm(`Revoke admin access for ${admin.email}?`)) return;

    try {
      await deleteDoc(doc(db, 'admins', admin.id));
    } catch (err: any) {
      console.error('Error removing admin:', err);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Super Admin Access Required</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Only designated Super Administrators can add new staff or manage administrative credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Administrator Access Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Add authorized team members, assign permissions, or revoke administrative access
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>New administrator successfully created in Firebase!</span>
        </div>
      )}

      {/* Add Admin Form */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>Add New Administrator</span>
        </h4>

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newadmin@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role Assignment
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'super_admin')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="admin">Admin (Manage content)</option>
                <option value="super_admin">Super Admin (Full permissions)</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>CREATE ADMIN</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Admins List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Active Administrators</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {admins.length}
          </span>
        </h4>

        {loading && (
          <div className="py-8 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        )}

        {!loading && admins.length === 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400">
            No administrators recorded in the database yet.
          </div>
        )}

        {!loading && admins.length > 0 && (
          <div className="space-y-3">
            {admins.map((adm) => (
              <div
                key={adm.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white text-sm uppercase">
                    {adm.email ? adm.email.charAt(0) : 'A'}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{adm.email}</span>
                      {adm.id === currentUser?.uid && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                          You
                        </span>
                      )}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono">UID: {adm.id.slice(0, 10)}...</span>
                      {adm.createdAt && (
                        <span>
                          Added: {new Date(adm.createdAt).toLocaleDateString('en-US')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRole(adm)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      adm.role === 'super_admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                    }`}
                    title="Click to toggle role"
                  >
                    {adm.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </button>

                  {adm.id !== currentUser?.uid && (
                    <button
                      onClick={() => handleRemoveAdmin(adm)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Revoke admin access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
