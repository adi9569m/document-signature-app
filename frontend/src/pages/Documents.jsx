import { useEffect, useState } from "react";
import api from "../services/api";

function Documents({
  goBack,
  openSignEditor
}) {

  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchDocuments() {

    try {

      const token = localStorage.getItem(
        "token"
      );

      const response = await api.get(
        "/documents/my-documents",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDocuments(response.data);
      setIsError(false);
      setMessage("");

    } catch (error) {

      console.log(error);
      setIsError(true);
      setMessage("Could not load documents. Please try again.");

    } finally {
      setLoading(false);

    }
  }

  useEffect(() => {
    Promise.resolve().then(() =>
      fetchDocuments()
    );
  }, []);

  const downloadPdf = async (
    documentId
  ) => {

    try {

      const token = localStorage.getItem(
        "token"
      );

      const response = await api.get(
        `/signatures/download/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      );

      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `signed_${documentId}.pdf`
      );

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.log(error);

      setIsError(true);
      setMessage("Download failed. Please try again.");

    }
  };

  const deleteDocument = async (
    documentId
  ) => {

    try {

      const token = localStorage.getItem(
        "token"
      );

      const response = await api.delete(
        `/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDocuments(
        documents.filter((doc) =>
          doc.id !== documentId
        )
      );
      setIsError(false);
      setMessage(response.data.message || "Document deleted successfully.");

    } catch (error) {

      console.log(error);
      setIsError(true);
      setMessage("Delete failed. Please try again.");

    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
          <button
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            onClick={goBack}
          >
            Back to Dashboard
          </button>

        {
          message && (
            <p className={`mt-4 rounded-md px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
              {message}
            </p>
          )
        }

          <div className="mt-6">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Documents
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">
              My Documents
            </h1>
            <p className="text-slate-500 mt-2">
              View uploaded PDFs and download signed copies when they are ready.
            </p>
          </div>
        </div>

        {
          loading && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-slate-500">
              Loading documents...
            </div>
          )
        }

        {
          !loading && documents.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                No documents yet
              </h2>
              <p className="text-slate-500 mt-2">
                Upload a PDF from the dashboard to see it here.
              </p>
            </div>
          )
        }

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {
            !loading && documents.map((doc) => (

              <div
                key={doc.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col"
              >

                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Document #{doc.id}
                </p>

                <h2 className="text-lg font-bold text-slate-900 mt-3 break-words">
                  {doc.filename}
                </h2>

                <div className="mt-6 flex flex-col gap-3">

                  <button
                    className="w-full rounded-md bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
                    onClick={() =>
                      openSignEditor(doc)
                    }
                  >
                    Sign Document
                  </button>

                  <button
                    className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                    onClick={() =>
                      downloadPdf(doc.id)
                    }
                  >
                    Download Signed PDF
                  </button>

                  <button
                    className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100"
                    onClick={() =>
                      deleteDocument(doc.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))
          }

        </div>

      </div>

    </div>
  );
}

export default Documents;
