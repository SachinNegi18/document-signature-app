import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Draggable Signature Box
const SignatureBox = ({ position }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'signature-box',
    });

    const style = {
        position: 'absolute',
        left: position.x + (transform?.x || 0),
        top: position.y + (transform?.y || 0),
        cursor: 'move',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-yellow-200 border-2 border-yellow-500 px-4 py-2 rounded font-semibold text-sm"
        >
            Sign Here
        </div>
    );
};

const SignDocument = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/docs/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const path = res.data.filePath.replace(/\\/g, '/');
                setFileUrl(`http://localhost:5000/${path}`);
            } catch (error) {
                console.log(error);
            }
        };
        fetchDoc();
    }, [id, token]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleDragEnd = (event) => {
        const { delta } = event;
        setPosition((prev) => ({
            x: prev.x + delta.x,
            y: prev.y + delta.y,
        }));
    };

    const saveSignaturePosition = async () => {
        try {
            await axios.post('http://localhost:5000/api/signatures', {
                documentId: id,
                x: position.x,
                y: position.y,
                page: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-xl font-bold mb-4 text-blue-600">Place Your Signature</h1>

                {saved && (
                    <p className="text-green-600 mb-2">Signature position saved!</p>
                )}

                {fileUrl && (
                    <DndContext onDragEnd={handleDragEnd}>
                        <div className="relative border border-gray-300">
                            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                <Page pageNumber={1} width={600} />
                            </Document>
                            <SignatureBox position={position} />
                        </div>
                    </DndContext>
                )}

                <button
                    onClick={saveSignaturePosition}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    Save Signature Position
                </button>
            </div>
        </div>
    );
};

export default SignDocument;