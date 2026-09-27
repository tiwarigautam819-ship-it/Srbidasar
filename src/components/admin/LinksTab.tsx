import React, { useEffect, useState } from 'react';
import { 
  Link2, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Loader2, 
  X,
  Globe
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LinkItem } from '../../types';
import { getLinkIcon } from '../LinksSection';

const AVAILABLE_ICONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'spotify', label: 'Spotify / Music' },
  { id: 'radio', label: 'DJ / Radio' },
  { id: 'website', label: 'Official Website' },
];

export const LinksTab: React.FC = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('instagram');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Edit state
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('instagram');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'links'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: LinkItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<LinkItem, 'id'>) });
        });
        setLinks(items);
        setLoading(false);
      },
      () => {
        const simpleQ = collection(db, 'links');
        onSnapshot(simpleQ, (snap) => {
          const items: LinkItem[] = [];
          snap.forEach((d) => {
            items.push({ id: d.id, ...(d.data() as Omit<LinkItem, 'id'>) });
          });
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          setLinks(items);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setAddError('Link name and URL are required.');
      return;
    }

    setAdding(true);
    setAddError(null);

    try {
      const nextOrder = links.length;
      await addDoc(collection(db, 'links'), {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || '',
        icon,
        visible: true,
        order: nextOrder,
        createdAt: Date.now(),
      });

      setTitle('');
      setUrl('');
      setDescription('');
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error adding link:', err);
      setAddError(err?.message || 'Failed to add link to Firestore.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleVisible = async (link: LinkItem) => {
    try {
      await updateDoc(doc(db, 'links', link.id), {
        visible: !link.visible,
      });
    } catch (err) {
      console.error('Error toggling link:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      await deleteDoc(doc(db, 'links', id));
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const currentItem = links[index];
    const targetItem = links[targetIndex];

    try {
      await updateDoc(doc(db, 'links', currentItem.id), { order: targetIndex });
      await updateDoc(doc(db, 'links', targetItem.id), { order: index });
    } catch (err) {
      console.error('Error reordering links:', err);
    }
  };

  const handleOpenEdit = (link: LinkItem) => {
    setEditingLink(link);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditDescription(link.description || '');
    setEditIcon(link.icon || 'website');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'links', editingLink.id), {
        title: editTitle.trim(),
        url: editUrl.trim(),
        description: editDescription.trim(),
        icon: editIcon,
      });
      setEditingLink(null);
    } catch (err) {
      console.error('Error updating link:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 18. ADD LINK FORM */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Link2 className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Create Custom Link</h3>
        </div>

        {addError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{addError}</span>
          </div>
        )}

        {addSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Link added to Firestore!</span>
          </div>
        )}

        <form onSubmit={handleAddLink} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Link Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Official Instagram, Telegram Channel"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/srbidasar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Follow for daily story drops & live shows"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Icon Select
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              >
                {AVAILABLE_ICONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>ADD LINK</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* EXISTING LINKS LIST */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Configured Links</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {links.length}
          </span>
        </h3>

        {loading && (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        )}

        {!loading && links.length === 0 && (
          <div className="py-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 p-6 text-slate-400 text-sm">
            No custom links configured yet.
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className="space-y-3">
            {links.map((link, idx) => (
              <div
                key={link.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  link.visible
                    ? 'bg-slate-900/90 border-white/10'
                    : 'bg-slate-900/40 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                    {getLinkIcon(link.icon || link.title)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>{link.title}</span>
                      {!link.visible && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Disabled
                        </span>
                      )}
                    </h4>
                    {link.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {link.description}
                      </p>
                    )}
                    <span className="text-[11px] text-amber-400 font-mono">
                      {link.url}
                    </span>
                  </div>
                </div>

                {/* Actions: Reorder, Edit, Toggle, Delete */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === links.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Visibility */}
                  <button
                    onClick={() => handleToggleVisible(link)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    title={link.visible ? 'Disable link' : 'Enable link'}
                  >
                    {link.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400"
                    title="Edit link"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0f111a] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Edit Custom Link</h3>
              <button
                onClick={() => setEditingLink(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link Name
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Icon
                </label>
                <select
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                >
                  {AVAILABLE_ICONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
