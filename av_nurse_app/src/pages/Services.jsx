import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const services = [
    {
        id: 1,
        category: 'Membership Plans',
        icon: '💎',
        color: 'bg-purple-50',
        textColor: 'text-purple-600',
        items: [
            { name: 'Premium Membership', description: 'Unlimited consultations & benefits', path: '/membership-plans' },
            { name: 'Family Plans', description: 'Healthcare for entire family', path: '/membership-plans' },
            { name: 'Senior Care Plans', description: 'Specialized plans for seniors', path: '/membership-plans' },
        ]
    },
    {
        id: 2,
        category: 'Insurance Plans',
        icon: '🛡️',
        color: 'bg-blue-50',
        textColor: 'text-blue-600',
        items: [
            { name: 'Health Insurance', description: 'Comprehensive coverage plans', path: '/health-insurance' },
            { name: 'Track Claims', description: 'Monitor your claim status', path: '/claims-tracker' },
            { name: 'File New Claim', description: 'Submit insurance claims', path: '/claims-tracker' },
        ]
    },
    {
        id: 3,
        category: 'Doctor Consultations',
        icon: '👨‍⚕️',
        color: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        items: [
            { name: 'Video Consultation', description: 'Talk to doctors online', path: '/ai-health-assistant' },
            { name: 'AI Health Assistant', description: 'Get instant health advice', path: '/ai-health-assistant' },
            { name: 'Second Opinion', description: 'Expert medical opinions', path: '/ai-health-assistant' },
        ]
    },

];

export default function Services() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);

    const filteredServices = services.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    return (
        <div className="bg-background min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-14 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-extrabold text-slate-900">Our Services</h1>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="flex size-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 relative hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
                        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent-red animate-pulse"></span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search services..."
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </header>

            {/* Services Accordion */}
            <main className="px-5 py-6 space-y-3">
                {filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 font-medium">No services found</p>
                    </div>
                ) : (
                    filteredServices.map((category) => (
                        <div key={category.id} className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                            {/* Category Header - Clickable */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex size-12 items-center justify-center rounded-xl ${category.color}`}>
                                        <span className="text-2xl">{category.icon}</span>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-base font-bold text-slate-900">{category.category}</h2>
                                        <p className="text-xs font-medium text-slate-500">{category.items.length} services</p>
                                    </div>
                                </div>
                                <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>

                            {/* Expandable Service Items */}
                            {expandedCategory === category.id && (
                                <div className="border-t border-slate-100 p-4 pt-3 space-y-2 animate-in slide-in-from-top duration-200">
                                    {category.items.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => navigate(item.path)}
                                            className="w-full bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-all active:scale-[0.98] text-left group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs font-medium text-slate-500 mt-1 leading-snug">
                                                        {item.description}
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-[20px]">
                                                    arrow_forward
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </main>

            {/* Popular Services Banner */}
            {searchQuery === '' && (
                <div className="px-5 pb-6">
                    <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                        <p className="text-sm text-white/90 mb-4">
                            Talk to our AI Health Assistant for instant support
                        </p>
                        <button
                            onClick={() => navigate('/ai-health-assistant')}
                            className="px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold border border-white/30 hover:bg-white/30 transition-colors active:scale-95"
                        >
                            Chat Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
