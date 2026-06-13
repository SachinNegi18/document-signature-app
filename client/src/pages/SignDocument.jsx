import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { DndContext, useDraggable } from '@dnd-kit/core';
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Draggable Signature Box
const SignatureBox = ({ position, signatureImage }) => {
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
            className="border-2 border-yellow-500 bg-white rounded"
        >
            {signatureImage ? (
                <img src={signatureImage} alt="Signature" className="w-32 h-16 object-contain" />
            ) : (
                <div className="bg-yellow-200 px-4 py-2 font-semibold text-sm">Sign Here</div>
            )}
        </div>
    );
};

const SignDocument = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const sigCanvasRef = useRef(null);

    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [signatureImage, setSignatureImage] = useState(null);
    const [saved, setSaved] = useState(false);
    const [finalized, setFinalized] = useState(false);
    const [signedFileUrl, setSignedFileUrl] = useState(null);

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

    const clearSignature = () => {
        sigCanvasRef.current.clear();
        setSignatureImage(null);
    };

    const captureSignature = () => {
        if (sigCanvasRef.current.isEmpty()) {
            alert('Please draw your signature first!');
            return;
        }
        const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
        setSignatureImage(dataUrl);
    };

    const saveSignaturePosition = async () => {
        if (!signatureImage) {
            alert('Please draw and capture your signature first!');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/signatures', {
                documentId: id,
                x: position.x,
                y: position.y,
                page: 1,
                signatureImage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);
            setFinalized(false);
        } catch (error) {
            console.log(error);
        }
    };

    const finalizeSignature = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/signatures/finalize', {
                documentId: id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFinalized(true);
            setSignedFileUrl(`http://localhost:5000/${res.data.signedFilePath}`);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-xl font-bold mb-4 text-blue-600">Place Your Signature</h1>

                {/* Signature Drawing Pad */}
                <div className="mb-4 border border-gray-300 rounded p-3">
                    <p className="text-sm font-medium mb-2">Draw your signature below:</p>
                    <SignatureCanvas
                        ref={sigCanvasRef}
                        penColor="black"
                        canvasProps={{ width: 400, height: 150, className: 'border border-gray-300 rounded bg-gray-50' }}
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={captureSignature} className="bg-indigo-600 text-white px-4 py-1 rounded text-sm hover:bg-indigo-700">
                            Use This Signature
                        </button>
                        <button onClick={clearSignature} className="bg-gray-400 text-white px-4 py-1 rounded text-sm hover:bg-gray-500">
                            Clear
                        </button>
                    </div>
                    {signatureImage && (
                        <p className="text-green-600 text-sm mt-2">✓ Signature captured! Now drag the preview onto the PDF below.</p>
                    )}
                </div>

                {saved && !finalized && (
                    <p className="text-green-600 mb-2">Signature position saved! Now click "Finalize" to embed it into the PDF.</p>
                )}

                {finalized && (
                    <div className="mb-2">
                        <p className="text-green-600">Document signed successfully!</p>
                        <a href={signedFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Signed PDF
                        </a>
                    </div>
                )}

                {fileUrl && (
                    <DndContext onDragEnd={handleDragEnd}>
                        <div className="relative border border-gray-300">
                            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                <Page pageNumber={1} width={600} />
                            </Document>
                            <SignatureBox position={position} signatureImage={signatureImage} />
                        </div>
                    </DndContext>
                )}

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={saveSignaturePosition}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Save Signature Position
                    </button>

                    <button
                        onClick={finalizeSignature}
                        disabled={!saved}
                        className={`px-6 py-2 rounded transition ${
                            saved
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Finalize Signature
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignDocument;