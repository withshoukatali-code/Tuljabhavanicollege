import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock3,
  Database,
  FileText,
  MonitorSmartphone,
  School,
  Users,
  LibraryBig,
  ArrowRight,
} from "lucide-react";

import TopBar from "../header/TopBar";
import Navbar from "../navbar/Navbar";
import PublicFooter from "../Footer/PublicFooter";

const stats = [
  { label: "Established", value: "1991" },
  { label: "Books / Volumes", value: "11,443+" },
  { label: "Automation", value: "2017-18" },
  { label: "Software", value: "SOUL 3.0" },
];

const hours = [
  { title: "Reading Room", time: "9:00 a.m. to 5:00 p.m." },
  { title: "Circulation", time: "10:00 a.m. to 4:00 p.m." },
];

const cards = [
  {
    title: "Library Staff",
    text: "A dedicated team supports student access, cataloguing, reference services, and reading assistance throughout the academic year.",
    icon: Users,
  },
  {
    title: "Collection",
    text: "The library includes textbooks, reference books, periodicals, journals, and subject-specific resources aligned with curriculum needs.",
    icon: BookOpen,
  },
  {
    title: "Jawahar Digital Library",
    text: "Digital access enhances learning through searchable resources, e-books, and online reference support for students and faculty.",
    icon: MonitorSmartphone,
  },
  {
    title: "Library Automation",
    text: "The library is fully automated to improve cataloging, issue-return management, and easy access to records and resources.",
    icon: Database,
  },
  {
    title: "Best Practices",
    text: "The institution promotes an inclusive and student-friendly reading culture with efficient services and transparent access policies.",
    icon: School,
  },
  {
    title: "E-Resources",
    text: "Students and faculty can explore digital learning materials, subject resources, and relevant academic support tools online.",
    icon: FileText,
  },
];

const quickLinks = [
  { label: "Vision & Mission", to: "/about" },
  { label: "Academic Programmes", to: "/academics/programmes" },
  { label: "Departments", to: "/departments" },
  { label: "Research", to: "/research" },
  { label: "E-Contents", to: "/e-contents" },
];

function LibraryPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <TopBar />
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0f3262] via-[#143f72] to-[#1e5da5] text-white shadow-xl shadow-slate-200">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                <LibraryBig size={16} />
                Our Library
              </div>

              <h1 className="mt-5 text-3xl font-bold sm:text-4xl lg:text-5xl">
                Knowledge, access, and learning support for every learner
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                The library was established in 1991 and continues to serve students, faculty, and researchers with a growing collection, digital tools, and a student-friendly learning environment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/departments"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0f3262] transition hover:bg-slate-100"
                >
                  Explore Departments
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/e-contents"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  E-Resources
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">Library Snapshot</h2>
              <div className="mt-5 space-y-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-blue-100">{stat.label}</span>
                    <span className="text-lg font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {hours.map((item) => (
            <div key={item.title} className="rounded-[22px] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm" style={{ borderLeft: "4px solid #0f3262" }}>
              <div className="mb-4 inline-flex rounded-xl bg-[#edf4ff] p-3 text-[#0f3262]">
                <Clock3 size={20} />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Working Hours</p>
              <h3 className="mt-3 text-xl font-bold text-[#0f3262]">{item.title}</h3>
              <p className="mt-3 text-base font-medium text-slate-700">{item.time}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-[#fffaf0] to-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#0f3262]">About the library</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              <p>
                The library was established in the year 1991 with the opening of the college and has grown steadily to become an academic resource center for students and faculty.
              </p>
              <p>
                With more than 11,443 volumes, it supports the curricular and co-curricular needs of the institution and provides an enriching environment for study, research, and reading culture.
              </p>
              <p>
                The library is led by Mr. S. B. Shaiwale since 15 December 2008, and library automation began in 2017-18 using SOUL 3.0 software for efficient operations and records management.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-[#f8fbff] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#0f3262]">Quick Links</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#0f3262] hover:text-[#0f3262]"
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0f3262]">Library Services & Facilities</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ title, text, icon: Icon }) => (
              <div
                key={title}
                className="rounded-[24px] border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                style={{ borderLeft: "4px solid #d4862d" }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-[#fff4e6] p-3 text-[#a45a1b]">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[#0f3262]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#0f3262] p-8 text-white shadow-lg">
            <h3 className="text-2xl font-bold">Library Rules</h3>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-blue-100">
              <li>• Students should maintain silence and discipline within the reading room.</li>
              <li>• Books are issued as per the rules and return schedule of the library.</li>
              <li>• Reference books and journals are for in-library use.</li>
              <li>• Proper care of library material is expected from all users.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-[#0f3262]">Vision & Objectives</h3>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
              <li>• To support academic excellence through quality reading resources.</li>
              <li>• To encourage research, self-learning, and independent study.</li>
              <li>• To create a student-friendly environment for knowledge discovery.</li>
              <li>• To provide digital and print resources that strengthen teaching and learning.</li>
            </ul>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default LibraryPage;
