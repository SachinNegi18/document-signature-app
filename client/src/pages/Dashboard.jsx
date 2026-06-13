import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [filter, setFilter] = useState('all');
    const { token, user, logout } = useAuth();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/docs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const shareDocument = async (docId) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/docs/${docId}/share`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigator.clipboard.writeText(res.data.shareLink);
            alert('Share link copied to clipboard!\n' + res.data.shareLink);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-600">
                        Welcome, {user?.name}
                    </h1>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <h2 className="text-xl font-semibold">Your Documents</h2>
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'pending', 'signed', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1 rounded text-sm capitalize transition ${
                                        filter === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {documents.filter((doc) => filter === 'all' || doc.status === filter).length === 0 ? (
                        <p className="text-gray-500">No documents found.</p>
                    ) : (
                        <div className="space-y-3">
                            {documents.filter((doc) => filter === 'all' || doc.status === filter).map((doc) => (
                                <div key={doc._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-gray-200 rounded p-4 gap-3">
                                    <div>
                                        <p className="font-medium">{doc.originalName}</p>
                                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold capitalize ${
                                            doc.status === 'signed' ? 'bg-green-100 text-green-700' :
                                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <a href={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            View
                                        </a>
                                        <Link to={`/sign/${doc._id}`} className="text-green-600 hover:underline">
                                            Sign
                                        </Link>
                                        <button onClick={() => shareDocument(doc._id)} className="text-purple-600 hover:underline">
                                            Share
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;