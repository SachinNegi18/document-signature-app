import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
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
                    <h2 className="text-xl font-semibold mb-4">Your Documents</h2>

                    {documents.length === 0 ? (
                        <p className="text-gray-500">No documents uploaded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div key={doc._id} className="flex justify-between items-center border border-gray-200 rounded p-4">
                                    <div>
                                        <p className="font-medium">{doc.originalName}</p>
                                        <p className="text-sm text-gray-500">
                                            Status: <span className="capitalize">{doc.status}</span>
                                        </p>
                                    </div>
                                    <a href={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        View
                                    </a>
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