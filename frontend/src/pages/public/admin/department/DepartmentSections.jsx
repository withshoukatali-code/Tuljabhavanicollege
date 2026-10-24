import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const EMPTY_SECTION = { section_key: "", title: "", content: "", display_order: 0, is_active: 1 };

const toKey = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const fetchSections = async (departmentId) => {
  const response = await fetch(`${API_BASE}/api/departments/${departmentId}/sections`);
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || "Unable to load department sections.");
  return result.sections || [];
};

const DepartmentSections = ({ departmentId }) => {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(EMPTY_SECTION);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let current = true;
    fetchSections(departmentId)
      .then((loadedSections) => {
        if (current) setSections(loadedSections);
      })
      .catch((err) => {
        if (current) setError(err.message);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [departmentId]);

  const loadSections = async () => {
    try {
      setError("");
      setSections(await fetchSections(departmentId));
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_SECTION);
    setEditingId(null);
  };

  const saveSection = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        editingId
          ? `${API_BASE}/api/departments/${departmentId}/sections/${editingId}`
          : `${API_BASE}/api/departments/${departmentId}/sections`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, display_order: Number(form.display_order) || 0 }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to save department section.");
      const wasEditing = Boolean(editingId);
      resetForm();
      await loadSections();
      setMessage(wasEditing ? "Department page section updated." : "Department page section added.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editSection = (section) => {
    setEditingId(section.id);
    setForm({
      section_key: section.section_key || "",
      title: section.title || "",
      content: section.content || "",
      display_order: section.display_order || 0,
      is_active: Number(section.is_active),
    });
    setError("");
  };

  const deleteSection = async (section) => {
    if (!window.confirm(`Delete the "${section.title}" section?`)) return;
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/departments/${departmentId}/sections/${section.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to delete department section.");
      if (editingId === section.id) resetForm();
      await loadSections();
      setMessage("Department page section deleted.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mt-8 border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-bold text-slate-900">Department Page Sections</h2>
        <p className="mt-1 text-sm text-slate-500">Manage the content sections shown on the public department page.</p>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <div className="space-y-3">
          {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          {message && <p role="status" className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
          {loading ? <p className="py-5 text-sm text-slate-500">Loading sections...</p> : sections.map((section) => (
            <article key={section.id} className="flex items-start gap-3 border border-slate-200 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{section.title}</h3>
                  {Number(section.is_active) !== 1 && <span className="text-xs font-medium text-amber-700">Unpublished</span>}
                </div>
                <p className="mt-1 text-xs text-slate-500">#{section.section_key} Â· Order {section.display_order}</p>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">{section.content}</p>
              </div>
              <button type="button" onClick={() => editSection(section)} aria-label={`Edit ${section.title}`} className="p-1.5 text-slate-500 hover:text-blue-700"><Pencil size={16} /></button>
              <button type="button" onClick={() => deleteSection(section)} aria-label={`Delete ${section.title}`} className="p-1.5 text-slate-500 hover:text-red-700"><Trash2 size={16} /></button>
            </article>
          ))}
          {!loading && sections.length === 0 && <p className="border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No page sections yet.</p>}
        </div>

        <form onSubmit={saveSection} className="space-y-3 border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">{editingId ? "Edit section" : "Add section"}</h3>
            {editingId && <button type="button" aria-label="Cancel section edit" onClick={resetForm} className="p-1 text-slate-500 hover:text-slate-900"><X size={17} /></button>}
          </div>
          <label className="block text-xs font-medium text-slate-600">Title<input required value={form.title} onChange={(event) => {
            const title = event.target.value;
            setForm((previous) => ({ ...previous, title, section_key: editingId && previous.section_key ? previous.section_key : toKey(title) }));
          }} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="block text-xs font-medium text-slate-600">Section key<input required value={form.section_key} onChange={(event) => setForm({ ...form, section_key: toKey(event.target.value) })} placeholder="about" className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="block text-xs font-medium text-slate-600">Content<textarea rows="6" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label>
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-medium text-slate-600">Display order<input type="number" min="0" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} className="mt-1 block w-24 border border-slate-300 px-3 py-2 text-sm" /></label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={Number(form.is_active) === 1} onChange={(event) => setForm({ ...form, is_active: event.target.checked ? 1 : 0 })} />Published</label>
          </div>
          <button disabled={saving} className="inline-flex items-center gap-2 bg-[#0f3262] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{editingId ? <Save size={16} /> : <Plus size={16} />}{editingId ? "Save changes" : "Create section"}</button>
        </form>
      </div>
    </section>
  );
};

export default DepartmentSections;
