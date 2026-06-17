import { useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import api from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function SignEditor({
  document,
  goBack
}) {

  const pageRef = useRef(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [position, setPosition] = useState({
    x: 150,
    y: 320
  });
  const [pdfPageSize, setPdfPageSize] = useState({
    width: 0,
    height: 0
  });
  const [renderedPageSize, setRenderedPageSize] = useState({
    width: 0,
    height: 0
  });
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [localPdf, setLocalPdf] = useState(null);
  const [loadedPageKey, setLoadedPageKey] = useState("");

  const token = localStorage.getItem("token");
  const encodedFilePath = document.filepath
    ? document.filepath
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/")
    : "";
  const serverPdfUrl = document.filepath
    ? `http://127.0.0.1:8000/${encodedFilePath}`
    : "";

  const pdfFile = useMemo(() => {

    if (localPdf) {
      return localPdf;
    }

    return {
      url: serverPdfUrl
    };

  }, [localPdf, serverPdfUrl]);

  const currentPdfKey = localPdf
    ? localPdf.name
    : serverPdfUrl;
  const currentPageKey = `${currentPdfKey}-${pageNumber}`;
  const pdfLoaded = loadedPageKey === currentPageKey;

  const getPdfCoordinates = (currentPosition) => {

    if (!pdfPageSize.width || !pdfPageSize.height || !renderedPageSize.width || !renderedPageSize.height) {
      return currentPosition;
    }

    return {
      x: Math.round(currentPosition.x * pdfPageSize.width / renderedPageSize.width),
      y: Math.round(currentPosition.y * pdfPageSize.height / renderedPageSize.height)
    };
  };

  const pdfCoordinates = getPdfCoordinates(position);

  const updatePosition = (clientX, clientY) => {

    if (!pageRef.current) {
      return;
    }

    const boxSize = {
      width: 120,
      height: 44
    };
    const pageRect = pageRef.current.getBoundingClientRect();
    const nextX = clientX - pageRect.left - boxSize.width / 2;
    const nextY = clientY - pageRect.top - boxSize.height / 2;
    const maxX = pageRect.width - boxSize.width;
    const maxY = pageRect.height - boxSize.height;

    setRenderedPageSize({
      width: pageRect.width,
      height: pageRect.height
    });

    setPosition({
      x: Math.round(Math.min(Math.max(nextX, 0), maxX)),
      y: Math.round(Math.min(Math.max(nextY, 0), maxY))
    });
  };

  const startDrag = (event) => {
    setDragging(true);
    updatePosition(event.clientX, event.clientY);
  };

  const drag = (event) => {

    if (!dragging) {
      return;
    }

    updatePosition(event.clientX, event.clientY);
  };

  const stopDrag = () => {
    setDragging(false);
  };

  const startTouchDrag = (event) => {
    const touch = event.touches[0];
    setDragging(true);
    updatePosition(touch.clientX, touch.clientY);
  };

  const touchDrag = (event) => {

    if (!dragging) {
      return;
    }

    const touch = event.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  };

  const saveSignaturePosition = async () => {

    setMessage("");
    setSaving(true);

    try {

      const response = await api.post(
        "/signatures",
        {
          document_id: document.id,
          page_number: pageNumber,
          x_coordinate: pdfCoordinates.x,
          y_coordinate: pdfCoordinates.y
        }
      );

      setIsError(false);
      setMessage(response.data.message || "Signature position saved.");

    } catch (error) {

      console.log(error);
      setIsError(true);
      setMessage("Could not save signature position. Please try again.");

    } finally {
      setSaving(false);
    }
  };

  const applySignature = async () => {

    setMessage("");
    setApplying(true);

    try {

      const response = await api.post(
        `/signatures/apply/${document.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsError(false);
      setMessage(response.data.message || "Signed PDF generated.");

    } catch (error) {

      console.log(error);
      setIsError(true);
      setMessage("Could not apply signature. Save a position first, then try again.");

    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
          <button
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            onClick={goBack}
          >
            Back to Documents
          </button>

          <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Signature Editor
              </p>
              <h1 className="text-3xl font-bold text-slate-900 mt-2 break-words">
                {document.filename}
              </h1>
              <p className="text-slate-500 mt-2">
                Drag the SIGN HERE box to the correct place, save the position, then apply the signature.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700">
              <p>
                Page: <span className="font-semibold">{pageNumber}</span>
              </p>
              <p>
                X: <span className="font-semibold">{position.x}</span>,
                Y: <span className="font-semibold"> {position.y}</span>
              </p>
              <p>
                Saved X: <span className="font-semibold">{pdfCoordinates.x}</span>,
                Y: <span className="font-semibold"> {pdfCoordinates.y}</span>
              </p>
            </div>
          </div>

          {
            message && (
              <p className={`mt-4 rounded-md px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                {message}
              </p>
            )
          }
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 overflow-auto">
            <div
              className="relative inline-block bg-white"
              ref={pageRef}
              onMouseMove={drag}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
              onTouchMove={touchDrag}
              onTouchEnd={stopDrag}
            >
              <Document
                file={pdfFile}
                onLoadSuccess={({ numPages }) => {
                  setTotalPages(numPages);
                  setIsError(false);
                  setMessage("");
                }}
                onLoadError={(error) => {
                  console.log(error);
                  setIsError(true);
                  setMessage("PDF preview could not load from the server. Select the same PDF below to preview it locally.");
                }}
                loading={
                  <div className="w-[320px] sm:w-[620px] min-h-[420px] flex items-center justify-center text-slate-500">
                    Loading PDF...
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(window.innerWidth - 48, 760)}
                  onLoadSuccess={(page) => {
                    const viewport = page.getViewport({
                      scale: 1
                    });

                    setPdfPageSize({
                      width: viewport.width,
                      height: viewport.height
                    });

                    if (pageRef.current) {
                      const pageRect = pageRef.current.getBoundingClientRect();

                      setRenderedPageSize({
                        width: pageRect.width,
                        height: pageRect.height
                      });
                    }

                    setLoadedPageKey(currentPageKey);
                  }}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>

              {
                pdfLoaded && (
                  <button
                    className="absolute w-[120px] h-11 rounded-md border-2 border-blue-700 bg-blue-600/90 text-sm font-bold text-white shadow-lg cursor-move"
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`
                    }}
                    onMouseDown={startDrag}
                    onTouchStart={startTouchDrag}
                    type="button"
                  >
                    SIGN HERE
                  </button>
                )
              }
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 h-fit">
            <h2 className="text-xl font-bold text-slate-900">
              Placement
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                Current page: <span className="font-semibold text-slate-900">{pageNumber}</span>
              </p>
              <p className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                Coordinates: <span className="font-semibold text-slate-900">X {position.x}, Y {position.y}</span>
              </p>
              <p className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                Saved to API: <span className="font-semibold text-slate-900">X {pdfCoordinates.x}, Y {pdfCoordinates.y}</span>
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
                onClick={() =>
                  setPageNumber(pageNumber - 1)
                }
                disabled={pageNumber <= 1}
              >
                Previous
              </button>
              <button
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
                onClick={() =>
                  setPageNumber(pageNumber + 1)
                }
                disabled={totalPages ? pageNumber >= totalPages : true}
              >
                Next
              </button>
            </div>

            <label className="block mt-5 text-sm font-medium text-slate-700">
              Local PDF preview fallback
            </label>
            <input
              className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:font-semibold file:text-white"
              type="file"
              accept=".pdf"
              onChange={(event) =>
                setLocalPdf(event.target.files[0])
              }
            />

            <button
              className="w-full mt-6 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
              onClick={saveSignaturePosition}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Signature Position"}
            </button>

            <button
              className="w-full mt-3 rounded-md bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
              onClick={applySignature}
              disabled={applying}
            >
              {applying ? "Applying..." : "Apply Signature"}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SignEditor;
