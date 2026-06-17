function Dashboard({
  openUpload,
  openDocuments,
  onLogout,
  userName
}) {

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Dashboard
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {userName}
              </h1>
              <p className="text-slate-500 mt-2">
                Upload PDFs, view your documents, and download signed copies from one place.
              </p>
            </div>
            <button
              className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Upload PDF
            </h2>
            <p className="text-slate-500 mt-2 min-h-12">
              Add a PDF document and prepare it for signing.
            </p>
            <button
              className="w-full mt-6 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              onClick={openUpload}
            >
              Upload Document
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              My Documents
            </h2>
            <p className="text-slate-500 mt-2 min-h-12">
              Review uploaded files and download signed PDFs.
            </p>
            <button
              className="w-full mt-6 rounded-md bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              onClick={openDocuments}
            >
              View Documents
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
