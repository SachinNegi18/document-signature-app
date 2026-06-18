import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const { token, user, logout } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/docs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const shareDocument = async (docId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/docs/${docId}/share`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      navigator.clipboard.writeText(res.data.shareLink);
      alert("Share link copied to clipboard!\n" + res.data.shareLink);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/docs/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      fetchDocuments();
    } catch (error) {
      setUploadError(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const filteredDocs = documents.filter(
    (doc) => filter === "all" || doc.status === filter,
  );

  const statusCounts = {
    all: documents.length,
    pending: documents.filter((d) => d.status === "pending").length,
    signed: documents.filter((d) => d.status === "signed").length,
    rejected: documents.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900">SignDoc</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Documents
            </h1>
            <p className="text-sm text-gray-500">
              Manage and track your document signing activity
            </p>
          </div>

          <div>
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-800 transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "+ Upload Document"}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
            {uploadError}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-4">
          {["all", "pending", "signed", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition ${
                filter === status
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {status}{" "}
              <span className="text-xs text-gray-400 ml-1">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        {/* Document list */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {filteredDocs.length === 0 ? (
            <p className="text-sm text-gray-500 p-6">No documents found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Document</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc._id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-gray-900">
                          {doc.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          doc.status === "signed"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-4 justify-end text-sm">
                        <a
                          href={`${import.meta.env.VITE_API_URL}/${doc.filePath.replace(/\\/g, "/")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View Original
                        </a>
                        {doc.signedFilePath && (
                          <a
                            href={`${import.meta.env.VITE_API_URL}/${doc.signedFilePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-700 hover:text-green-800 font-medium"
                          >
                            View Signed
                          </a>
                        )}
                        <Link
                          to={`/sign/${doc._id}`}
                          className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                          Sign
                        </Link>
                        <button
                          onClick={() => shareDocument(doc._id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Share
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
