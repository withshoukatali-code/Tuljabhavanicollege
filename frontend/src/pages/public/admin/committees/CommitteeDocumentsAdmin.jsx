import { useEffect, useState } from "react";
import { Check, ExternalLink, FileText, LoaderCircle, Save, Trash2, Upload } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CommitteeDocumentsAdmin() {
  const [committees, setCommittees] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCommittees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/committees`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load committee documents.");
      }
      setCommittees(Array.isArray(result.data) ? result.data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommittees();
  }, []);

  const getFileUrl = (url) =>
    url?.startsWith("http") ? url : `${API_BASE}${url || ""}`;

  const savePdf = async (committee) => {
    const file = files[committee.committee_slug];
    if (!file) {
      setError(`Choose a PDF for ${committee.committee_title}.`);
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    setSavingSlug(committee.committee_slug);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/api/committees/${committee.committee_slug}`,
        { method: "PUT", body: formData }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save PDF.");
      }
      setFiles((current) => {
        const updated = { ...current };
        delete updated[committee.committee_slug];
        return updated;
      });
      setSuccess(`${committee.committee_title} PDF updated.`);
      await loadCommittees();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingSlug("");
    }
  };

  const removePdf = async (committee) => {
    if (!window.confirm(`Remove the PDF for ${committee.committee_title}?`)) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `${API_BASE}/api/committees/${committee.committee_slug}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to remove PDF.");
      }
      setSuccess(`${committee.committee_title} PDF removed.`);
      await loadCommittees();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-7 border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Content management</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Committee PDFs</h1>
      </header>

      {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading committee records...</p>
      ) : (
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {committees.map((committee) => {
            const slug = committee.committee_slug;
            const busy = savingSlug === slug;
            return (
              <section key={slug} className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,auto)] md:items-center">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900">{committee.committee_title}</h2>
                  {committee.pdf_url ? (
                    <a href={getFileUrl(committee.pdf_url)} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-2 text-sm text-blue-800 hover:underline">
                      <FileText size={16} className="shrink-0" />
                      <span className="truncate">Current PDF</span>
                      <ExternalLink size={14} className="shrink-0" />
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">No PDF uploaded</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex min-w-0 cursor-pointer items-center gap-2 border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Upload size={16} />
                    <span className="max-w-40 truncate">{files[slug]?.name || "Choose PDF"}</span>
                    <input
                      key={`${slug}-${files[slug]?.name || "empty"}`}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(event) => setFiles((current) => ({ ...current, [slug]: event.target.files?.[0] }))}
                    />
                  </label>
                  <button type="button" onClick={() => savePdf(committee)} disabled={busy || !files[slug]} className="inline-flex items-center gap-2 bg-[#0f3262] px-3 py-2 text-sm font-semibold text-white hover:bg-[#19477f] disabled:cursor-not-allowed disabled:opacity-50">
                    {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                    Save PDF
                  </button>
                  {committee.pdf_url && (
                    <button type="button" title="Remove PDF" aria-label={`Remove PDF for ${committee.committee_title}`} onClick={() => removePdf(committee)} className="inline-flex h-10 w-10 items-center justify-center border border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500"><Check size={14} /> PDF files up to 20 MB are accepted.</p>
    </main>
  );
}