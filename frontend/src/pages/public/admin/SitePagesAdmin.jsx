import { useEffect, useState } from "react";
import { ExternalLink, FileText, LoaderCircle, Save, Upload } from "lucide-react";
import { pageMap } from "../../../features/public/StaticPage";

const API_BASE = import.meta.env.VITE_API_URL || "";
const pageDefaults = Object.entries(pageMap).map(([page_key, content]) => ({ page_key, content }));
const profileFields = [
  ["name", "Coordinator name"],
  ["designation", "Designation"],
  ["qualification", "Qualification"],
  ["department", "Department"],
  ["phone", "Contact number"],
  ["email", "Email"],
  ["experience", "Experience"],
  ["majorResearchSubject", "Major Research Subject"],
  ["research", "Research / Publications"],
];

export default function SitePagesAdmin() {
  const [pages, setPages] = useState([]);
  const [selectedKey, setSelectedKey] = useState("iqac-coordinator");
  const [content, setContent] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [profilePdf, setProfilePdf] = useState(null);
  const [pagePdf, setPagePdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPages = async () => {
    const response = await fetch(`${API_BASE}/api/site-pages`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load site pages.");
    }
    const loadedPages = Array.isArray(result.data) ? result.data : [];
    setPages(loadedPages);
    return loadedPages;
  };

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/site-pages/seed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pages: pageDefaults }),
        });
        if (!response.ok) throw new Error("Unable to initialize page content.");
        await loadPages();
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const record = pages.find((item) => item.page_key === selectedKey);
    const defaultContent = pageMap[selectedKey] || {};
    setContent(record?.content
      ? { ...defaultContent, ...record.content, resources: record.content.resources || defaultContent.resources || [] }
      : defaultContent);
    setPhoto(null);
    setProfilePdf(null);
    setPagePdf(null);
  }, [pages, selectedKey]);

  const update = (field, value) => {
    setContent((current) => ({ ...current, [field]: value }));
  };

  const updateProfile = (field, value) => {
    setContent((current) => ({
      ...current,
      profile: { ...(current.profile || {}), [field]: value },
    }));
  };

  const saveContent = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE}/api/site-pages/${selectedKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to save page.");
      await loadPages();
      setSuccess("Page content saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    const formData = new FormData();
    formData.append("photo", photo);
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE}/api/site-pages/${selectedKey}/photo`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to upload photo.");
      await loadPages();
      setPhoto(null);
      setSuccess("Coordinator photo uploaded.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePdf = async () => {
    if (!profilePdf) return;
    const formData = new FormData();
    formData.append("document", profilePdf);
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE}/api/site-pages/${selectedKey}/profile-pdf`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to upload profile PDF.");
      await loadPages();
      setProfilePdf(null);
      setSuccess("Coordinator profile PDF uploaded.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadPagePdf = async () => {
    if (!pagePdf) return;
    const formData = new FormData();
    formData.append("document", pagePdf);
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE}/api/site-pages/${selectedKey}/document`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to upload PDF.");
      await loadPages();
      setPagePdf(null);
      setSuccess("SSR PDF uploaded.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index, field, value) => {
    const sections = [...(content.sections || [])];
    sections[index] = { ...sections[index], [field]: value };
    update("sections", sections);
  };

  const updateResource = (index, field, value) => {
    const resources = [...(content.resources || [])];
    resources[index] = { ...resources[index], [field]: value };
    update("resources", resources);
  };

  if (loading) {
    return <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">Loading page content...</div>;
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Website content</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Manage Pages</h1>
        </div>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Select page
          <select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)} className="min-w-64 border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800">
            {pages.map((item) => <option key={item.page_key} value={item.page_key}>{item.content.title || item.page_key}</option>)}
          </select>
        </label>
      </header>

      {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}

      {content && (
        <div className="space-y-8">
          <section className="grid gap-4 border-b border-slate-200 pb-7 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">Page title
              <input value={content.title || ""} onChange={(event) => update("title", event.target.value)} className="border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">Subtitle
              <input value={content.subtitle || ""} onChange={(event) => update("subtitle", event.target.value)} className="border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700 md:col-span-2">Introduction
              <textarea rows={3} value={content.description || ""} onChange={(event) => update("description", event.target.value)} className="border border-slate-300 px-3 py-2 font-normal" />
            </label>
            {selectedKey !== "naac-ssr" && (
              <label className="grid gap-1 text-sm font-semibold text-slate-700 md:col-span-2">Highlights, one per line
                <textarea rows={3} value={(content.highlights || []).join("\n")} onChange={(event) => update("highlights", event.target.value.split("\n").filter((item) => item.trim()))} className="border border-slate-300 px-3 py-2 font-normal" />
              </label>
            )}
          </section>

          {selectedKey === "iqac-coordinator" && (
            <section className="space-y-4 border-b border-slate-200 pb-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Coordinator Profile</h2>
                <p className="mt-1 text-sm text-slate-500">These fields appear on the public coordinator page.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {profileFields.map(([field, label]) => (
                  <label key={field} className="grid gap-1 text-sm font-semibold text-slate-700">{label}
                    <input value={content.profile?.[field] || ""} onChange={(event) => updateProfile(field, event.target.value)} className="border border-slate-300 px-3 py-2 font-normal" />
                  </label>
                ))}
              </div>
              {content.profile?.photo && <img src={content.profile.photo.startsWith("http") ? content.profile.photo : `${API_BASE}${content.profile.photo}`} alt="Coordinator profile" className="h-24 w-24 border border-slate-200 object-cover" />}
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  {photo?.name || "Choose coordinator photo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
                </label>
                <button type="button" onClick={uploadPhoto} disabled={!photo || saving} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                  <Upload size={16} /> Upload photo
                </button>
              </div>
              <p className="text-xs text-slate-500">JPG, PNG, or WebP, up to 5 MB.</p>
              {content.profile?.pdf && (
                <a
                  href={content.profile.pdf.startsWith("http") ? content.profile.pdf : `${API_BASE}${content.profile.pdf}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
                >
                  <FileText size={16} /> Current coordinator profile PDF <ExternalLink size={14} />
                </a>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  {profilePdf?.name || "Choose profile PDF"}
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => setProfilePdf(event.target.files?.[0] || null)} />
                </label>
                <button type="button" onClick={uploadProfilePdf} disabled={!profilePdf || saving} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                  <Upload size={16} /> Upload profile PDF
                </button>
              </div>
              <p className="text-xs text-slate-500">PDF only, up to 20 MB.</p>
            </section>
          )}

          {selectedKey === "naac-ssr" && (
            <section className="space-y-4 border-b border-slate-200 pb-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">SSR PDF</h2>
                <p className="mt-1 text-sm text-slate-500">The public SSR page contains the report link and View AQAR navigation.</p>
              </div>
              {content.pdfUrl && (
                <a href={content.pdfUrl.startsWith("http") ? content.pdfUrl : `${API_BASE}${content.pdfUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline">
                  <FileText size={16} /> Current SSR PDF <ExternalLink size={14} />
                </a>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  {pagePdf?.name || "Choose SSR PDF"}
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => setPagePdf(event.target.files?.[0] || null)} />
                </label>
                <button type="button" onClick={uploadPagePdf} disabled={!pagePdf || saving} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                  <Upload size={16} /> Upload SSR PDF
                </button>
              </div>
              <p className="text-xs text-slate-500">PDF only, up to 20 MB.</p>
            </section>
          )}

          {selectedKey === "e-contents" && (
            <section className="space-y-4 border-b border-slate-200 pb-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Online class resources</h2>
                  <p className="mt-1 text-sm text-slate-500">Add faculty rows with their class and learning-material links.</p>
                </div>
                <button type="button" onClick={() => update("resources", [...(content.resources || []), { facultyName: "", subject: "", classUrl: "", resourceUrl: "" }])} className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Add faculty resource</button>
              </div>
              {(content.resources || []).map((resource, index) => (
                <div key={resource.id || index} className="grid gap-3 border-l-2 border-slate-300 pl-4 md:grid-cols-2">
                  {[["facultyName", "Faculty name"], ["subject", "Subject"], ["classUrl", "Online class URL"], ["resourceUrl", "Digital material URL"]].map(([field, label]) => (
                    <label key={field} className="grid gap-1 text-sm font-semibold text-slate-700">{label}
                      <input value={resource[field] || ""} onChange={(event) => updateResource(index, field, event.target.value)} className="border border-slate-300 px-3 py-2 font-normal" />
                    </label>
                  ))}
                  <button type="button" onClick={() => update("resources", content.resources.filter((_, rowIndex) => rowIndex !== index))} className="justify-self-start px-2 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Remove resource</button>
                </div>
              ))}
            </section>
          )}

          {selectedKey !== "naac-ssr" && (
          <section className="space-y-4 border-b border-slate-200 pb-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Page sections</h2>
              <button type="button" onClick={() => update("sections", [...(content.sections || []), { heading: "New section", text: "" }])} className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Add section</button>
            </div>
            {(content.sections || []).map((section, index) => (
              <div key={`${selectedKey}-${index}`} className="grid gap-3 border-l-2 border-slate-300 pl-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">Section heading
                    <input value={section.heading || ""} onChange={(event) => updateSection(index, "heading", event.target.value)} className="border border-slate-300 px-3 py-2 font-normal" />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 md:col-span-2">Section text
                    <textarea rows={3} value={section.text || ""} onChange={(event) => updateSection(index, "text", event.target.value)} className="border border-slate-300 px-3 py-2 font-normal" />
                  </label>
                </div>
                <button type="button" onClick={() => update("sections", content.sections.filter((_, sectionIndex) => sectionIndex !== index))} className="self-start px-2 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button>
              </div>
            ))}
          </section>
          )}

          <section className="grid gap-4 border-b border-slate-200 pb-7 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">Call-to-action label
              <input value={content.cta?.label || ""} onChange={(event) => update("cta", { ...(content.cta || {}), label: event.target.value })} className="border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">Call-to-action URL
              <input value={content.cta?.to || ""} onChange={(event) => update("cta", { ...(content.cta || {}), to: event.target.value })} className="border border-slate-300 px-3 py-2 font-normal" />
            </label>
          </section>

          <div className="flex justify-end">
            <button type="button" onClick={saveContent} disabled={saving} className="inline-flex items-center gap-2 bg-[#0f3262] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19477f] disabled:opacity-60">
              {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
              Save page
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
