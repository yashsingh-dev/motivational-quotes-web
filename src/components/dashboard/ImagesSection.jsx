import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Upload, Search, X, AlertCircle, Loader, Image as ImageIcon, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

const ImagesSection = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchImages(page);
    }, [page]);

    const fetchImages = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/admin/images?page=${pageNumber}&limit=20`);
            setImages(response.data.payload?.images || response.data?.images || []);
            setTotalPages(response.data.payload?.pagination?.totalPages || 1);
            setError(null);
        } catch (err) {
            console.error('Error fetching images:', err);
            setError('Failed to load images.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            // Scroll to top of section logic could be added here if needed
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await api.delete(`/api/admin/images/${imageId}`);
            setImages(images.filter(img => img._id !== imageId));
        } catch (err) {
            console.error('Error deleting image:', err);
            alert('Failed to delete image.');
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setSelectedFile(file);
        setUploadSuccess(false);
    };

    const handleCancelPreview = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('image', selectedFile);

        setUploading(true);
        try {
            const response = await api.post('/api/admin/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Add new image to list
            const newImage = response.data.payload || response.data;
            setImages([newImage, ...images]);
            setUploadSuccess(true);
            handleCancelPreview();

        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 relative min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 items-end sm:items-center border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                        Image Gallery
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        Curate your visual collection for the mobile experience.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleUploadClick}
                        className="group relative px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center gap-3">
                            <Upload className="w-5 h-5" />
                            <span>Upload New</span>
                        </span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>

            {/* Mobile Preview Modal/Overlay */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row items-center gap-12 border border-white/50 relative">

                        <button
                            onClick={handleCancelPreview}
                            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-600" />
                        </button>

                        {/* Phone Mockup Frame */}
                        <div className="flex-shrink-0 relative group perspective-1000">
                            <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-[12px] border-slate-900 overflow-hidden ring-1 ring-slate-800/50 transform transition-transform duration-500 group-hover:rotate-y-2 group-hover:scale-[1.02]">
                                {/* Status Bar Mock */}
                                <div className="absolute top-0 inset-x-0 h-7 bg-black z-20 flex justify-between px-6 items-center">
                                    <div className="text-[10px] text-white font-medium">9:41</div>
                                    <div className="flex gap-1.5">
                                        <div className="w-4 h-2.5 bg-white rounded-sm" />
                                        <div className="w-4 h-2.5 bg-white rounded-sm" />
                                    </div>
                                </div>
                                {/* Dynamic Island / Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20"></div>

                                {/* Content */}
                                <div className="h-full w-full bg-slate-50 relative">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Mock UI Overlay similar to TikTok/Reels/Stories */}
                                    <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end text-white">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full mb-4 animate-pulse" />
                                        <div className="h-4 w-3/4 bg-white/20 rounded-full mb-2" />
                                        <div className="h-4 w-1/2 bg-white/20 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900">Mobile Preview</h3>
                                <p className="text-slate-500 mt-2 text-lg">
                                    This is how your image will appear on users' devices. Ensure visuals are perfectly centered.
                                </p>
                            </div>

                            <div className="h-px bg-slate-200 w-full" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <Smartphone className="w-6 h-6 text-purple-600" />
                                    <span className="font-medium">optimized for full-screen display</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <ImageIcon className="w-6 h-6 text-blue-600" />
                                    <span className="font-medium">Aspect Ratio: 9:16 (Recommended)</span>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleConfirmUpload}
                                    disabled={uploading || uploadSuccess}
                                    className={`flex-1 overflow-hidden relative px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                                        ${uploadSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-900 hover:bg-slate-800'}
                                    `}
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        {uploading ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                <span>Uploading...</span>
                                            </>
                                        ) : uploadSuccess ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>Uploaded!</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Upload to Server</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </div>
                                    {/* Gradient background effect */}
                                    {!uploadSuccess && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                </button>

                                <button
                                    onClick={handleUploadClick}
                                    disabled={uploading}
                                    className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Change Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Gallery Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-10 text-center bg-red-50 text-red-600 rounded-3xl flex flex-col items-center space-y-3">
                    <AlertCircle className="w-10 h-10" />
                    <p className="font-medium">{error}</p>
                    <button onClick={fetchImages} className="text-sm underline hover:text-red-700">Try Again</button>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images?.map((img) => (
                            <div key={img._id} className="group relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-200 overflow-hidden aspect-[9/16] hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] hover:border-purple-300 transition-all duration-300 hover:-translate-y-1">
                                <img
                                    src={img.s3Url || img.imageUrl || 'https://via.placeholder.com/150'}
                                    alt="Gallery"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <div className="flex items-center gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <button
                                            onClick={() => window.open(img.s3Url || img.imageUrl, '_blank')}
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-purple-600 transition-all"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteImage(img._id)}
                                            className="p-3 bg-red-500/80 backdrop-blur-md rounded-2xl text-white hover:bg-red-600 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {images.length === 0 && (
                            <div className="col-span-full py-20">
                                <div className="max-w-md mx-auto text-center">
                                    <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ImageIcon className="w-10 h-10 text-purple-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Images Yet</h3>
                                    <p className="text-slate-500 mb-8">Start by uploading your first mobile-optimized image.</p>
                                    <button onClick={handleUploadClick} className="text-purple-600 font-semibold hover:text-purple-700">
                                        Click here to upload
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 py-8">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-slate-600 font-medium">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImagesSection;
