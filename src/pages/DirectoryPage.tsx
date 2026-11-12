import React, { useState, useEffect } from 'react';
import { DirectoryMember } from '../types';
import {
  fetchDirectory,
  createDirectoryMember,
  updateDirectoryMember,
  deleteDirectoryMember,
  subscribeToSync,
} from '../services/api';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CheckCircle2,
  X,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface DirectoryPageProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

export const DirectoryPage: React.FC<DirectoryPageProps> = ({ onNotify }) => {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DirectoryMember | null>(null);
  const [fullName, setFullName] = useState('');
  const [positionUnit, setPositionUnit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DirectoryMember | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDirectory();
      setMembers(data);
    } catch (err: any) {
      onNotify('error', 'Gagal memuatkan senarai direktori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToSync(() => {
      fetchDirectory().then(setMembers).catch(() => {});
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFullName('');
    setPositionUnit('');
    setEmail('');
    setPhone('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: DirectoryMember) => {
    setEditingMember(member);
    setFullName(member.full_name);
    setPositionUnit(member.position_unit);
    setEmail(member.email);
    setPhone(member.phone_whatsapp);
    setFormError('');
    setIsModalOpen(true);
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // FR-002 Validations
    if (!fullName.trim() || !positionUnit.trim() || !email.trim() || !phone.trim()) {
      setFormError('Sila lengkapkan semua maklumat wajib.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setFormError('Format alamat e-mel tidak sah. Sila masukkan e-mel yang betul.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setFormError('Format nombor telefon tidak sah (contoh: 60123456789).');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingMember) {
        const updated = await updateDirectoryMember(editingMember.id, {
          full_name: fullName.trim(),
          position_unit: positionUnit.trim(),
          email: email.trim().toLowerCase(),
          phone_whatsapp: cleanPhone,
        });
        setMembers(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        onNotify('success', `Maklumat ${updated.full_name} berjaya dikemas kini.`);
      } else {
        const created = await createDirectoryMember({
          full_name: fullName.trim(),
          position_unit: positionUnit.trim(),
          email: email.trim().toLowerCase(),
          phone_whatsapp: cleanPhone,
        });
        setMembers(prev => [created, ...prev]);
        onNotify('success', `Ahli baru ${created.full_name} berjaya didaftarkan ke direktori.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Ralat menyimpan maklumat direktori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDirectoryMember(deleteTarget.id);
      setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
      onNotify('success', `Rekod ${deleteTarget.full_name} telah dipadam.`);
    } catch (err: any) {
      onNotify('error', err.message || 'Gagal memadam ahli direktori.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.position_unit.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone_whatsapp.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Pangkalan Data Pengurusan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Direktori Tetap Pengarah & Ketua Unit
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Senarai rasmi pengurusan tertinggi LGM bagi memudahkan pemilihan jemputan mesyuarat
            tanpa perlu mengisi butiran berulang kali.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-sm transition-all cursor-pointer self-start md:self-center"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>Tambah Pengarah / Pegawai</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama pegawai, jawatan, atau bahagian..."
            className="block w-full pl-10 pr-4 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Jumlah Ahli: <span className="text-emerald-900 font-bold">{filteredMembers.length}</span> orang
        </div>
      </div>

      {/* Directory Grid / Table */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-xs font-semibold text-slate-500">Memuatkan direktori LGM...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Tiada Rekod Dijumpai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tiada ahli direktori berpadanan dengan kata carian "${searchQuery}".`
                : 'Belum ada ahli direktori didaftarkan.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Kosongkan Carian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      Pengurusan LGM
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(member)}
                        title="Kemas kini maklumat"
                        className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(member)}
                        title="Padam rekod"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-950 transition-colors leading-snug">
                    {member.full_name}
                  </h3>

                  <div className="mt-1 flex items-start gap-1.5 text-xs font-medium text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{member.position_unit}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate select-all">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{member.phone_whatsapp}</span>
                    <a
                      href={`https://wa.me/${member.phone_whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingMember ? 'Kemas Kini Pegawai' : 'Daftar Pengarah / Ketua Unit Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="mt-5 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Penuh & Gelaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="cth: YBhg. Dato' Dr. Zairossani bin Mohd Nor"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Jawatan / Bahagian / Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={positionUnit}
                    onChange={e => setPositionUnit(e.target.value)}
                    placeholder="cth: Pengarah Bahagian Penyelidikan Biologi Getah"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Alamat E-mel Rasmi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="cth: nama.pegawai@lgm.gov.my"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    No. Telefon WhatsApp (Format Malaysia) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="cth: 60123456789"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gunakan kod negara &apos;60&apos; tanpa simbol &apos;+&apos; untuk memudahkan pautan WhatsApp rasmi.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{editingMember ? 'Simpan Perubahan' : 'Daftar Pegawai'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete (PRD 13) */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Sahkan Pemadaman Rekod"
        message={`Adakah anda pasti ingin memadam rekod "${deleteTarget?.full_name}" daripada Direktori Tetap? Rekod ini tidak akan dapat dipulihkan.`}
        confirmText="Ya, Padam Rekod"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
