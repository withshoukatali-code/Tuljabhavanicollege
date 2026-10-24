
// import { useEffect, useMemo, useState } from "react";
// import {
//   ArrowUpRight,
//   BookOpen,
//   CalendarDays,
//   Download,
//   FileText,
//   ShieldCheck,
//   Users,
//   Menu,
//   X,
//   ChevronRight,
//   Image as ImageIcon,
//   RefreshCw,
//   AlertCircle,
// } from "lucide-react";

// import TopBar from "../header/TopBar";
// import Navbar from "../navbar/Navbar";
// import PublicFooter from "../Footer/PublicFooter";

// const API_BASE = (
//   import.meta.env.VITE_API_URL || ""
// ).replace(/\/+$/, "");

// const API = `${API_BASE}/api/student-initiatives/ncc`;
// const COLLEGE_API = `${API_BASE}/api/college-header`;

// function mediaUrl(value) {
//   if (!value) return "";

//   const path = String(value).trim();

//   if (/^(https?:\/\/|data:|blob:)/i.test(path)) {
//     return path;
//   }

//   return `${API_BASE}/${path.replace(/^\/+/, "")}`;
// }

// function isActive(item) {
//   return Number(item?.is_active ?? 1) === 1;
// }

// function ordered(items) {
//   return [...items].sort(
//     (a, b) =>
//       Number(a?.display_order || 0) -
//       Number(b?.display_order || 0)
//   );
// }

// function collegeNameFrom(json) {
//   const source = json?.college || json?.data || json;
//   const record = Array.isArray(source) ? source[0] : source;

//   return (
//     record?.college_name ||
//     record?.institution_name ||
//     record?.collegeName ||
//     record?.institutionName ||
//     record?.name ||
//     ""
//   );
// }

// function DatabaseText({ value, className = "" }) {
//   if (value == null || String(value).trim() === "") {
//     return null;
//   }

//   return (
//     <div
//       className={`whitespace-pre-line break-words leading-7 text-slate-700 ${className}`}
//     >
//       {String(value)}
//     </div>
//   );
// }

// function normalizeId(value) {
//   return String(value || "")
//     .trim()
//     .replace(/^#/, "")
//     .replace(/^\/+/, "");
// }

// function sidebarHref(target) {
//   const value = String(target || "").trim();

//   if (!value) return "#";

//   if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) {
//     return value;
//   }

//   if (value.startsWith("#") || value.startsWith("/")) {
//     return value;
//   }

//   return `#${value}`;
// }

// export default function NCC() {
//   const [data, setData] = useState({
//     initiative: null,
//     sections: [],
//     sidebar: [],
//     heads: [],
//     reports: [],
//   });

//   const [collegeName, setCollegeName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [retry, setRetry] = useState(0);

//   useEffect(() => {
//     const controller = new AbortController();

//     async function loadPage() {
//       setLoading(true);
//       setError("");

//       try {
//         const [pageResponse, collegeResponse] =
//           await Promise.all([
//             fetch(API, { signal: controller.signal }),
//             fetch(COLLEGE_API, {
//               signal: controller.signal,
//             }).catch(() => null),
//           ]);

//         if (!pageResponse.ok) {
//           throw new Error(
//             `NCC API returned HTTP ${pageResponse.status}`
//           );
//         }

//         const json = await pageResponse.json();

//         if (json?.success === false || !json?.initiative) {
//           throw new Error(
//             json?.message ||
//               "No NCC initiative record was returned."
//           );
//         }

//         let collegeJson = {};

//         if (collegeResponse?.ok) {
//           try {
//             collegeJson = await collegeResponse.json();
//           } catch {
//             collegeJson = {};
//           }
//         }

//         setData({
//           initiative: json.initiative,
//           sections: Array.isArray(json.sections)
//             ? json.sections
//             : [],
//           sidebar: Array.isArray(json.sidebar)
//             ? json.sidebar
//             : [],
//           heads: Array.isArray(json.heads)
//             ? json.heads
//             : [],
//           reports: Array.isArray(json.reports)
//             ? json.reports
//             : [],
//         });

//         setCollegeName(collegeNameFrom(collegeJson));
//       } catch (err) {
//         if (err.name !== "AbortError") {
//           setError(
//             err.message || "Unable to load NCC database content."
//           );
//         }
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     }

//     loadPage();

//     return () => controller.abort();
//   }, [retry]);

//   const initiative = data.initiative;

//   const sections = useMemo(
//     () => ordered(data.sections.filter(isActive)),
//     [data.sections]
//   );

//   const sidebar = useMemo(
//     () => ordered(data.sidebar.filter(isActive)),
//     [data.sidebar]
//   );

//   const heads = useMemo(
//     () => ordered(data.heads.filter(isActive)),
//     [data.heads]
//   );

//   const reports = useMemo(
//     () => ordered(data.reports.filter(isActive)),
//     [data.reports]
//   );

//   /*
//    * Sidebar navigation:
//    * 1. Use administrator-configured sidebar records.
//    * 2. If none exist, derive the links from database content.
//    * No fixed NCC section titles are inserted here.
//    */
//   const navigation = useMemo(() => {
//     if (sidebar.length > 0) {
//       return sidebar
//         .map((item) => ({
//           id: item.id,
//           label: item.label || item.title || "",
//           target: item.target || "",
//         }))
//         .filter((item) => item.label && item.target);
//     }

//     const items = [];

//     if (initiative?.title) {
//       items.push({
//         id: "db-overview",
//         label: initiative.title,
//         target: "overview",
//       });
//     }

//     sections.forEach((section) => {
//       items.push({
//         id: `section-${section.id}`,
//         label: section.title || "",
//         target: section.section_key || `section-${section.id}`,
//       });
//     });

//     if (heads.length > 0) {
//       items.push({
//         id: "db-leadership",
//         label: heads[0].designation || heads[0].name || "",
//         target: "unit-leadership",
//       });
//     }

//     if (reports.length > 0) {
//       items.push({
//         id: "db-reports",
//         label:
//           reports[0].category ||
//           reports[0].title ||
//           "",
//         target: "activity-and-reports",
//       });
//     }

//     return items.filter((item) => item.label && item.target);
//   }, [sidebar, initiative, sections, heads, reports]);

//   function handleNavigation(event, target) {
//     const value = String(target || "").trim();

//     if (
//       !value ||
//       /^(https?:\/\/|mailto:|tel:)/i.test(value) ||
//       value.startsWith("/")
//     ) {
//       setMenuOpen(false);
//       return;
//     }

//     const element = document.getElementById(normalizeId(value));

//     if (element) {
//       event.preventDefault();
//       element.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }

//     setMenuOpen(false);
//   }

//   if (loading) {
//     return (
//       <>
//         <TopBar />
//         <Navbar />

//         <main className="flex min-h-[40vh] items-center justify-center gap-3 px-4 text-slate-600">
//           <RefreshCw className="animate-spin" size={21} />
//           <span>Loading page content...</span>
//         </main>

//         <PublicFooter />
//       </>
//     );
//   }

//   if (error) {
//     return (
//       <>
//         <TopBar />
//         <Navbar />

//         <main className="mx-auto max-w-7xl px-4 py-16">
//           <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
//             <div className="flex items-center gap-2">
//               <AlertCircle size={22} />
//               <h1 className="text-xl font-bold">
//                 Unable to load page
//               </h1>
//             </div>

//             <p className="mt-2 break-words">{error}</p>

//             <button
//               type="button"
//               onClick={() => setRetry((value) => value + 1)}
//               className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
//             >
//               Retry
//             </button>
//           </div>
//         </main>

//         <PublicFooter />
//       </>
//     );
//   }

//   const hasContent = Boolean(
//     initiative?.title ||
//       initiative?.subtitle ||
//       initiative?.description ||
//       sections.length ||
//       heads.length ||
//       reports.length
//   );

//   return (
//     <>
//       <TopBar />
//       <Navbar />

//       <main className="min-h-screen bg-slate-50">
//         {/* Hero information is loaded from the database. */}
//         <section className="relative isolate overflow-hidden bg-slate-900 text-white">
//           {initiative?.hero_image && (
//             <img
//               src={mediaUrl(initiative.hero_image)}
//               alt={initiative.title || ""}
//               className="absolute inset-0 -z-20 h-full w-full object-cover"
//               onError={(event) => {
//                 event.currentTarget.style.display = "none";
//               }}
//             />
//           )}

//           <div className="absolute inset-0 -z-10 bg-slate-950/75" />

//           <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
//             {collegeName && (
//               <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-300">
//                 {collegeName}
//               </p>
//             )}

//             {initiative?.category && (
//               <div className="flex items-center gap-3 text-amber-300">
//                 <ShieldCheck size={27} />
//                 <span className="text-sm font-semibold uppercase tracking-widest">
//                   {initiative.category}
//                 </span>
//               </div>
//             )}

//             {initiative?.title && (
//               <h1 className="mt-4 max-w-4xl break-words text-3xl font-extrabold sm:text-5xl">
//                 {initiative.title}
//               </h1>
//             )}

//             {initiative?.subtitle && (
//               <p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-200">
//                 {initiative.subtitle}
//               </p>
//             )}
//           </div>
//         </section>

//         <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[280px_minmax(0,1fr)]">
//           {/* Sidebar comes from the database or database-derived records. */}
//           <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-5">
//             <button
//               type="button"
//               className="flex w-full items-center justify-between p-4 font-bold text-slate-800 lg:hidden"
//               aria-expanded={menuOpen}
//               onClick={() => setMenuOpen((value) => !value)}
//             >
//               Page navigation
//               {menuOpen ? <X size={20} /> : <Menu size={20} />}
//             </button>

//             <nav
//               aria-label="Page navigation"
//               className={`${
//                 menuOpen ? "block" : "hidden"
//               } space-y-1 p-3 lg:block`}
//             >
//               {navigation.map((item, index) => {
//                 const target = String(item.target || "");
//                 const external =
//                   /^(https?:\/\/|mailto:|tel:)/i.test(target);

//                 return (
//                   <a
//                     key={item.id ?? `${target}-${index}`}
//                     href={sidebarHref(target)}
//                     onClick={(event) =>
//                       handleNavigation(event, target)
//                     }
//                     target={external ? "_blank" : undefined}
//                     rel={external ? "noreferrer" : undefined}
//                     className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800"
//                   >
//                     <span className="break-words">{item.label}</span>
//                     <ChevronRight
//                       size={16}
//                       className="shrink-0"
//                     />
//                   </a>
//                 );
//               })}

//               {navigation.length === 0 && (
//                 <p className="px-3 py-2 text-sm text-slate-500">
//                   Navigation links have not been configured.
//                 </p>
//               )}
//             </nav>
//           </aside>

//           <div className="min-w-0 space-y-8">
//             {/* Main description: displayed once, from the database. */}
//             {initiative?.description && (
//               <section
//                 id="overview"
//                 className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
//               >
//                 <div className="mb-4 flex items-center gap-3">
//                   <BookOpen
//                     className="shrink-0 text-blue-700"
//                     size={24}
//                   />

//                   {initiative.title && (
//                     <h2 className="break-words text-xl font-bold text-slate-900">
//                       {initiative.title}
//                     </h2>
//                   )}
//                 </div>

//                 <DatabaseText value={initiative.description} />
//               </section>
//             )}

//             {/* All section headings and content come from the API. */}
//             {sections.map((section) => {
//               const id =
//                 normalizeId(
//                   section.section_key || `section-${section.id}`
//                 ) || `section-${section.id}`;

//               const image = mediaUrl(section.image_url);
//               const file = mediaUrl(section.file_url);

//               return (
//                 <section
//                   key={section.id}
//                   id={id}
//                   className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
//                 >
//                   {section.title && (
//                     <h2 className="mb-4 flex items-center gap-3 break-words text-xl font-bold text-slate-900">
//                       <BookOpen
//                         className="shrink-0 text-blue-700"
//                         size={23}
//                       />
//                       {section.title}
//                     </h2>
//                   )}

//                   <DatabaseText value={section.content} />

//                   {image && (
//                     <img
//                       src={image}
//                       alt={section.title || ""}
//                       loading="lazy"
//                       className="mt-5 max-h-[420px] w-full rounded-xl object-cover"
//                       onError={(event) => {
//                         event.currentTarget.style.display = "none";
//                       }}
//                     />
//                   )}

//                   {file && (
//                     <a
//                       href={file}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
//                     >
//                       <Download size={18} />
//                       {section.file_title ||
//                         section.title ||
//                         section.file_url}
//                       <ArrowUpRight size={16} />
//                     </a>
//                   )}
//                 </section>
//               );
//             })}

//             {/* Display every active leadership record from the database. */}
//             {heads.length > 0 && (
//               <section
//                 id="unit-leadership"
//                 className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
//               >
//                 <div className="mb-5 flex items-center gap-3">
//                   <Users
//                     className="shrink-0 text-blue-700"
//                     size={25}
//                   />
//                   <h2 className="text-xl font-bold text-slate-900">
//                     {heads[0].designation ||
//                       heads[0].name ||
//                       ""}
//                   </h2>
//                 </div>

//                 <div className="space-y-8">
//                   {heads.map((head) => (
//                     <article
//                       key={head.id}
//                       className="grid gap-6 border-b border-slate-100 pb-8 last:border-0 last:pb-0 sm:grid-cols-[180px_minmax(0,1fr)]"
//                     >
//                       <div>
//                         {head.profile_image_url ? (
//                           <img
//                             src={mediaUrl(head.profile_image_url)}
//                             alt={head.name || ""}
//                             loading="lazy"
//                             className="aspect-[3/4] w-full rounded-xl border border-slate-200 object-cover"
//                             onError={(event) => {
//                               event.currentTarget.style.display = "none";
//                             }}
//                           />
//                         ) : (
//                           <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-400">
//                             <ImageIcon size={34} />
//                             <span className="mt-2 text-sm">
//                               No profile photo
//                             </span>
//                           </div>
//                         )}
//                       </div>

//                       <div className="min-w-0">
//                         {head.name && (
//                           <h3 className="break-words text-2xl font-bold text-slate-900">
//                             {head.name}
//                           </h3>
//                         )}

//                         {head.designation && (
//                           <p className="mt-2 font-semibold text-blue-800">
//                             {head.designation}
//                           </p>
//                         )}

//                         {head.qualification && (
//                           <p className="mt-4 whitespace-pre-line break-words">
//                             <strong>Qualification:</strong>{" "}
//                             {head.qualification}
//                           </p>
//                         )}

//                         {head.experience && (
//                           <p className="mt-2 whitespace-pre-line break-words">
//                             <strong>Experience:</strong>{" "}
//                             {head.experience}
//                           </p>
//                         )}

//                         {head.achievements && (
//                           <div className="mt-3">
//                             <strong>Achievements:</strong>
//                             <DatabaseText value={head.achievements} />
//                           </div>
//                         )}

//                         {(head.profile_file_url ||
//                           head.profile_pdf_url) && (
//                           <a
//                             href={mediaUrl(
//                               head.profile_file_url ||
//                                 head.profile_pdf_url
//                             )}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-bold text-slate-950 hover:bg-amber-400"
//                           >
//                             <FileText size={18} />
//                             {head.profile_file_title ||
//                               head.profile_file_name ||
//                               "View profile PDF"}
//                             <ArrowUpRight size={16} />
//                           </a>
//                         )}
//                       </div>
//                     </article>
//                   ))}
//                 </div>
//               </section>
//             )}

//             {/* Report records and their links come from the database. */}
//             {reports.length > 0 && (
//               <section
//                 id="activity-and-reports"
//                 className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
//               >
//                 <div className="mb-5 flex items-center gap-3">
//                   <CalendarDays
//                     className="shrink-0 text-blue-700"
//                     size={25}
//                   />

//                   <h2 className="text-xl font-bold text-slate-900">
//                     {reports[0].category ||
//                       reports[0].title ||
//                       ""}
//                   </h2>
//                 </div>

//                 <div className="divide-y divide-slate-100">
//                   {reports.map((report) => (
//                     <div
//                       key={report.id}
//                       className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
//                     >
//                       <div className="min-w-0">
//                         {report.title && (
//                           <h3 className="break-words font-semibold text-slate-900">
//                             {report.title}
//                           </h3>
//                         )}

//                         <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
//                           {report.category && (
//                             <span>{report.category}</span>
//                           )}

//                           {report.academic_year && (
//                             <span>{report.academic_year}</span>
//                           )}

//                           {report.file_name && (
//                             <span className="break-all">
//                               {report.file_name}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {report.file_url && (
//                         <a
//                           href={mediaUrl(report.file_url)}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50 sm:self-center"
//                         >
//                           <Download size={17} />
//                           View / Download
//                         </a>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </section>
//             )}

//             {!hasContent && (
//               <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
//                 No active page content has been added in the administration panel.
//               </p>
//             )}
//           </div>
//         </div>
//       </main>

//       <PublicFooter />
//     </>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, FileText, Menu, X, ChevronRight, ShieldCheck, Users, Image as ImageIcon, Trophy, Download, CalendarDays, PlayCircle } from "lucide-react";
import TopBar from "../header/TopBar";
import Navbar from "../navbar/Navbar";
import PublicFooter from "../Footer/PublicFooter";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const PAGE_API = `${API_BASE}/api/student-initiatives/ncc`;
const HEADER_API = `${API_BASE}/api/college-header`;
const mediaUrl = (value) => { if (!value || typeof value !== "string") return ""; const v = value.trim(); return /^(https?:|data:|blob:)/i.test(v) ? v : `${API_BASE}/${v.replace(/^\/+/, "")}`; };
const active = (row) => row?.is_active == null || Number(row.is_active) === 1;
const slugify = (value) => String(value || "section").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
const headPhoto = (h) => h?.photo_url || h?.profile_image_url || h?.profile_photo_url || h?.photo || "";
const headPdf = (h) => h?.profile_pdf_url || h?.profile_file_url || h?.profile_pdf || "";
function collegeNameOf(data) { if (Array.isArray(data)) data = data[0]; if (data?.data) data = Array.isArray(data.data) ? data.data[0] : data.data; if (data?.college_header) data = data.college_header; return data?.college_name || data?.institution_name || data?.collegeName || data?.name || ""; }

export default function NCC() {
  const [page, setPage] = useState({ initiative: null, heads: [], sections: [], reports: [], achievements: [], media: [] });
  const [collegeName, setCollegeName] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false); const [activeId, setActiveId] = useState("overview");
  useEffect(() => { const controller = new AbortController(); (async () => { try {
    const [p, h] = await Promise.all([fetch(PAGE_API, { signal: controller.signal }), fetch(HEADER_API, { signal: controller.signal }).catch(() => null)]);
    const json = await p.json(); if (!p.ok || json.success === false) throw new Error(json.message || "Could not load NCC content");
    setPage({ initiative: json.initiative || null, heads: (json.heads || []).filter(active), sections: (json.sections || []).filter(active), reports: (json.reports || []).filter(active), achievements: (json.achievements || []).filter(active), media: (json.media || []).filter(active) });
    if (h?.ok) { try { setCollegeName(collegeNameOf(await h.json())); } catch {} }
  } catch (e) { if (e.name !== "AbortError") setError(e.message || "Unable to load NCC page."); } finally { setLoading(false); } })(); return () => controller.abort(); }, []);
  const initiative = page.initiative || {}; const head = page.heads[0] || {}; const photo = mediaUrl(headPhoto(head)); const profilePdf = mediaUrl(headPdf(head)); const heroImage = mediaUrl(initiative.hero_image);
  const sections = useMemo(() => [...page.sections].sort((a,b) => Number(a.display_order || 0) - Number(b.display_order || 0)), [page.sections]);
  const reports = page.reports; const achievements = page.achievements; const mediaItems = page.media;
  const photos = mediaItems.filter((m) => m.media_type === "photo"); const videos = mediaItems.filter((m) => m.media_type === "video");
  const videoEmbed = (url) => { try { const u = new URL(url); if (u.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`; if (u.hostname.includes("youtube.com")) { const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop(); return id ? `https://www.youtube-nocookie.com/embed/${id}` : ""; } if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean).pop()}`; } catch {} return ""; };
  const sectionItems = sections.map((section, i) => ({ ...section, anchor: slugify(section.section_key || section.title || `section-${i+1}`) }));
  const isGallerySection = (s) => /gallery|video/i.test(`${s.section_key || ""} ${s.title || ""}`);
  const primarySections = sectionItems.filter((s) => !isGallerySection(s));
  const gallerySections = sectionItems.filter(isGallerySection);
  const jumpTo = (id) => { setActiveId(id); setMobileOpen(false); document.getElementById(`ncc-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const nav = [{ id: "leadership", title: "Unit Leadership", icon: Users }, { id: "reports", title: "Activity and Reports", icon: FileText }, { id: "achievements", title: "Achievements of NCC Cadets", icon: Trophy }];
  return <div className="min-h-screen bg-slate-50 text-slate-800"><TopBar /><Navbar />
    <header className="relative isolate min-h-[340px] overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 text-white">
      {heroImage && <img src={heroImage} alt={initiative.title || "NCC unit"} className="absolute inset-0 -z-20 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
      <div className="absolute inset-0 -z-10 bg-slate-950/70" /><div className="mx-auto flex min-h-[340px] max-w-7xl flex-col justify-center px-5 py-12 md:px-8 md:py-16">
        {collegeName && <p className="mb-3 text-sm font-semibold text-blue-100">{collegeName}</p>}<p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-amber-300"><ShieldCheck size={16}/> Discipline Â· Leadership Â· Service</p>
        <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-5xl">{initiative.title || "National Cadet Corps (NCC)"}</h1>
        {initiative.subtitle && <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-8 text-blue-100 md:text-lg">{initiative.subtitle}</p>}
        <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => jumpTo("overview")} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950 hover:bg-amber-300">Explore the unit <ArrowUpRight size={17}/></button><button onClick={() => jumpTo("reports")} className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-5 py-3 font-bold text-white hover:bg-white/10">Activity and reports <Download size={17}/></button></div>
        <div className="mt-9 grid max-w-xl grid-cols-2 gap-3"><div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur"><p className="text-3xl font-black">{initiative.ncc_unit_started || "1976"}</p><p className="mt-1 text-sm text-blue-100">Unit started</p></div><div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur"><p className="text-3xl font-black">{initiative.ncc_enrolment || "53 cadets"}</p><p className="mt-1 text-sm text-blue-100">Published enrolment</p></div></div>
      </div></header>
    <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-12">
      <main className="min-w-0 space-y-7">
        {loading && <div className="rounded-xl border bg-white p-5 text-slate-600">Loading NCC page contentâ€¦</div>}
        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error}. Confirm GET /api/student-initiatives/ncc works.</div>}
        {initiative.description && <section id="ncc-overview" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Overview</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">About the NCC unit</h2><p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">{initiative.description}</p></section>}
        {primarySections.map((s) => <section key={s.id || s.anchor} id={`ncc-${s.anchor}`} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><BookOpen size={21}/></div><div className="min-w-0 flex-1"><h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">{s.title}</h2>{s.content && <div className="mt-3 whitespace-pre-line text-base leading-8 text-slate-600">{s.content}</div>}{s.file_url && <a href={mediaUrl(s.file_url)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-900"><FileText size={17}/>{s.file_title || s.title || "Open document"}<ArrowUpRight size={15}/></a>}</div></div></section>)}
        <section id="ncc-reports" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Documents</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Activity and Reports</h2>{reports.length ? <div className="mt-4 divide-y divide-slate-100">{reports.map((r) => <div key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="rounded-lg bg-red-50 p-3 text-red-700"><FileText size={20}/></div><div><a href={mediaUrl(r.file_url)} target="_blank" rel="noreferrer" className="font-bold text-blue-800 hover:underline">{r.title || "Open report PDF"}</a><p className="mt-1 text-sm text-slate-500">{[r.category, r.academic_year].filter(Boolean).join(" Â· ")}</p></div></div>{r.file_url && <a href={mediaUrl(r.file_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-sm font-semibold"><Download size={15}/> View PDF</a>}</div>)}</div> : <p className="mt-4 text-sm text-slate-500">Reports will appear here when published by the NCC administrator.</p>}</section>
        <section id="ncc-achievements" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Cadet excellence</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Achievements of NCC Cadets</h2>{achievements.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2">{achievements.map((a) => <article key={a.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">{a.photo_url && <img src={mediaUrl(a.photo_url)} alt={a.title} className="h-48 w-full object-cover" loading="lazy"/>}<div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-slate-900">{a.title}</h3>{a.award && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">{a.award}</span>}</div>{a.cadet_name && <p className="mt-2 text-sm font-semibold text-blue-800">{a.cadet_name}</p>}{a.achievement_date && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={13}/>{String(a.achievement_date).slice(0,10)}</p>}{a.description && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{a.description}</p>}{a.document_url && <a href={mediaUrl(a.document_url)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-bold text-blue-700"><FileText size={16}/> View certificate / document <ArrowUpRight size={14}/></a>}</div></article>)}</div> : <p className="mt-4 text-sm text-slate-500">Cadet achievements will appear here when published by the NCC administrator.</p>}</section>
        {gallerySections.map((s) => <section key={s.id || s.anchor} id={`ncc-${s.anchor}`} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">{/video/i.test(`${s.section_key || ""} ${s.title || ""}`) ? <PlayCircle size={21}/> : <ImageIcon size={21}/>}</div><div className="min-w-0 flex-1"><h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">{s.title}</h2>{s.content && <div className="mt-3 whitespace-pre-line text-base leading-8 text-slate-600">{s.content}</div>}{s.file_url && <a href={mediaUrl(s.file_url)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-900"><PlayCircle size={17}/>{s.file_title || s.title || "Open gallery media"}<ArrowUpRight size={15}/></a>}</div></div></section>)}
        <section id="ncc-photo-gallery" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">NCC moments</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Photo Gallery</h2>{photos.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{photos.map((m) => <figure key={m.id} className="overflow-hidden rounded-xl border border-slate-200">{m.media_url && <img src={mediaUrl(m.media_url)} alt={m.caption || m.title} loading="lazy" className="h-52 w-full object-cover"/>}<figcaption className="p-4"><h3 className="font-bold text-slate-900">{m.title}</h3>{m.caption && <p className="mt-1 text-sm font-medium text-blue-800">{m.caption}</p>}{m.description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{m.description}</p>}</figcaption></figure>)}</div> : <p className="mt-4 text-sm text-slate-500">Photos will appear here when published by the NCC administrator.</p>}</section>
        <section id="ncc-video-gallery" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Watch NCC in action</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Video Gallery</h2>{videos.length ? <div className="mt-5 grid gap-5 md:grid-cols-2">{videos.map((m) => { const embed = videoEmbed(m.media_url || ""); return <article key={m.id} className="overflow-hidden rounded-xl border border-slate-200">{embed ? <iframe src={embed} title={m.title} className="aspect-video w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/> : <a href={m.media_url} target="_blank" rel="noreferrer" className="flex aspect-video items-center justify-center gap-3 bg-slate-950 text-white"><PlayCircle size={34}/><span className="font-bold">Open video</span></a>}<div className="p-4"><h3 className="font-bold text-slate-900">{m.title}</h3>{m.caption && <p className="mt-1 text-sm font-medium text-blue-800">{m.caption}</p>}{m.description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{m.description}</p>}</div></article>})}</div> : <p className="mt-4 text-sm text-slate-500">Videos will appear here when published by the NCC administrator.</p>}</section>
      </main>
      <aside className="order-first h-fit space-y-5 lg:order-none lg:sticky lg:top-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><button className="flex w-full items-center justify-between p-4 font-bold lg:hidden" onClick={() => setMobileOpen(v => !v)}>NCC Quick Links {mobileOpen ? <X size={18}/> : <Menu size={18}/>}</button><nav className={`${mobileOpen ? "block" : "hidden"} p-3 lg:block`}><p className="hidden px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-widest text-slate-400 lg:block">Explore NCC</p>{nav.map(({id,title,icon:Icon}) => <button key={id} onClick={() => jumpTo(id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${activeId === id ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={18}/><span className="flex-1">{title}</span><ChevronRight size={15}/></button>)}</nav></div>
        <div id="ncc-leadership" className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="bg-blue-950 px-5 py-4 text-white"><p className="text-xs font-bold uppercase tracking-widest text-blue-200">Unit Leadership</p><h2 className="mt-1 text-lg font-bold">{head.designation || "Head of NCC"}</h2></div><div className="p-5">{photo ? <img src={photo} alt={head.name || "NCC unit leadership"} className="mx-auto mb-4 h-44 w-36 rounded-xl border border-slate-200 bg-slate-50 object-contain" onError={(e) => {e.currentTarget.style.display="none";}}/> : <div className="mx-auto mb-4 flex h-44 w-36 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400"><ImageIcon size={28}/></div>}{head.name && <h3 className="text-center font-bold text-slate-900">{head.name}</h3>}{head.designation && <p className="mt-1 text-center text-sm text-slate-500">{head.designation}</p>}{head.qualification && <p className="mt-3 text-sm leading-6 text-slate-600"><strong>Qualification:</strong> {head.qualification}</p>}{head.experience && <p className="mt-2 text-sm leading-6 text-slate-600"><strong>Experience:</strong> {head.experience}</p>}{head.achievements && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{head.achievements}</p>}{profilePdf && <a href={profilePdf} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">View Full Profile <ArrowUpRight size={16}/></a>}</div></div>
      </aside>
    </div><PublicFooter /></div>;
}
