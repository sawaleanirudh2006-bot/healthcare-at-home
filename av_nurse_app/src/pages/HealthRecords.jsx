import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Download, Trash2, Eye, Calendar, Plus } from 'lucide-react';

const HealthRecords = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState(() => {
        const storedRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
        if (storedRecords.length === 0) {
            const dummyRecords = [
                { id: 1, name: 'Blood Test Report', type: 'Lab Report', date: '2023-10-20', size: '2.4 MB' },
                { id: 2, name: 'Prescription - Dr. Rajesh', type: 'Prescription', date: '2023-10-15', size: '1.1 MB' },
            ];
            localStorage.setItem('healthRecords', JSON.stringify(dummyRecords));
            return dummyRecords;
        } else {
            return storedRecords;
        }
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newRecord = {
                id: Date.now(),
                name: file.name,
                type: 'Uploaded Document',
                date: new Date().toISOString().split('T')[0],
                size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
            };
            const updatedRecords = [newRecord, ...records];
            setRecords(updatedRecords);
            localStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
        }
    };

    const handleDelete = (id) => {
        const updatedRecords = records.filter(r => r.id !== id);
        setRecords(updatedRecords);
        localStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    };

    return (
        <div className="bg-background min-h-screen max-w-[430px] mx-auto relative flex flex-col">
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md pt-12 pb-4 px-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Health Records</h1>
                </div>
            </header>

            <main className="px-5 py-6 flex-1 pb-24 space-y-6">
                {/* Upload Box */}
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-dashed border-primary/20 text-center">
                    <div className="size-12 rounded-full bg-white mx-auto flex items-center justify-center shadow-sm mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Upload New Record</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Support for PDF, JPG, PNG</p>
                    <label className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors">
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                        Browse Files
                    </label>
                </div>

                {/* Records List */}
                <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-4">All Documents ({records.length})</h2>
                    <div className="space-y-3">
                        {records.map((record) => (
                            <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                                <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-slate-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm truncate">{record.name}</h3>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                                        <span>{record.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{record.date}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-lg hover:bg-slate-200 text-slate-600">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(record.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HealthRecords;
