import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PublicSign = () => {
    const { token } = useParams();
    const [document, setDocument] = useState(null);
    const [error, setError] = useState('');
    const [responded, setResponded] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/docs/public/${token}`);
                setDocument(res.data);
            } catch (err) {
                setError('This link is invalid or has expired.');
            }
        };
        fetchDocument();
    }, [token]);

    const respond = async (action) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/docs/public/${token}/respond`, {
                action,
                reason: action === 'reject' ? rejectReason : undefined
            });
            setResponded(true);
            setResponseMessage(res.data.message);
            setDocument(res.data.document);
        } catch (err) {
            setError('Could not process your response. The link may have expired.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-sm text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading document...</p>
            </div>
        );
    }

    const fileUrl = document.signedFilePath
        ? `${import.meta.env.VITE_API_URL}/${document.signedFilePath}`
        : `${import.meta.env.VITE_API_URL}/${document.filePath.replace(/\\/g, '/')}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <span className="text-lg font-semibold text-gray-900">SignDoc</span>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h1 className="text-lg font-semibold text-gray-900 mb-1">{document.originalName}</h1>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize mb-4 ${
                        document.status === 'signed' ? 'bg-green-100 text-green-700' :
                        document.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                        {document.status}
                    </span>

                    {responded && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded px-3 py-2 mb-4">
                            {responseMessage}
                        </div>
                    )}

                    <div className="border border-gray-300 rounded mb-4 overflow-hidden">
                        <Document file={fileUrl}>
                            <Page pageNumber={1} width={600} />
                        </Document>
                    </div>

                    {!responded && document.status === 'pending' && (
                        <>
                            {!showRejectForm ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => respond('accept')}
                                        className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 transition"
                                    >
                                        Accept Document
                                    </button>
                                    <button
                                        onClick={() => setShowRejectForm(true)}
                                        className="bg-red-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-red-700 transition"
                                    >
                                        Reject Document
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Reason for rejection..."
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
                                        rows={3}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => respond('reject')}
                                            className="bg-red-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-red-700 transition"
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button
                                            onClick={() => setShowRejectForm(false)}
                                            className="border border-gray-300 text-gray-700 px-5 py-2 rounded text-sm hover:bg-gray-100 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicSign;