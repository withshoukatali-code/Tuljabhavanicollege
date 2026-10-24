import { useCallback, useEffect, useState } from "react";
import {
  Save, RefreshCw, Image as ImageIcon, FileText, Plus, Trash2, Pencil,
  Users, PanelLeft, BookOpen, Settings2, Upload, X, Eye, EyeOff, Trophy, CalendarDays, PlayCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const ROOT = `${API_BASE}/api/student-initiatives`;
const TABS = [
  { id: "settings", label: "Page Settings", icon: Settings2 },
  { id: "sections", label: "Content Sections", icon: BookOpen },
  { id: "sidebar", label: "Sidebar Links", icon: PanelLeft },
  { id: "leadership", label: "Unit Leadership", icon: Users },
  { id: "reports", label: "Activity & Reports", icon: FileText },
  { id: "achievements", label: "Cadet Achievements", icon: Trophy },
  { id: "media", label: "Photo & Video Gallery", icon: PlayCircle },
];
const EMPTY_SECTION = { section_key: "", title: "", content: "", display_order: 0, is_active: 1 };
const EMPTY_LINK = { title: "", url: "", display_order: 0, is_active: 1 };
const EMPTY_HEAD = { name: "", designation: "", qualification: "", experience: "", achievements: "", photo_url: "", profile_pdf_url: "", display_order: 0, is_active: 1 };
const EMPTY_REPORT = { title: "", category: "Activity Report", academic_year: "", file_url: "", display_order: 0, is_active: 1 };
const EMPTY_ACHIEVEMENT = { title: "", cadet_name: "", achievement_date: "", award: "", description: "", photo_url: "", document_url: "", display_order: 0, is_active: 1 };
const EMPTY_MEDIA = { media_type: "photo", title: "", caption: "", description: "", media_url: "", display_order: 0, is_active: 1 };

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { message: text }; }
  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${response.status})`);
  }
  return json;
}
function cls(input = "") {
  return `w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${input}`;
}
function mediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE}/${String(value).replace(/^\/+/, "")}`;
}
function Field({ label, value, onChange, placeholder = "", type = "text", required = false }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input className={cls()} type={type} value={value ?? ""} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}
function TextArea({ label, value, onChange, rows = 4, placeholder = "" }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><textarea className={cls()} rows={rows} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}
function Toggle({ checked, onChange, label = "Published" }) {
  return <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={Number(checked) === 1} onChange={(e) => onChange(e.target.checked ? 1 : 0)} className="h-4 w-4 rounded border-slate-300" />{label}</label>;
}
function Card({ title, children, icon: Icon = BookOpen, action }) {
  return <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><h2 className="flex items-center gap-2 font-bold text-slate-900"><Icon size={18} className="text-blue-700" />{title}</h2>{action}</div><div className="p-5">{children}</div></section>;
}

export default function NCCAdmin() {
  const [tab, setTab] = useState("settings");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [initiative, setInitiative] = useState({ title: "National Cadet Corps (NCC)", slug: "ncc", subtitle: "", description: "", is_active: 1, display_order: 0 });
  const [sections, setSections] = useState([]);
  const [sidebar, setSidebar] = useState([]);
  const [heads, setHeads] = useState([]);
  const [reports, setReports] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaForm, setMediaForm] = useState({ ...EMPTY_MEDIA });
  const [mediaFile, setMediaFile] = useState(null);
  const [achievementForm, setAchievementForm] = useState({ ...EMPTY_ACHIEVEMENT });
  const [achievementPhoto, setAchievementPhoto] = useState(null);
  const [achievementPdf, setAchievementPdf] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [sectionForm, setSectionForm] = useState({ ...EMPTY_SECTION });
  const [linkForm, setLinkForm] = useState({ ...EMPTY_LINK });
  const [headForm, setHeadForm] = useState({ ...EMPTY_HEAD });
  const [reportForm, setReportForm] = useState({ ...EMPTY_REPORT });
  const [editing, setEditing] = useState({ type: "", id: null });
  const [photoFile, setPhotoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [reportFile, setReportFile] = useState(null);

  const notify = (type, text) => setNotice({ type, text });

  const loadAll = useCallback(async () => {
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const [page, reportData, achievementData, mediaData] = await Promise.all([
        request(`${ROOT}/ncc`),
        request(`${ROOT}/ncc/reports`).catch(() => ({ reports: [] })),
        request(`${ROOT}/ncc/achievements`).catch(() => ({ achievements: [] })),
        request(`${ROOT}/ncc/media`).catch(() => ({ media: [] })),
      ]);
      if (page.initiative) setInitiative((old) => ({ ...old, ...page.initiative }));
      setHeads(Array.isArray(page.heads) ? page.heads : []);
      setSections(Array.isArray(page.sections) ? page.sections : []);
      setSidebar(Array.isArray(page.sidebar) ? page.sidebar : []);
      setReports(Array.isArray(reportData.reports) ? reportData.reports : []);
      setAchievements(Array.isArray(achievementData.achievements) ? achievementData.achievements : []);
      setMediaItems(Array.isArray(mediaData.media) ? mediaData.media : []);
    } catch (e) {
      notify("error", `${e.message}. Check that the NCC admin API routes are registered.`);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function saveSettings(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = { ...initiative };
      if (heroFile) next.hero_image = await uploadFile(heroFile, "gallery-photo");
      await request(`${ROOT}/admin/ncc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setInitiative(next); setHeroFile(null);
      notify("success", "NCC page settings saved.");
    } catch (e) { notify("error", e.message); }
    finally { setBusy(false); }
  }

  async function saveRecord(type, form) {
    const route = type === "sections" ? "sections" : type === "sidebar" ? "sidebar" : "heads";
    const isEdit = editing.type === type && editing.id != null;
    const base = `${ROOT}/admin/ncc/${route}`;
    const url = isEdit ? `${base}/${editing.id}` : base;
    setBusy(true);
    try {
      await request(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "heads" ? { ...form, initiative_id: initiative.id } : form),
      });
      notify("success", `${type === "sections" ? "Section" : type === "sidebar" ? "Sidebar link" : "Leadership profile"} saved.`);
      resetForm(type);
      await loadAll();
    } catch (e) { notify("error", e.message); }
    finally { setBusy(false); }
  }

  function resetForm(type) {
    setEditing({ type: "", id: null });
    if (type === "sections") setSectionForm({ ...EMPTY_SECTION });
    if (type === "sidebar") setLinkForm({ ...EMPTY_LINK });
    if (type === "heads") { setHeadForm({ ...EMPTY_HEAD }); setPhotoFile(null); setPdfFile(null); }
    if (type === "reports") { setReportForm({ ...EMPTY_REPORT }); setReportFile(null); }
    if (type === "achievements") { setAchievementForm({ ...EMPTY_ACHIEVEMENT }); setAchievementPhoto(null); setAchievementPdf(null); }
    if (type === "media") { setMediaForm({ ...EMPTY_MEDIA }); setMediaFile(null); }
  }

  function startEdit(type, item) {
    setEditing({ type, id: item.id });
    if (type === "sections") setSectionForm({ ...EMPTY_SECTION, ...item });
    if (type === "sidebar") setLinkForm({ ...EMPTY_LINK, ...item });
    if (type === "heads") setHeadForm({ ...EMPTY_HEAD, ...item });
    if (type === "reports") setReportForm({ ...EMPTY_REPORT, ...item });
    if (type === "achievements") setAchievementForm({ ...EMPTY_ACHIEVEMENT, ...item });
    if (type === "media") setMediaForm({ ...EMPTY_MEDIA, ...item });
    setTab(type === "heads" ? "leadership" : type === "sections" ? "sections" : type);
  }

  async function removeRecord(type, id) {
    if (!window.confirm("Delete this item? This action cannot be undone.")) return;
    const route = type === "sections" ? "sections" : type === "sidebar" ? "sidebar" : type === "heads" ? "heads" : type === "achievements" ? "achievements" : type === "media" ? "media" : "reports";
    const url = type === "reports" ? `${ROOT}/ncc/reports/${id}` : `${ROOT}/admin/ncc/${route}/${id}`;
    setBusy(true);
    try {
      await request(url, { method: "DELETE" });
      notify("success", "Item deleted.");
      await loadAll();
    } catch (e) { notify("error", e.message); }
    finally { setBusy(false); }
  }

  // Expected upload API contract: POST /api/student-initiatives/admin/ncc/upload?type=profile-photo|profile-pdf|report
  // FormData field name: "file"; response should contain { success: true, url: "uploads/..." }.
  async function uploadFile(file, type) {
    if (!file) return "";
    const body = new FormData();
    body.append("file", file);
    const response = await request(`${ROOT}/admin/ncc/upload?type=${encodeURIComponent(type)}`, { method: "POST", body });
    return response.url || response.file_url || "";
  }

  async function saveLeadership(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = { ...headForm };
      if (photoFile) next.photo_url = await uploadFile(photoFile, "profile-photo");
      if (pdfFile) next.profile_pdf_url = await uploadFile(pdfFile, "profile-pdf");
      const isEdit = editing.type === "heads" && editing.id != null;
      const url = isEdit ? `${ROOT}/admin/ncc/heads/${editing.id}` : `${ROOT}/admin/ncc/heads`;
      await request(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...next, initiative_id: initiative.id }),
      });
      notify("success", "Unit leadership profile saved.");
      resetForm("heads");
      await loadAll();
    } catch (e) { notify("error", e.message); }
    finally { setBusy(false); }
  }

  async function saveReport(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = { ...reportForm };
      if (reportFile) next.file_url = await uploadFile(reportFile, "report");
      const isEdit = editing.type === "reports" && editing.id != null;
      const url = isEdit ? `${ROOT}/ncc/reports/${editing.id}` : `${ROOT}/ncc/reports`;
      await request(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...next, initiative_id: initiative.id }),
      });
      notify("success", "Report saved.");
      resetForm("reports");
      await loadAll();
    } catch (e) { notify("error", e.message); }
    finally { setBusy(false); }
  }

  async function saveAchievement(e) {
    e.preventDefault(); setBusy(true);
    try {
      const next = { ...achievementForm };
      if (achievementPhoto) next.photo_url = await uploadFile(achievementPhoto, "achievement-photo");
      if (achievementPdf) next.document_url = await uploadFile(achievementPdf, "achievement-pdf");
      const isEdit = editing.type === "achievements" && editing.id != null;
      await request(isEdit ? `${ROOT}/admin/ncc/achievements/${editing.id}` : `${ROOT}/admin/ncc/achievements`, {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next),
      });
      notify("success", "Cadet achievement saved."); resetForm("achievements"); await loadAll();
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  async function saveMedia(e) {
    e.preventDefault(); setBusy(true);
    try {
      const next = { ...mediaForm };
      if (next.media_type === "photo" && mediaFile) next.media_url = await uploadFile(mediaFile, "gallery-photo");
      const isEdit = editing.type === "media" && editing.id != null;
      await request(isEdit ? `${ROOT}/admin/ncc/media/${editing.id}` : `${ROOT}/admin/ncc/media`, {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next),
      });
      notify("success", "Gallery item saved."); resetForm("media"); await loadAll();
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  const currentTab = TABS.find((item) => item.id === tab);
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Students Initiatives / NCC</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Manage NCC Page</h1>
            <p className="mt-2 text-slate-600">Manage the hero banner, page sections, unit leadership, reports, and cadet achievements.</p>
          </div>
          <button onClick={loadAll} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"><RefreshCw size={16} /> Refresh</button>
        </div>

        {notice.text && <div className={`mb-5 rounded-lg border p-4 text-sm ${notice.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.text}</div>}

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">NCC Management</p>
            {TABS.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => setTab(item.id)} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold ${tab === item.id ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={17} />{item.label}</button>;
            })}
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">Changes are saved to the NCC API. Only published items appear on the public page.</div>
          </aside>

          <div className="min-w-0 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">{currentTab?.label}</h2>
              <p className="mt-1 text-sm text-slate-500">NCC page content is separate from the college header settings.</p>
            </div>

            {tab === "settings" && <Card title="Page Settings" icon={Settings2}><form onSubmit={saveSettings} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Page Title" value={initiative.title} required onChange={(v) => setInitiative({ ...initiative, title: v })} />
                <Field label="Slug" value={initiative.slug || "ncc"} onChange={() => {}} />
              </div>
              <Field label="Subtitle" value={initiative.subtitle} onChange={(v) => setInitiative({ ...initiative, subtitle: v })} placeholder="Unity and Discipline" />
              <div className="grid gap-4 md:grid-cols-2"><Field label="Unit started" value={initiative.ncc_unit_started ?? "1976"} onChange={(v) => setInitiative({ ...initiative, ncc_unit_started: v })} placeholder="1976" /><Field label="Published enrolment" value={initiative.ncc_enrolment ?? "53 cadets"} onChange={(v) => setInitiative({ ...initiative, ncc_enrolment: v })} placeholder="53 cadets" /></div>
              <div className="rounded-xl border border-slate-200 p-4"><h3 className="font-bold text-slate-800">NCC Hero Image</h3>{initiative.hero_image && <img src={mediaUrl(initiative.hero_image)} alt="NCC hero preview" className="mt-3 h-40 w-full rounded-lg object-cover" />}<label className="mt-3 block text-sm font-semibold text-slate-600">Choose hero image (JPG, PNG, WebP)<input className="mt-2 block w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} /></label>{heroFile && <p className="mt-2 text-xs text-emerald-700">Selected: {heroFile.name}</p>}<p className="mt-2 break-all text-xs text-slate-500">{initiative.hero_image || "No hero image uploaded"}</p></div>
              <TextArea label="Overview / Introduction" value={initiative.description} onChange={(v) => setInitiative({ ...initiative, description: v })} rows={6} />
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4"><Toggle checked={initiative.is_active} onChange={(v) => setInitiative({ ...initiative, is_active: v })} label="Publish NCC page" /><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white hover:bg-blue-800 disabled:opacity-50"><Save size={17} /> Save Settings</button></div>
            </form></Card>}

            {tab === "sections" && <div className="space-y-5">
              <Card title={editing.type === "sections" ? "Edit Content Section" : "Add Content Section"} icon={BookOpen}>
                <form onSubmit={(e) => { e.preventDefault(); saveRecord("sections", sectionForm); }} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Section key (e.g. history)" value={sectionForm.section_key} required onChange={(v) => setSectionForm({ ...sectionForm, section_key: v })} /><Field label="Section title" value={sectionForm.title} required onChange={(v) => setSectionForm({ ...sectionForm, title: v })} /></div>
                  <TextArea label="Section content" value={sectionForm.content} onChange={(v) => setSectionForm({ ...sectionForm, content: v })} />
                  <div className="grid items-end gap-4 md:grid-cols-3"><Field label="Display order" type="number" value={sectionForm.display_order} onChange={(v) => setSectionForm({ ...sectionForm, display_order: Number(v) })} /><Toggle checked={sectionForm.is_active} onChange={(v) => setSectionForm({ ...sectionForm, is_active: v })} /><div className="flex gap-2"><button disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"><Save size={16} /> Save</button>{editing.type === "sections" && <button type="button" onClick={() => resetForm("sections")} className="rounded-lg border px-3"><X size={16} /></button>}</div></div>
                </form>
              </Card>
              <Card title={`Existing Sections (${sections.length})`}><RecordList items={sections} titleKey="title" subtitleKey="section_key" onEdit={(item) => startEdit("sections", item)} onDelete={(item) => removeRecord("sections", item.id)} /></Card>
            </div>}

            {tab === "sidebar" && <div className="space-y-5">
              <Card title={editing.type === "sidebar" ? "Edit Sidebar Link" : "Add Sidebar Link"} icon={PanelLeft}>
                <form onSubmit={(e) => { e.preventDefault(); saveRecord("sidebar", linkForm); }} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Link title" value={linkForm.title} required onChange={(v) => setLinkForm({ ...linkForm, title: v })} /><Field label="URL or uploaded PDF path" value={linkForm.url || linkForm.file_url} required onChange={(v) => setLinkForm({ ...linkForm, url: v, file_url: v })} placeholder="/uploads/student-initiatives/example.pdf" /></div>
                  <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex gap-5"><Field label="Display order" type="number" value={linkForm.display_order} onChange={(v) => setLinkForm({ ...linkForm, display_order: Number(v) })} /><Toggle checked={linkForm.is_active} onChange={(v) => setLinkForm({ ...linkForm, is_active: v })} /></div><div className="flex gap-2"><button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"><Save size={16} className="mr-1 inline" />Save Link</button>{editing.type === "sidebar" && <button type="button" onClick={() => resetForm("sidebar")} className="rounded-lg border px-3"><X size={16} /></button>}</div></div>
                </form>
              </Card>
              <Card title={`Existing Sidebar Links (${sidebar.length})`}><RecordList items={sidebar} titleKey="title" subtitleKey="url" onEdit={(item) => startEdit("sidebar", item)} onDelete={(item) => removeRecord("sidebar", item.id)} /></Card>
            </div>}

            {tab === "leadership" && <div className="space-y-5">
              <Card title={editing.type === "heads" ? "Edit Unit Leadership" : "Unit Leadership Profile"} icon={Users}>
                <form onSubmit={saveLeadership} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Name" value={headForm.name} required onChange={(v) => setHeadForm({ ...headForm, name: v })} /><Field label="Designation" value={headForm.designation} onChange={(v) => setHeadForm({ ...headForm, designation: v })} placeholder="Head of NCC / ANO" /><Field label="Qualification" value={headForm.qualification} onChange={(v) => setHeadForm({ ...headForm, qualification: v })} /><Field label="Experience" value={headForm.experience} onChange={(v) => setHeadForm({ ...headForm, experience: v })} /></div>
                  <TextArea label="Achievements / Profile" value={headForm.achievements} onChange={(v) => setHeadForm({ ...headForm, achievements: v })} rows={3} />
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h3 className="flex items-center gap-2 font-bold text-slate-800"><ImageIcon size={18} /> NCC Profile Photo</h3>
                      {headForm.photo_url && <img src={mediaUrl(headForm.photo_url)} alt="Leadership preview" className="mt-3 h-44 w-full rounded-lg border bg-slate-50 object-contain" />}
                      <label className="mt-3 block text-sm font-semibold text-slate-600">Choose image (JPG, PNG, WebP)<input className="mt-2 block w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} /></label>
                      {photoFile && <p className="mt-2 text-xs text-emerald-700">Selected: {photoFile.name}</p>}
                      <p className="mt-2 break-all text-xs text-slate-500">{headForm.photo_url || "No photo uploaded yet"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h3 className="flex items-center gap-2 font-bold text-slate-800"><FileText size={18} /> NCC Profile PDF</h3>
                      <p className="mt-3 text-sm text-slate-500">The public page shows a â€œView Full Profileâ€ CTA when this PDF is saved.</p>
                      {headForm.profile_pdf_url && <a href={mediaUrl(headForm.profile_pdf_url)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700"><Eye size={16} /> Preview current PDF</a>}
                      <label className="mt-3 block text-sm font-semibold text-slate-600">Choose PDF<input className="mt-2 block w-full text-sm" type="file" accept="application/pdf,.pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} /></label>
                      {pdfFile && <p className="mt-2 text-xs text-emerald-700">Selected: {pdfFile.name}</p>}
                      <p className="mt-2 break-all text-xs text-slate-500">{headForm.profile_pdf_url || "No profile PDF uploaded yet"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4"><Toggle checked={headForm.is_active} onChange={(v) => setHeadForm({ ...headForm, is_active: v })} label="Show on public page" /><div className="flex gap-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white disabled:opacity-50"><Upload size={16} /> Save Leadership</button>{editing.type === "heads" && <button type="button" onClick={() => resetForm("heads")} className="rounded-lg border px-3"><X size={16} /></button>}</div></div>
                </form>
              </Card>
              <Card title={`Leadership Records (${heads.length})`}><RecordList items={heads} titleKey="name" subtitleKey="designation" onEdit={(item) => startEdit("heads", item)} onDelete={(item) => removeRecord("heads", item.id)} /></Card>
            </div>}

            {tab === "reports" && <div className="space-y-5">
              <Card title={editing.type === "reports" ? "Edit Report" : "Add Activity / Audit Report"} icon={FileText}>
                <form onSubmit={saveReport} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Report title" value={reportForm.title} required onChange={(v) => setReportForm({ ...reportForm, title: v })} /><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Category</span><select className={cls()} value={reportForm.category} onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}>{["Activity Report", "Annual Report", "Audit Report", "Camp Report", "Event Report", "Other"].map((v) => <option key={v}>{v}</option>)}</select></label><Field label="Academic year" value={reportForm.academic_year} onChange={(v) => setReportForm({ ...reportForm, academic_year: v })} placeholder="2025-26" /><Field label="Display order" type="number" value={reportForm.display_order} onChange={(v) => setReportForm({ ...reportForm, display_order: Number(v) })} /></div>
                  <div className="rounded-lg border border-slate-200 p-4"><label className="block text-sm font-semibold text-slate-700">Upload PDF<input className="mt-2 block w-full text-sm" type="file" accept="application/pdf,.pdf" onChange={(e) => setReportFile(e.target.files?.[0] || null)} /></label>{reportFile && <p className="mt-2 text-xs text-emerald-700">Selected: {reportFile.name}</p>}{reportForm.file_url && <p className="mt-2 break-all text-xs text-slate-500">Current file: {reportForm.file_url}</p>}</div>
                  <div className="flex flex-wrap items-center justify-between gap-4"><Toggle checked={reportForm.is_active} onChange={(v) => setReportForm({ ...reportForm, is_active: v })} /><div className="flex gap-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white disabled:opacity-50"><Save size={16} /> Save Report</button>{editing.type === "reports" && <button type="button" onClick={() => resetForm("reports")} className="rounded-lg border px-3"><X size={16} /></button>}</div></div>
                </form>
              </Card>
              <Card title={`Published / Saved Reports (${reports.length})`}><RecordList items={reports} titleKey="title" subtitleKey="academic_year" onEdit={(item) => startEdit("reports", item)} onDelete={(item) => removeRecord("reports", item.id)} /></Card>
            </div>}

            {tab === "media" && <div className="space-y-5">
              <Card title={editing.type === "media" ? "Edit Gallery Item" : "Add Photo / Video"} icon={PlayCircle}>
                <form onSubmit={saveMedia} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Media type</span><select className={cls()} value={mediaForm.media_type} onChange={(e) => setMediaForm({ ...mediaForm, media_type: e.target.value })}><option value="photo">Photo</option><option value="video">Video link</option></select></label><Field label="Title" value={mediaForm.title} required onChange={(v) => setMediaForm({ ...mediaForm, title: v })} /><Field label="Caption" value={mediaForm.caption} onChange={(v) => setMediaForm({ ...mediaForm, caption: v })} /><Field label="Display order" type="number" value={mediaForm.display_order} onChange={(v) => setMediaForm({ ...mediaForm, display_order: Number(v) })} /></div>
                  <TextArea label="Description" value={mediaForm.description} onChange={(v) => setMediaForm({ ...mediaForm, description: v })} rows={3} />
                  {mediaForm.media_type === "photo" ? <div className="rounded-xl border p-4"><label className="block text-sm font-semibold">Upload photo (JPG, PNG, WebP)<input className="mt-2 block w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} /></label>{mediaForm.media_url && <img src={mediaUrl(mediaForm.media_url)} alt={mediaForm.title} className="mt-3 h-40 w-full rounded-lg object-cover" />}{mediaFile && <p className="mt-2 text-xs text-emerald-700">Selected: {mediaFile.name}</p>}</div> : <Field label="Video URL (YouTube/Vimeo/MP4 link)" value={mediaForm.media_url} required onChange={(v) => setMediaForm({ ...mediaForm, media_url: v })} placeholder="https://www.youtube.com/watch?v=..." />}
                  <div className="flex flex-wrap items-center justify-between gap-4"><Toggle checked={mediaForm.is_active} onChange={(v) => setMediaForm({ ...mediaForm, is_active: v })} /><div className="flex gap-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white"><Save size={16}/> Save Gallery Item</button>{editing.type === "media" && <button type="button" onClick={() => resetForm("media")} className="rounded-lg border px-3"><X size={16}/></button>}</div></div>
                </form>
              </Card>
              <Card title={`Gallery Items (${mediaItems.length})`}><RecordList items={mediaItems} titleKey="title" subtitleKey="media_type" onEdit={(item) => startEdit("media", item)} onDelete={(item) => removeRecord("media", item.id)} /></Card>
            </div>}

            {tab === "achievements" && <div className="space-y-5">
              <Card title={editing.type === "achievements" ? "Edit Cadet Achievement" : "Add Cadet Achievement"} icon={Trophy}>
                <form onSubmit={saveAchievement} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Achievement title" value={achievementForm.title} required onChange={(v) => setAchievementForm({ ...achievementForm, title: v })} /><Field label="Cadet name" value={achievementForm.cadet_name} onChange={(v) => setAchievementForm({ ...achievementForm, cadet_name: v })} /><Field label="Award / rank / competition" value={achievementForm.award} onChange={(v) => setAchievementForm({ ...achievementForm, award: v })} /><Field label="Achievement date" type="date" value={achievementForm.achievement_date} onChange={(v) => setAchievementForm({ ...achievementForm, achievement_date: v })} /><Field label="Display order" type="number" value={achievementForm.display_order} onChange={(v) => setAchievementForm({ ...achievementForm, display_order: Number(v) })} /></div>
                  <TextArea label="Description" value={achievementForm.description} onChange={(v) => setAchievementForm({ ...achievementForm, description: v })} rows={4} />
                  <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border p-4"><label className="block text-sm font-semibold">Achievement photo<input className="mt-2 block w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAchievementPhoto(e.target.files?.[0] || null)} /></label>{achievementForm.photo_url && <img src={mediaUrl(achievementForm.photo_url)} alt="Achievement" className="mt-3 h-32 w-full rounded-lg object-cover" />}{achievementPhoto && <p className="mt-2 text-xs text-emerald-700">Selected: {achievementPhoto.name}</p>}</div><div className="rounded-xl border p-4"><label className="block text-sm font-semibold">Certificate / supporting PDF<input className="mt-2 block w-full text-sm" type="file" accept="application/pdf,.pdf" onChange={(e) => setAchievementPdf(e.target.files?.[0] || null)} /></label>{achievementForm.document_url && <a href={mediaUrl(achievementForm.document_url)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-bold text-blue-700">Preview current PDF</a>}{achievementPdf && <p className="mt-2 text-xs text-emerald-700">Selected: {achievementPdf.name}</p>}</div></div>
                  <div className="flex flex-wrap items-center justify-between gap-4"><Toggle checked={achievementForm.is_active} onChange={(v) => setAchievementForm({ ...achievementForm, is_active: v })} /><div className="flex gap-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white"><Save size={16}/> Save Achievement</button>{editing.type === "achievements" && <button type="button" onClick={() => resetForm("achievements")} className="rounded-lg border px-3"><X size={16}/></button>}</div></div>
                </form>
              </Card>
              <Card title={`Saved Cadet Achievements (${achievements.length})`}><RecordList items={achievements} titleKey="title" subtitleKey="cadet_name" onEdit={(item) => startEdit("achievements", item)} onDelete={(item) => removeRecord("achievements", item.id)} /></Card>
            </div>}
          </div>
        </div>
        {busy && <div className="mt-5 text-sm text-slate-500">Workingâ€¦</div>}
      </div>
    </div>
  );
}

function RecordList({ items, titleKey, subtitleKey, onEdit, onDelete }) {
  if (!items?.length) return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No items added yet.</div>;
  return <div className="divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="font-semibold text-slate-900">{item[titleKey] || "Untitled"}</p><p className="mt-1 break-all text-xs text-slate-500">{item[subtitleKey] || ""}</p><p className="mt-1 text-xs">{Number(item.is_active) === 1 ? <span className="inline-flex items-center gap-1 text-emerald-700"><Eye size={12} /> Published</span> : <span className="inline-flex items-center gap-1 text-slate-400"><EyeOff size={12} /> Hidden</span>}</p></div><div className="flex gap-2"><button onClick={() => onEdit(item)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50"><Pencil size={14} /> Edit</button><button onClick={() => onDelete(item)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 size={14} /> Delete</button></div></div>)}</div>;
}
