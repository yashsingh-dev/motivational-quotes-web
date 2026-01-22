import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    LogOut,
    LayoutDashboard,
    Users,
    TrendingUp,
    Menu,
    Image as ImageIcon
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Determine active tab based on current path
    const isActive = (path) => {
        if (path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/dashboard/')) return true;
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-30">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                        InspireAdmin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={isActive('/dashboard') && location.pathname === '/dashboard'} // Strict check for exact dashboard match or relying on index
                        onClick={() => navigate('/dashboard')}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Users"
                        active={isActive('/dashboard/users')}
                        onClick={() => navigate('/dashboard/users')}
                    />
                    <SidebarItem
                        icon={ImageIcon}
                        label="Quotes"
                        active={isActive('/dashboard/quotes')}
                        onClick={() => navigate('/dashboard/quotes')}
                    />
                </nav>

                {/* User Profile in Sidebar with Logout Dropup */}
                <div className="p-4 border-t border-slate-100 relative group">
                    {/* Dropup Button */}
                    <div className="absolute bottom-full left-0 w-full px-4 pb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 p-3 bg-white border border-slate-200 shadow-xl rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold">
                                    {user.name ? user.name[0] : 'A'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center px-6 lg:px-10 justify-between md:justify-end">
                    <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="hidden md:block text-slate-800 text-sm font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

// Simple helper component
const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${active
            ? 'bg-purple-50 text-purple-600 font-semibold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}>
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

export default Dashboard;
