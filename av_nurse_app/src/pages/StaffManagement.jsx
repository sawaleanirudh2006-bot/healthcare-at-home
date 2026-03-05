import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Phone, MapPin, Award, Mail,
    Star, Activity, Calendar, Clock,
    ChevronRight, X, Stethoscope, Heart,
    Plus, Trash2, Edit2, Save, User
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const statusColor = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const SPECIALTIES = ['General Physician', 'Internal Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'ENT', 'Psychiatry', 'Other'];
const AREAS = ['Shivajinagar', 'Kothrud', 'Viman Nagar', 'Hinjewadi', 'Hadapsar', 'Baner', 'Kalyani Nagar', 'Wakad', 'Pimpri-Chinchwad', 'Aundh', 'Pimple Nilakh', 'Pimple Saudagar', 'Kharadi', 'Koregaon Park', 'Wagholi', 'Bhosari', 'Nigdi', 'Akurdi', 'Ravet', 'Katraj', 'Dhankawadi', 'Bibwewadi', 'Kondhwa', 'Wanowrie', 'Magarpatta City', 'Bavdhan', 'Pashan', 'Balewadi', 'Warje', 'Karve Nagar', 'Erandwane', 'Deccan', 'Camp', 'Yerawada', 'Vishrantwadi', 'Dhanori', 'Lohegaon', 'Undri', 'Wadgaon Sheri', 'Other'];

const defaultDocForm = { name: '', specialty: 'General Physician', phone: '', email: '', experience: '', qualification: '', hospital: '', notes: '' };
const defaultNurseForm = { name: '', area: 'Shivajinagar', phone: '', email: '', experience: '', qualification: '', rating: '', notes: '' };

// ── Add/Edit Modal ────────────────────────────────────────────────────────────
function StaffModal({ type, initial, onSave, onClose }) {
    const isDoctor = type === 'doctor';
    const [form, setForm] = useState(initial || (isDoctor ? defaultDocForm : defaultNurseForm));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Name is required.'); return; }
        if (!form.phone.trim()) { setError('Phone is required.'); return; }
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    const accent = isDoctor ? 'blue' : 'emerald';
    const focusCls = isDoctor ? 'focus:border-blue-500' : 'focus:border-emerald-500';

    return (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className={`bg-gradient-to-br ${isDoctor ? 'from-blue-600 to-indigo-700' : 'from-emerald-500 to-teal-600'} rounded-t-3xl p-6 text-white`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                {isDoctor ? <Stethoscope className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold">{initial ? 'Edit' : 'Add New'} {isDoctor ? 'Doctor' : 'Nurse'}</h2>
                                <p className="text-white/70 text-xs">{initial ? 'Update staff details' : 'Register a new staff member'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl">⚠️ {error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={isDoctor ? 'Dr. Rahul Sharma' : 'Nurse Priya Singh'}
                                className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400`} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{isDoctor ? 'Specialty' : 'Area / Zone'}</label>
                            <select value={isDoctor ? form.specialty : form.area} onChange={e => set(isDoctor ? 'specialty' : 'area', e.target.value)}
                                className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50`}>
                                {(isDoctor ? SPECIALTIES : AREAS).map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone *</label>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="98765 43210" maxLength={10} type="tel"
                                className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400`} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                            <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="staff@hospital.com" type="email"
                                className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400`} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Experience</label>
                            <input value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="5 years"
                                className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400`} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Qualification</label>
                            <input value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder={isDoctor ? 'MBBS, MD' : 'GNM, B.Sc Nursing'}
                                className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400`} />
                        </div>

                        {isDoctor ? (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Hospital / Clinic</label>
                                <input value={form.hospital} onChange={e => set('hospital', e.target.value)} placeholder="Sassoon Hospital Pune"
                                    className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400`} />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Initial Rating</label>
                                <input value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.5" type="number" min="1" max="5" step="0.1"
                                    className={`w-full h-11 px-4 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400`} />
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notes</label>
                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any additional information..."
                                className={`w-full px-4 py-3 border-2 border-slate-200 ${focusCls} rounded-xl outline-none text-sm font-medium bg-slate-50 placeholder:font-normal placeholder:text-slate-400 resize-none`} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                        className={`flex-1 py-3 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 ${isDoctor ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-100' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-100'}`}>
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {initial ? 'Update' : 'Add'} {isDoctor ? 'Doctor' : 'Nurse'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose }) {
    return (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">Remove Staff Member?</h2>
                <p className="text-slate-500 text-sm mb-6">Are you sure you want to remove <span className="font-bold text-slate-700">"{name}"</span>? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100">Remove</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
const StaffManagement = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'doctors');
    const [loading, setLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editModal, setEditModal] = useState(null); // { type, data }
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }
    const [allBookings, setAllBookings] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);

    // ── Persist to localStorage ───────────────────────────────────────────────
    const saveLocalDoctors = (list) => localStorage.setItem('admin_doctors', JSON.stringify(list));
    const saveLocalNurses = (list) => localStorage.setItem('admin_nurses', JSON.stringify(list));

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: bks } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
            const mapped = (bks || []).map(b => {
                let notes = {};
                try { notes = JSON.parse(b.notes || '{}'); } catch (_) { }
                return {
                    id: b.id, service: b.service_name || '—',
                    patient: notes.patient_name || b.user_id?.slice(0, 8) || '—',
                    date: b.date || b.created_at, time: b.time || '—', status: b.status || 'pending',
                    nurseId: notes.nurse_id || null, nurseName: notes.assigned_nurse_name || '—',
                    price: Number(b.total_price || 0), createdAt: b.created_at,
                    isMedicine: notes.is_medicine_order || false, feedback: notes.feedback || null,
                };
            });
            setAllBookings(mapped);

            const { data: rxs } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
            setPrescriptions(rxs || []);

            // Build doctors from prescriptions
            const doctorMap = {};
            (rxs || []).forEach(rx => {
                const did = rx.doctor_id; if (!did) return;
                if (!doctorMap[did]) doctorMap[did] = { id: did, name: rx.doctor_name || `Dr. ${String(did).slice(0, 8)}`, email: rx.doctor_email || '—', totalReviewed: 0, approved: 0, rejected: 0, pending: 0, prescriptions: [], lastActive: null };
                doctorMap[did].totalReviewed++;
                if (rx.status === 'approved') doctorMap[did].approved++;
                else if (rx.status === 'rejected') doctorMap[did].rejected++;
                else doctorMap[did].pending++;
                doctorMap[did].prescriptions.push(rx);
                const d = rx.reviewed_at || rx.created_at;
                if (!doctorMap[did].lastActive || d > doctorMap[did].lastActive) doctorMap[did].lastActive = d;
            });

            // Merge with admin-added doctors
            const adminDoctors = JSON.parse(localStorage.getItem('admin_doctors') || '[]');
            const realDoctors = Object.values(doctorMap);
            const merged = [...realDoctors];
            adminDoctors.forEach(ad => { if (!merged.find(d => d.id === ad.id)) merged.push({ ...ad, totalReviewed: 0, approved: 0, rejected: 0, pending: 0, prescriptions: [], lastActive: null }); });
            setDoctors(merged.length > 0 ? merged : [
                { id: 'doc-1', name: 'Dr. Rajesh Kumar', specialty: 'General Physician', phone: '9876543210', email: 'dr.rajesh@hospital.com', experience: '15 years', totalReviewed: 0, approved: 0, rejected: 0, pending: 0, prescriptions: [], lastActive: null },
                { id: 'doc-2', name: 'Dr. Priya Sharma', specialty: 'Internal Medicine', phone: '9876543211', email: 'dr.priya@hospital.com', experience: '12 years', totalReviewed: 0, approved: 0, rejected: 0, pending: 0, prescriptions: [], lastActive: null },
            ]);

            // Build nurses from bookings
            const nurseMap = {};
            mapped.filter(b => !b.isMedicine && b.nurseId).forEach(b => {
                if (!nurseMap[b.nurseId]) nurseMap[b.nurseId] = { id: b.nurseId, name: b.nurseName || `Nurse ${String(b.nurseId).slice(0, 8)}`, totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0, totalRevenue: 0, bookings: [], feedbacks: [], lastActive: null };
                nurseMap[b.nurseId].totalJobs++;
                if (b.status === 'confirmed' || b.status === 'upcoming') nurseMap[b.nurseId].activeJobs++;
                if (b.status === 'completed') nurseMap[b.nurseId].completedJobs++;
                if (b.status === 'cancelled') nurseMap[b.nurseId].cancelledJobs++;
                if (b.status !== 'cancelled') nurseMap[b.nurseId].totalRevenue += b.price;
                if (b.feedback) nurseMap[b.nurseId].feedbacks.push({ ...b.feedback, patient: b.patient, service: b.service });
                nurseMap[b.nurseId].bookings.push(b);
                if (!nurseMap[b.nurseId].lastActive || b.createdAt > nurseMap[b.nurseId].lastActive) nurseMap[b.nurseId].lastActive = b.createdAt;
            });

            const adminNurses = JSON.parse(localStorage.getItem('admin_nurses') || '[]');
            const realNurses = Object.values(nurseMap).map(n => {
                if (n.feedbacks.length > 0) n.rating = (n.feedbacks.reduce((s, f) => s + f.rating, 0) / n.feedbacks.length).toFixed(1);
                else n.rating = null; return n;
            });
            const mergedNurses = [...realNurses];
            adminNurses.forEach(an => { if (!mergedNurses.find(n => n.id === an.id)) mergedNurses.push({ ...an, totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0, totalRevenue: 0, bookings: [], feedbacks: [] }); });
            setNurses(mergedNurses.length > 0 ? mergedNurses : [
                { id: 'nurse-1', name: 'Nurse Sarah', area: 'Shivajinagar', phone: '9876543220', rating: 4.8, experience: '8 years', totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0, totalRevenue: 0, bookings: [], lastActive: null },
                { id: 'nurse-2', name: 'Nurse Priya', area: 'Kothrud', phone: '9876543221', rating: 4.9, experience: '10 years', totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0, totalRevenue: 0, bookings: [], lastActive: null },
            ]);
        } catch (err) { console.error('Staff load error:', err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ── CRUD handlers ─────────────────────────────────────────────────────────
    const handleAdd = async (form) => {
        const id = `${activeTab === 'doctors' ? 'doc' : 'nurse'}-admin-${Date.now()}`;
        if (activeTab === 'doctors') {
            const newDoc = { ...form, id, isAdminAdded: true, createdAt: new Date().toISOString() };
            const current = JSON.parse(localStorage.getItem('admin_doctors') || '[]');
            saveLocalDoctors([...current, newDoc]);
            setDoctors(prev => [{ ...newDoc, totalReviewed: 0, approved: 0, rejected: 0, pending: 0, prescriptions: [], lastActive: null }, ...prev]);
        } else {
            const newNurse = { ...form, id, isAdminAdded: true, createdAt: new Date().toISOString() };
            const current = JSON.parse(localStorage.getItem('admin_nurses') || '[]');
            saveLocalNurses([...current, newNurse]);
            setNurses(prev => [{ ...newNurse, totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0, totalRevenue: 0, bookings: [], feedbacks: [] }, ...prev]);
        }
        setShowAddModal(false);
    };

    const handleEdit = async (form) => {
        if (editModal.type === 'doctor') {
            setDoctors(prev => prev.map(d => d.id === editModal.data.id ? { ...d, ...form } : d));
            const current = JSON.parse(localStorage.getItem('admin_doctors') || '[]');
            saveLocalDoctors(current.map(d => d.id === editModal.data.id ? { ...d, ...form } : d));
        } else {
            setNurses(prev => prev.map(n => n.id === editModal.data.id ? { ...n, ...form } : n));
            const current = JSON.parse(localStorage.getItem('admin_nurses') || '[]');
            saveLocalNurses(current.map(n => n.id === editModal.data.id ? { ...n, ...form } : n));
        }
        setEditModal(null);
    };

    const handleDelete = () => {
        if (!deleteConfirm) return;
        if (deleteConfirm.type === 'doctor') {
            setDoctors(prev => prev.filter(d => d.id !== deleteConfirm.id));
            const current = JSON.parse(localStorage.getItem('admin_doctors') || '[]');
            saveLocalDoctors(current.filter(d => d.id !== deleteConfirm.id));
        } else {
            setNurses(prev => prev.filter(n => n.id !== deleteConfirm.id));
            const current = JSON.parse(localStorage.getItem('admin_nurses') || '[]');
            saveLocalNurses(current.filter(n => n.id !== deleteConfirm.id));
        }
        setDeleteConfirm(null);
    };

    // ── Detail Modals ─────────────────────────────────────────────────────────
    const renderDoctorDetail = (doctor) => (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedStaff(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-t-3xl p-6 text-white relative">
                    <button onClick={() => setSelectedStaff(null)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Stethoscope className="w-8 h-8 text-white" /></div>
                        <div>
                            <h2 className="text-xl font-extrabold">{doctor.name}</h2>
                            <p className="text-blue-100 text-sm font-medium">{doctor.specialty || 'Doctor'}</p>
                            {doctor.lastActive && <p className="text-blue-200 text-xs mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Last active: {fmtDate(doctor.lastActive)}</p>}
                        </div>
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    <div className="space-y-2">
                        {doctor.phone && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><Phone className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{doctor.phone}</span></div>}
                        {doctor.email && doctor.email !== '—' && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><Mail className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{doctor.email}</span></div>}
                        {doctor.experience && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><Award className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{doctor.experience} experience</span></div>}
                        {doctor.hospital && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><User className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{doctor.hospital}</span></div>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ label: 'Total Reviewed', val: doctor.totalReviewed, color: 'blue' }, { label: 'Approved', val: doctor.approved, color: 'emerald' }, { label: 'Rejected', val: doctor.rejected, color: 'red' }, { label: 'Pending', val: doctor.pending, color: 'amber' }].map(s => (
                            <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-4 text-center`}>
                                <p className={`text-2xl font-extrabold text-${s.color}-700`}>{s.val}</p>
                                <p className={`text-xs font-semibold text-${s.color}-500 mt-1`}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                    {doctor.totalReviewed > 0 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4">
                            <div className="flex justify-between mb-2"><p className="text-sm font-bold text-indigo-900">Approval Rate</p><p className="text-lg font-extrabold text-indigo-700">{Math.round((doctor.approved / doctor.totalReviewed) * 100)}%</p></div>
                            <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${(doctor.approved / doctor.totalReviewed) * 100}%` }} /></div>
                        </div>
                    )}
                    {/* Admin Actions */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => { setSelectedStaff(null); setEditModal({ type: 'doctor', data: doctor }); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-blue-200 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors">
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => { setSelectedStaff(null); setDeleteConfirm({ type: 'doctor', id: doctor.id, name: doctor.name }); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-red-200 text-red-500 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" /> Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNurseDetail = (nurse) => (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedStaff(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-t-3xl p-6 text-white relative">
                    <button onClick={() => setSelectedStaff(null)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Heart className="w-8 h-8 text-white" /></div>
                        <div>
                            <h2 className="text-xl font-extrabold">{nurse.name}</h2>
                            {nurse.area && <p className="text-emerald-100 text-sm font-medium">{nurse.area}</p>}
                            {nurse.lastActive && <p className="text-emerald-200 text-xs mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Last active: {fmtDate(nurse.lastActive)}</p>}
                        </div>
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    <div className="space-y-2">
                        {nurse.phone && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><Phone className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{nurse.phone}</span></div>}
                        {nurse.area && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{nurse.area}</span></div>}
                        {nurse.experience && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><Award className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{nurse.experience} experience</span></div>}
                        {nurse.rating && <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"><Star className="w-4 h-4 text-amber-500" /><span className="text-sm font-bold text-amber-700">⭐ {nurse.rating} Rating</span></div>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ label: 'Total Jobs', val: nurse.totalJobs, color: 'blue' }, { label: 'Active Now', val: nurse.activeJobs, color: 'emerald' }, { label: 'Completed', val: nurse.completedJobs, color: 'teal' }, { label: 'Revenue', val: `₹${(nurse.totalRevenue || 0).toLocaleString()}`, color: 'amber' }].map(s => (
                            <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-4 text-center`}>
                                <p className={`text-xl font-extrabold text-${s.color}-700`}>{s.val}</p>
                                <p className={`text-xs font-semibold text-${s.color}-500 mt-1`}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                    {/* Admin Actions */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => { setSelectedStaff(null); setEditModal({ type: 'nurse', data: nurse }); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-emerald-200 text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors">
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => { setSelectedStaff(null); setDeleteConfirm({ type: 'nurse', id: nurse.id, name: nurse.name }); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-red-200 text-red-500 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" /> Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-3xl mx-auto px-5 pt-12 pb-4">
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={() => navigate('/admin/dashboard')} className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-extrabold text-slate-900">Staff Management</h1>
                        {/* Add Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-md ${activeTab === 'doctors' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200'}`}
                        >
                            <Plus className="w-4 h-4" />
                            Add {activeTab === 'doctors' ? 'Doctor' : 'Nurse'}
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {[{ id: 'doctors', label: `Doctors (${doctors.length})`, icon: Stethoscope, active: 'from-blue-600 to-indigo-600 shadow-blue-200' }, { id: 'nurses', label: `Nurses (${nurses.length})`, icon: Heart, active: 'from-emerald-500 to-teal-600 shadow-emerald-200' }].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? `bg-gradient-to-r ${tab.active} text-white shadow-md` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-5 py-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading staff data…</p>
                    </div>
                ) : (
                    <>
                        {/* ── DOCTORS TAB ── */}
                        {activeTab === 'doctors' && (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div><p className="text-2xl font-extrabold">{doctors.length}</p><p className="text-xs text-blue-200 font-medium">Total Doctors</p></div>
                                        <div><p className="text-2xl font-extrabold">{prescriptions.length}</p><p className="text-xs text-blue-200 font-medium">Prescriptions</p></div>
                                        <div><p className="text-2xl font-extrabold">{prescriptions.filter(r => r.status === 'approved').length}</p><p className="text-xs text-blue-200 font-medium">Approved</p></div>
                                    </div>
                                </div>

                                {doctors.map(doctor => (
                                    <div key={doctor.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                                <Stethoscope className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-bold text-slate-900 truncate">{doctor.name}</h3>
                                                        <p className="text-sm text-slate-500">{doctor.specialty || 'Doctor'}</p>
                                                    </div>
                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button onClick={() => setSelectedStaff({ type: 'doctor', data: doctor })}
                                                            className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                                                            View
                                                        </button>
                                                        <button onClick={() => setEditModal({ type: 'doctor', data: doctor })}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm({ type: 'doctor', id: doctor.id, name: doctor.name })}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                    {doctor.phone && <span className="flex items-center gap-1 text-xs text-slate-400"><Phone className="w-3 h-3" /> {doctor.phone}</span>}
                                                    {doctor.experience && <span className="flex items-center gap-1 text-xs text-slate-400"><Award className="w-3 h-3" /> {doctor.experience}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">{doctor.totalReviewed} reviewed</span>
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">{doctor.approved} approved</span>
                                                    {doctor.pending > 0 && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">{doctor.pending} pending</span>}
                                                    {doctor.isAdminAdded && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100">Admin Added</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {doctors.length === 0 && (
                                    <div className="text-center py-16 text-slate-400">
                                        <Stethoscope className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                        <p className="text-sm font-medium">No doctors found</p>
                                        <button onClick={() => setShowAddModal(true)} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">+ Add First Doctor</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── NURSES TAB ── */}
                        {activeTab === 'nurses' && (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div><p className="text-2xl font-extrabold">{nurses.length}</p><p className="text-xs text-emerald-100 font-medium">Total Nurses</p></div>
                                        <div><p className="text-2xl font-extrabold">{nurses.reduce((s, n) => s + n.activeJobs, 0)}</p><p className="text-xs text-emerald-100 font-medium">Active Jobs</p></div>
                                        <div><p className="text-2xl font-extrabold">₹{nurses.reduce((s, n) => s + (n.totalRevenue || 0), 0).toLocaleString()}</p><p className="text-xs text-emerald-100 font-medium">Total Revenue</p></div>
                                    </div>
                                </div>

                                {nurses.map(nurse => (
                                    <div key={nurse.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-100 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                                                <Heart className="w-7 h-7 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-bold text-slate-900 truncate">{nurse.name}</h3>
                                                        {nurse.area && <p className="text-sm text-slate-500">{nurse.area}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${nurse.activeJobs > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {nurse.activeJobs > 0 ? '● Active' : '○ Idle'}
                                                        </span>
                                                        <button onClick={() => setSelectedStaff({ type: 'nurse', data: nurse })}
                                                            className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors ml-1">
                                                            View
                                                        </button>
                                                        <button onClick={() => setEditModal({ type: 'nurse', data: nurse })}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm({ type: 'nurse', id: nurse.id, name: nurse.name })}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                    {nurse.phone && <span className="flex items-center gap-1 text-xs text-slate-400"><Phone className="w-3 h-3" /> {nurse.phone}</span>}
                                                    {nurse.rating && <span className="flex items-center gap-1 text-xs text-amber-600 font-bold"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {nurse.rating}</span>}
                                                    {nurse.experience && <span className="flex items-center gap-1 text-xs text-slate-400"><Award className="w-3 h-3" /> {nurse.experience}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">{nurse.totalJobs} jobs</span>
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">{nurse.completedJobs} completed</span>
                                                    {nurse.isAdminAdded && <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-full border border-teal-100">Admin Added</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {nurses.length === 0 && (
                                    <div className="text-center py-16 text-slate-400">
                                        <Heart className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                        <p className="text-sm font-medium">No nurses found</p>
                                        <button onClick={() => setShowAddModal(true)} className="mt-3 px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors">+ Add First Nurse</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Modals ── */}
            {selectedStaff?.type === 'doctor' && renderDoctorDetail(selectedStaff.data)}
            {selectedStaff?.type === 'nurse' && renderNurseDetail(selectedStaff.data)}

            {showAddModal && (
                <StaffModal type={activeTab === 'doctors' ? 'doctor' : 'nurse'} initial={null} onSave={handleAdd} onClose={() => setShowAddModal(false)} />
            )}
            {editModal && (
                <StaffModal type={editModal.type} initial={editModal.data} onSave={handleEdit} onClose={() => setEditModal(null)} />
            )}
            {deleteConfirm && (
                <DeleteConfirm name={deleteConfirm.name} onConfirm={handleDelete} onClose={() => setDeleteConfirm(null)} />
            )}
        </div>
    );
};

export default StaffManagement;
