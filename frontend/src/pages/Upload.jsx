import { useState } from "react";
import api from "../services/api";

function Upload({ goBack }) {

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadDocument = async () => {

    setMessage("");

    if (!file) {
      setIsError(true);
      setMessage("Please select a PDF file before uploading.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    try {

      const token = localStorage.getItem(
        "token"
      );

      const response = await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      setIsError(false);
      setMessage(
        "Uploaded successfully. Document ID: " +
        response.data.document_id
      );

      console.log(response.data);

    } catch (error) {

      console.log(error);

      setIsError(true);
      setMessage("Upload failed. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 flex items-center justify-center">

      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg border border-slate-200 p-6 sm:p-8">

        <button
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          onClick={goBack}
        >
          Back to Dashboard
        </button>

        <div className="mt-6">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Upload
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Upload PDF
          </h1>
          <p className="text-slate-500 mt-2">
            Select a PDF document from your device and upload it securely.
          </p>
        </div>

        <label className="block mt-8 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-blue-400">
          <span className="block text-base font-semibold text-slate-800">
            {file ? file.name : "Choose a PDF file"}
          </span>
          <span className="block text-sm text-slate-500 mt-1">
            Only .pdf files are accepted
          </span>

        <input
          className="hidden"
          type="file"
          accept=".pdf"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />
        </label>

        {
          message && (
            <p className={`mt-4 rounded-md px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
              {message}
            </p>
          )
        }

        <button
          className="w-full mt-6 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          onClick={uploadDocument}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>

      </div>

    </div>
  );
}

export default Upload;
