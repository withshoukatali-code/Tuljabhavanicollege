
import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_INITIATIVE = {
  category: "Student Initiatives",
  title: "",
  slug: "ncc",
  subtitle: "",
  description: "",
  display_order: 0,
  is_active: 1,
};

const EMPTY_HEAD = {
  name: "",
  designation: "",
  qualification: "",
  experience: "",
  achievements: "",
  profile_file_title: "",
  is_active: 1,
};

export default function StudentInitiativeAdmin() {
  const [initiatives, setInitiatives] = useState([]);
  const [heads, setHeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [initiativeForm, setInitiativeForm] = useState(EMPTY_INITIATIVE);
  const [headForm, setHeadForm] = useState(EMPTY_HEAD);
  const [editingHead, setEditingHead] = useState(null);
  const [files, setFiles] = useState({});
  const [headFiles, setHeadFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const adminUrl = `${API_BASE}/api/admin/student-initiatives`;

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  }

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const result = await request(adminUrl);

      setInitiatives(result.initiatives || []);
      setHeads(result.heads || []);

      if (selected) {
        const current = result.initiatives.find(
          (item) => item.id === selected
        );

        if (current) {
          setInitiativeForm(current);
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Load once when the admin page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseInitiative(item) {
    setSelected(item.id);
    setInitiativeForm({ ...item });
    setFiles({});
    setHeadForm(EMPTY_HEAD);
    setEditingHead(null);
    setMessage("");
  }

  function newInitiative() {
    setSelected(null);
    setInitiativeForm({ ...EMPTY_INITIATIVE });
    setFiles({});
    setHeadForm(EMPTY_HEAD);
    setEditingHead(null);
    setMessage("");
  }

  async function saveInitiative(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const form = new FormData();

      [
        "category",
        "title",
        "slug",
        "subtitle",
        "description",
        "display_order",
        "is_active",
      ].forEach((key) => {
        form.append(key, initiativeForm[key] ?? "");
      });

      form.append(
        "existing_hero_image",
        initiativeForm.hero_image || ""
      );

      form.append(
        "existing_profile_pdf_url",
        initiativeForm.profile_pdf_url || ""
      );

      if (files.hero_image) {
        form.append("hero_image", files.hero_image);
      }

      if (files.profile_pdf) {
        form.append("profile_pdf", files.profile_pdf);
      }

      const url = selected ? `${adminUrl}/${selected}` : adminUrl;

      const result = await request(url, {
        method: selected ? "PUT" : "POST",
        body: form,
      });

      setMessage("Initiative saved successfully.");

      await load();

      if (result.initiative) {
        setSelected(result.initiative.id);
        setInitiativeForm(result.initiative);
      }

      setFiles({});
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveHead(event) {
    event.preventDefault();

    if (!selected) {
      setMessage("Save the initiative before adding leadership.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const form = new FormData();

      Object.entries(headForm).forEach(([key, value]) => {
        form.append(key, value ?? "");
      });

      form.append(
        "existing_profile_image_url",
        editingHead?.profile_image_url || ""
      );

      form.append(
        "existing_profile_file_url",
        editingHead?.profile_file_url || ""
      );

      if (headFiles.profile_image) {
        form.append("profile_image", headFiles.profile_image);
      }

      if (headFiles.profile_file) {
        form.append("profile_file", headFiles.profile_file);
      }

      const url = editingHead
        ? `${adminUrl}/heads/${editingHead.id}`
        : `${adminUrl}/${selected}/heads`;

      await request(url, {
        method: editingHead ? "PUT" : "POST",
        body: form,
      });

      setMessage("Leadership profile saved successfully.");
      setHeadForm(EMPTY_HEAD);
      setHeadFiles({});
      setEditingHead(null);

      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item, isHead = false) {
    try {
      await request(
        isHead
          ? `${adminUrl}/heads/${item.id}/status`
          : `${adminUrl}/${item.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_active: Number(item.is_active) === 1 ? 0 : 1,
          }),
        }
      );

      setMessage("Status updated.");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editHead(head) {
    setEditingHead(head);

    setHeadForm({
      name: head.name || "",
      designation: head.designation || "",
      qualification: head.qualification || "",
      experience: head.experience || "",
      achievements: head.achievements || "",
      profile_file_title: head.profile_file_title || "",
      is_active: head.is_active ?? 1,
    });

    setHeadFiles({});
  }

  const selectedHeads = heads.filter(
    (head) => Number(head.initiative_id) === Number(selected)
  );

  if (loading) {
    return <div className="p-6">Loading student initiatives...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Student Initiatives Management
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage NCC, NSS, unit leadership, profile photos and PDF documents.
        </p>
      </header>

      {message && (
        <div role="status" className="rounded-lg bg-slate-100 p-4 text-sm">
          {message}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border p-4">
          <button
            type="button"
            onClick={newInitiative}
            className="w-full rounded-lg bg-blue-900 px-4 py-3 font-semibold text-white"
          >
            + New initiative
          </button>

          <h2 className="mb-3 mt-6 font-bold">Existing initiatives</h2>

          <div className="space-y-2">
            {initiatives.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => chooseInitiative(item)}
                className={`w-full rounded-lg border p-3 text-left ${
                  selected === item.id
                    ? "border-blue-800 bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  /{item.slug} · {Number(item.is_active) === 1 ? "Active" : "Inactive"}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 space-y-8">
          <form
            onSubmit={saveInitiative}
            className="space-y-5 rounded-xl border p-5"
          >
            <h2 className="text-xl font-bold">
              {selected ? "Edit initiative" : "Create initiative"}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" value={initiativeForm.category}
                onChange={(v) => setInitiativeForm({ ...initiativeForm, category: v })}
                required />

              <Field label="Page title" value={initiativeForm.title}
                onChange={(v) => setInitiativeForm({ ...initiativeForm, title: v })}
                required />

              <label className="block text-sm font-medium">
                Slug
                <select
                  required
                  value={initiativeForm.slug}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, slug: e.target.value })}
                  className="mt-1 block w-full rounded-lg border p-3"
                >
                  <option value="ncc">NCC</option>
                  <option value="nss">NSS</option>
                </select>
              </label>

              <Field label="Subtitle" value={initiativeForm.subtitle || ""}
                onChange={(v) => setInitiativeForm({ ...initiativeForm, subtitle: v })} />

              <Field label="Display order" type="number"
                value={initiativeForm.display_order ?? 0}
                onChange={(v) => setInitiativeForm({ ...initiativeForm, display_order: v })} />

              <label className="block text-sm font-medium">
                Status
                <select
                  value={initiativeForm.is_active ?? 1}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, is_active: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border p-3"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium">
              Description
              <textarea
                rows={5}
                value={initiativeForm.description || ""}
                onChange={(e) => setInitiativeForm({ ...initiativeForm, description: e.target.value })}
                className="mt-1 block w-full rounded-lg border p-3"
              />
            </label>

            <Upload label="Hero image" accept="image/jpeg,image/png,image/webp"
              onChange={(file) => setFiles({ ...files, hero_image: file })}
              current={initiativeForm.hero_image} />

            <Upload label="Initiative profile PDF" accept="application/pdf"
              onChange={(file) => setFiles({ ...files, profile_pdf: file })}
              current={initiativeForm.profile_pdf_url} />

            <button disabled={saving}
              className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white disabled:opacity-50">
              {saving ? "Saving..." : "Save initiative"}
            </button>
          </form>

          {selected && (
            <section className="space-y-5 rounded-xl border p-5">
              <h2 className="text-xl font-bold">Unit leadership</h2>

              {selectedHeads.map((head) => (
                <article key={head.id} className="flex flex-wrap items-center gap-4 border-b pb-4">
                  {head.profile_image_url && (
                    <img
                      src={`${API_BASE}/${head.profile_image_url.replace(/^\/+/, "")}`}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{head.name}</p>
                    <p className="text-sm text-slate-600">{head.designation}</p>
                    <p className="text-xs text-slate-500">
                      {Number(head.is_active) === 1 ? "Active" : "Inactive"}
                    </p>
                  </div>

                  <button type="button" onClick={() => editHead(head)}
                    className="rounded border px-3 py-2 text-sm">
                    Edit
                  </button>

                  <button type="button" onClick={() => toggleStatus(head, true)}
                    className="rounded border px-3 py-2 text-sm">
                    {Number(head.is_active) === 1 ? "Deactivate" : "Activate"}
                  </button>
                </article>
              ))}

              <form onSubmit={saveHead} className="space-y-4 border-t pt-5">
                <h3 className="font-bold">
                  {editingHead ? "Edit leader" : "Add unit leader"}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={headForm.name}
                    onChange={(v) => setHeadForm({ ...headForm, name: v })} required />

                  <Field label="Designation" value={headForm.designation}
                    onChange={(v) => setHeadForm({ ...headForm, designation: v })} />

                  <Field label="Qualification" value={headForm.qualification}
                    onChange={(v) => setHeadForm({ ...headForm, qualification: v })} />

                  <Field label="Experience" value={headForm.experience}
                    onChange={(v) => setHeadForm({ ...headForm, experience: v })} />

                  <Field label="Profile document title" value={headForm.profile_file_title}
                    onChange={(v) => setHeadForm({ ...headForm, profile_file_title: v })} />

                  <label className="block text-sm font-medium">
                    Status
                    <select value={headForm.is_active}
                      onChange={(e) => setHeadForm({ ...headForm, is_active: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-lg border p-3">
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium">
                  Achievements
                  <textarea rows={3} value={headForm.achievements}
                    onChange={(e) => setHeadForm({ ...headForm, achievements: e.target.value })}
                    className="mt-1 block w-full rounded-lg border p-3" />
                </label>

                <Upload label="Leadership photo" accept="image/jpeg,image/png,image/webp"
                  onChange={(file) => setHeadFiles({ ...headFiles, profile_image: file })}
                  current={editingHead?.profile_image_url} />

                <Upload label="Leadership PDF" accept="application/pdf"
                  onChange={(file) => setHeadFiles({ ...headFiles, profile_file: file })}
                  current={editingHead?.profile_file_url} />

                <div className="flex flex-wrap gap-3">
                  <button disabled={saving}
                    className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white disabled:opacity-50">
                    {saving ? "Saving..." : "Save leader"}
                  </button>

                  {editingHead && (
                    <button type="button"
                      onClick={() => {
                        setEditingHead(null);
                        setHeadForm(EMPTY_HEAD);
                        setHeadFiles({});
                      }}
                      className="rounded-lg border px-5 py-3">
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        required={required}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-lg border p-3"
      />
    </label>
  );
}

function Upload({ label, accept, onChange, current }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="mt-1 block w-full rounded-lg border p-3"
      />
      {current && (
        <span className="mt-1 block break-all text-xs text-slate-500">
          Existing file: {current}
        </span>
      )}
    </label>
  );
}

