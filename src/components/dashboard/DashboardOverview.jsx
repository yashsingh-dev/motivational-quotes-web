import React, { useState, useEffect } from 'react';
import {
    Users,
    Image as ImageIcon,
    UserCheck,
    TrendingUp,
    Clock,
    Eye,
    Youtube,
    Facebook,
    Instagram,
    Link as LinkIcon,
    Save,
    Loader2,
    CheckCircle2,
    Sparkles,
    Power
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const DashboardOverview = () => {
    const navigate = useNavigate();

    // State management
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalImages: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentQuotes, setRecentQuotes] = useState([]);
    const [socialLinks, setSocialLinks] = useState({
        youtube: { url: '', isActive: true },
        facebook: { url: '', isActive: true },
        instagram: { url: '', isActive: true },
        threads: { url: '', isActive: true }
    });
    const [loading, setLoading] = useState(true);
    const [savingLinks, setSavingLinks] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [togglingPlatform, setTogglingPlatform] = useState(null);

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch stats
            const statsRes = await api.get('api/admin/dashboard/stats');
            setStats(statsRes.data.payload);

            // Fetch recent users (limited to 5)
            const usersRes = await api.get('api/admin/users?limit=5&page=1');
            setRecentUsers(usersRes.data.payload.users);

            // Fetch recent quotes (limited to 6)
            const quotesRes = await api.get('api/admin/images?limit=6&page=1');
            setRecentQuotes(quotesRes.data.payload.images);

            // Fetch social media links
            const socialRes = await api.get('api/user/social-media');
            const linksData = {};
            socialRes.data.payload.forEach(link => {
                linksData[link.platform] = {
                    url: link.url,
                    isActive: link.isActive !== undefined ? link.isActive : true
                };
            });
            setSocialLinks(linksData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLinkChange = (platform, value) => {
        setSocialLinks(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                url: value
            }
        }));
    };

    const handleToggleActive = async (platform) => {
        try {
            setTogglingPlatform(platform);

            // Call the toggle API
            const response = await api.patch(`api/admin/social-media/${platform}/toggle`);

            // Update local state with the response
            setSocialLinks(prev => ({
                ...prev,
                [platform]: {
                    ...prev[platform],
                    isActive: response.data.payload.isActive
                }
            }));
        } catch (error) {
            console.error('Error toggling platform status:', error);
            alert(`Failed to toggle ${platform} status`);
        } finally {
            setTogglingPlatform(null);
        }
    };

    const handleSaveSocialLinks = async () => {
        try {
            setSavingLinks(true);
            setSaveSuccess(false);

            // Send all links in a single API call
            await api.put('api/admin/social-media', { links: socialLinks });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving social links:', error);
            alert('Failed to save social media links');
        } finally {
            setSavingLinks(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    const socialPlatforms = [
        { name: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-600', bg: 'bg-red-50', placeholder: 'https://youtube.com/@yourchannel' },
        { name: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600', bg: 'bg-blue-50', placeholder: 'https://facebook.com/yourpage' },
        { name: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-50', placeholder: 'https://instagram.com/youraccount' },
        { name: 'threads', icon: LinkIcon, label: 'Threads', color: 'text-slate-900', bg: 'bg-slate-50', placeholder: 'https://threads.com/@youraccount' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-purple-600" />
                        Dashboard Overview
                    </h2>
                    <p className="text-slate-500 mt-1">Welcome back! Here's your platform insights.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-100"
                    gradientFrom="from-blue-500"
                    gradientTo="to-blue-600"
                />
                <StatCard
                    label="Active Users"
                    value={stats.activeUsers.toLocaleString()}
                    icon={UserCheck}
                    color="text-emerald-600"
                    bg="bg-emerald-100"
                    gradientFrom="from-emerald-500"
                    gradientTo="to-emerald-600"
                />
                <StatCard
                    label="Total Quote Images"
                    value={stats.totalImages.toLocaleString()}
                    icon={ImageIcon}
                    color="text-purple-600"
                    bg="bg-purple-100"
                    gradientFrom="from-purple-500"
                    gradientTo="to-purple-600"
                />
            </div>

            {/* Recent Quotes Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Recent Uploaded Quotes</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Latest motivational quotes uploaded</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/quotes')}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 group"
                    >
                        View All
                        <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {recentQuotes.length === 0 ? (
                    <div className="p-12 text-center">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No quotes uploaded yet</p>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {recentQuotes.map((quote) => (
                            <div
                                key={quote._id}
                                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                onClick={() => navigate('/dashboard/quotes')}
                            >
                                <img
                                    src={quote.s3Url}
                                    alt={quote.originalName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-white text-xs font-medium truncate">{quote.originalName}</p>
                                        <p className="text-white/80 text-xs">{getTimeAgo(quote.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Users Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Recently Joined Users</h3>
                        <p className="text-sm text-slate-500 mt-0.5">New members of your community</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/users')}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 group"
                    >
                        View All
                        <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {recentUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No users yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">WhatsApp</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/users')}>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold text-sm">
                                                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-semibold">{user.name || 'No Name'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.whatsapp ? (
                                                <span className="font-medium">{user.whatsapp}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">Not provided</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Social Media Links Editor */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-purple-600" />
                                Social Media Links
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">Manage your social media presence</p>
                        </div>
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Saved successfully!</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {socialPlatforms.map((platform) => {
                            const Icon = platform.icon;
                            const isActive = socialLinks[platform.name]?.isActive;
                            return (
                                <div key={platform.name} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${platform.bg} ${!isActive ? 'opacity-50' : ''}`}>
                                                <Icon className={`w-4 h-4 ${platform.color}`} />
                                            </div>
                                            <span className={!isActive ? 'opacity-50' : ''}>{platform.label}</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(platform.name)}
                                            disabled={togglingPlatform === platform.name}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                } ${togglingPlatform === platform.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {togglingPlatform === platform.name ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Power className="w-3.5 h-3.5" />
                                            )}
                                            {isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                    <input
                                        type="url"
                                        value={socialLinks[platform.name]?.url || ''}
                                        onChange={(e) => handleSocialLinkChange(platform.name, e.target.value)}
                                        placeholder={platform.placeholder}
                                        disabled={!isActive}
                                        className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm ${!isActive ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
                                            }`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveSocialLinks}
                            disabled={savingLinks}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingLinks ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// StatCard Component
const StatCard = ({ label, value, icon: Icon, color, bg, gradientFrom, gradientTo }) => (
    <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity blur-xl"
            style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}></div>
        <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
            <p className={`text-4xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
                {value}
            </p>
        </div>
    </div>
);

export default DashboardOverview;
