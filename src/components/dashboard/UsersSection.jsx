import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Search, X, Check, AlertCircle, Loader, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';

const UsersSection = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [statusLoading, setStatusLoading] = useState(new Set());

    // Pagination State
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== searchQuery) {
                setDebouncedSearch(searchQuery);
                setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search change
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, statusFilter, debouncedSearch]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let url = `/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`;

            // Append status filter if active
            if (statusFilter !== 'all') {
                url += `&status=${statusFilter}`;
            }

            // Append search query
            if (debouncedSearch) {
                url += `&search=${encodeURIComponent(debouncedSearch)}`;
            }

            const response = await api.get(url);

            // Handle Users Data
            setUsers(response.data.payload.users || []);

            // Handle Pagination Data
            if (response.data.payload.pagination) {
                setPagination(prev => ({
                    ...prev,
                    ...response.data.payload.pagination
                }));
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await api.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter(user => user._id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user.');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setUpdateLoading(true);
        try {
            // Exclude status from the update payload
            const { status, role, ...updatePayload } = editingUser;

            const response = await api.put(`/api/admin/users/${editingUser._id}`, updatePayload);
            setUsers(users.map(u => u._id === editingUser._id ? (response.data.payload || editingUser) : u));
            setShowEditModal(false);
            setEditingUser(null);
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleStatusToggle = async (user) => {
        const statusCycle = {
            'active': 'pending',
            'pending': 'blocked',
            'blocked': 'active'
        };
        const nextStatus = statusCycle[user.status] || 'active'; // Default to active if unknown

        // Add to loading set
        setStatusLoading(prev => new Set(prev).add(user._id));

        // Optimistic update
        const originalUsers = [...users];
        setUsers(users.map(u => u._id === user._id ? { ...u, status: nextStatus } : u));

        try {
            await api.patch(`/api/admin/users/${user._id}/status`, { status: nextStatus });
        } catch (err) {
            console.error('Error updating status:', err);
            if (err.response.data.payload.statusCode == 400) {
                alert(err.response.data.message);
            } else {
                alert('Failed to update status.');
            }
            setUsers(originalUsers); // Revert on failure
        } finally {
            // Remove from loading set
            setStatusLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(user._id);
                return newSet;
            });
        }
    };

    // We now use server-side filtering, so we display users directly
    const displayUsers = users;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Users Management</h2>
                    <p className="text-sm text-slate-500">Manage access • Total: {pagination.total}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Status Filter */}
                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="w-full sm:w-40 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="blocked">Blocked</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-purple-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">S.No</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">WhatsApp</th>
                                    <th className="px-6 py-4">Password</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayUsers.map((user, index) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {(pagination.page - 1) * pagination.limit + index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                                        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                                            {user.name ? user.name[0].toUpperCase() : 'U'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{user.name || 'N/A'}</span>
                                                    {user.role === 'admin' && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 mt-0.5 w-fit">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            Secure
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                            {user.whatsapp || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                            {user.password || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleStatusToggle(user)}
                                                disabled={statusLoading.has(user._id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center gap-1 ${user.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                    user.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                                        'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                                title="Click to change status"
                                            >
                                                {statusLoading.has(user._id) && <Loader className="w-3 h-3 animate-spin" />}
                                                {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {displayUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing page {pagination.page} of {pagination.totalPages}
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingUser.name || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    value={editingUser.whatsapp || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, whatsapp: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Watermark</label>
                                <input
                                    type="text"
                                    value={editingUser.watermark || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, watermark: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    type="text"
                                    value={editingUser.password || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                                <textarea
                                    value={editingUser.remarks || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, remarks: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                                    rows="3"
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-70 flex items-center space-x-2"
                                >
                                    {updateLoading ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersSection;
