import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarDays,
  ChevronRight,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Quote,
  Trophy,
  Users,
} from "lucide-react";

import TopBar from "../features/public/header/TopBar";
import Navbar from "../features/public/navbar/Navbar";
import PublicFooter from "../features/public/Footer/PublicFooter";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ============================================================
   HELPERS
   ============================================================ */

function resolveUrl(value) {
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE}${value}`;
  }

  return `${API_BASE}/${value}`;
}

function formatDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

/* ============================================================
   FALLBACK DATA
   API DATA WILL OVERRIDE THESE VALUES
   ============================================================ */

const fallbackStats = [
  {
    label: "Registered Alumni",
    value: "1,250+",
  },
  {
    label: "Alumni Activities",
    value: "35+",
  },
  {
    label: "Years of Association",
    value: "20+",
  },
  {
    label: "Community Initiatives",
    value: "15+",
  },
];

const fallbackCommittee = [
  {
    name: "Alumni Association President",
    designation: "President",
    photo: "",
  },
  {
    name: "Alumni Association Secretary",
    designation: "Secretary",
    photo: "",
  },
  {
    name: "Alumni Association Treasurer",
    designation: "Treasurer",
    photo: "",
  },
];

const fallbackAchievements = [
  {
    name: "Alumni Achiever",
    designation: "Professional / Public Service",
    department: "Former Student",
    batch: "",
    description:
      "Alumni achievements and professional contributions can be highlighted here.",
    photo: "",
  },
  {
    name: "Distinguished Alumni",
    designation: "Education / Research",
    department: "Former Student",
    batch: "",
    description:
      "Recognising alumni who have made meaningful contributions in their professional fields.",
    photo: "",
  },
  {
    name: "Alumni Contributor",
    designation: "Community Development",
    department: "Former Student",
    batch: "",
    description:
      "Alumni contributions to society, community development and institutional growth.",
    photo: "",
  },
];

const fallbackStories = [
  {
    name: "Alumni Name",
    batch: "Batch",
    department: "Department",
    story:
      "My college experience provided me with valuable knowledge, confidence and lifelong connections that continue to guide me in my professional journey.",
    photo: "",
  },
  {
    name: "Alumni Name",
    batch: "Batch",
    department: "Department",
    story:
      "The institution played an important role in shaping my academic foundation and preparing me for professional and personal growth.",
    photo: "",
  },
];

const fallbackActivities = [
  {
    title: "Annual Alumni Meet",
    date: "",
    venue: "College Campus",
    description:
      "Annual gathering of alumni, faculty members and institutional representatives.",
    image: "",
  },
  {
    title: "Alumni Interaction & Career Guidance",
    date: "",
    venue: "College Campus",
    description:
      "Interaction between alumni and current students for career guidance and mentoring.",
    image: "",
  },
  {
    title: "Community Engagement Activity",
    date: "",
    venue: "Community",
    description:
      "Alumni participation in community-oriented initiatives and institutional outreach.",
    image: "",
  },
];

const fallbackDocuments = [
  {
    title: "Alumni Association Constitution",
    file: "",
  },
  {
    title: "Alumni Annual Report",
    file: "",
  },
  {
    title: "Alumni Meeting Minutes",
    file: "",
  },
  {
    title: "Alumni Activity Report",
    file: "",
  },
];

/* ============================================================
   COMPONENT
   ============================================================ */

export default function Alumni() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAlumni() {
      try {
        const response = await fetch(
          `${API_BASE}/api/alumni`
        );

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        if (!cancelled && result?.success) {
          setPageData(result.data || result);
        }
      } catch (error) {
        console.error("ALUMNI API ERROR:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAlumni();

    return () => {
      cancelled = true;
    };
  }, []);

  const data = pageData || {};

  const stats =
    Array.isArray(data.stats) && data.stats.length
      ? data.stats
      : fallbackStats;

  const committee =
    Array.isArray(data.committee) && data.committee.length
      ? data.committee
      : fallbackCommittee;

  const achievements =
    Array.isArray(data.achievements) &&
    data.achievements.length
      ? data.achievements
      : fallbackAchievements;

  const stories =
    Array.isArray(data.stories) && data.stories.length
      ? data.stories
      : fallbackStories;

  const activities =
    Array.isArray(data.activities) &&
    data.activities.length
      ? data.activities
      : fallbackActivities;

  const documents =
    Array.isArray(data.documents) &&
    data.documents.length
      ? data.documents
      : fallbackDocuments;

  const highlights = useMemo(
    () => [
      {
        icon: GraduationCap,
        title: "Academic Mentoring",
        text: "Alumni can support students through academic interaction and mentoring.",
      },
      {
        icon: Users,
        title: "Career Guidance",
        text: "Professional alumni can share experience and career guidance with students.",
      },
      {
        icon: Trophy,
        title: "Institutional Support",
        text: "Alumni participation can contribute to institutional development and initiatives.",
      },
      {
        icon: Award,
        title: "Community Engagement",
        text: "Alumni can participate in social and community-oriented activities.",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <Navbar />

      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="relative overflow-hidden bg-slate-900">
        {data.hero_image && (
          <img
            src={resolveUrl(data.hero_image)}
            alt="Alumni"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}

        <div className="absolute inset-0 bg-slate-950/75" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-blue-300">
              <GraduationCap size={18} />
              Alumni Association
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {data.title || "Alumni Association"}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 md:text-lg">
              {data.subtitle ||
                "Connecting graduates, strengthening relationships and contributing to the continued growth of the institution."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/alumni/register"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Join Alumni Association
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/alumni/activities"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                View Activities
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          STATS
          ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
          {stats.slice(0, 4).map((stat, index) => (
            <div
              key={index}
              className="px-4 py-7 text-center sm:px-6"
            >
              <div className="text-2xl font-semibold text-blue-700 md:text-3xl">
                {stat.value}
              </div>

              <div className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ====================================================
            ABOUT + SIDEBAR
            ==================================================== */}

        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-7">
              <p className="text-sm font-medium text-blue-700">
                About the Association
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                Staying Connected Beyond Graduation
              </h2>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              <p className="leading-8 text-slate-600">
                {data.about ||
                  "The Alumni Association provides a platform for former students to remain connected with the institution, faculty and one another. It encourages alumni participation in academic development, mentoring, career guidance, community engagement and institutional growth."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {highlights.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={index}
                      className="rounded-md border border-slate-200 p-5"
                    >
                      <Icon
                        size={22}
                        className="text-blue-700"
                      />

                      <h3 className="mt-3 text-sm font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}

          <aside className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Alumni
              </h2>
            </div>

            <nav className="p-2">
              {[
                ["Overview", "/alumni"],
                ["About Association", "/alumni/about"],
                ["Alumni Committee", "/alumni/committee"],
                ["Alumni Achievers", "/alumni/achievers"],
                ["Alumni Stories", "/alumni/stories"],
                ["Activities", "/alumni/activities"],
                ["Contributions", "/alumni/contributions"],
                ["Gallery", "/alumni/gallery"],
                ["Alumni Registration", "/alumni/register"],
                ["Alumni Feedback", "/alumni/feedback"],
                ["Documents", "/alumni/documents"],
              ].map(([label, url], index) => (
                <Link
                  key={index}
                  to={url}
                  className={`flex items-center justify-between rounded-md px-4 py-3 text-sm transition ${
                    index === 0
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{label}</span>
                  <ChevronRight size={15} />
                </Link>
              ))}
            </nav>
          </aside>
        </section>

        {/* ====================================================
            COMMITTEE
            ==================================================== */}

        <section className="mt-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Alumni Association
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Office Bearers
              </h2>
            </div>

            <Link
              to="/alumni/committee"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            >
              View Committee
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {committee.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-5">
                  {member.photo ? (
                    <img
                      src={resolveUrl(member.photo)}
                      alt={member.name}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                      <Users size={28} />
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {member.designation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================
            ACHIEVERS
            ==================================================== */}

        <section className="mt-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Alumni Recognition
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Alumni Achievers
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Celebrating alumni who have made meaningful contributions
                in their professions and communities.
              </p>
            </div>

            <Link
              to="/alumni/achievers"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {achievements.slice(0, 3).map((person, index) => (
              <article
                key={index}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                {person.photo ? (
                  <img
                    src={resolveUrl(person.photo)}
                    alt={person.name}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-400">
                    <GraduationCap size={45} />
                  </div>
                )}

                <div className="p-6">
                  <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
                    {person.batch || "Alumni"}
                  </div>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {person.name}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {person.designation}
                  </p>

                  {person.department && (
                    <p className="mt-1 text-xs text-slate-400">
                      {person.department}
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {person.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ====================================================
            ALUMNI STORIES
            ==================================================== */}

        <section className="mt-16">
          <div className="mb-7">
            <p className="text-sm font-medium text-blue-700">
              From Our Alumni
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Alumni Stories
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {stories.slice(0, 2).map((story, index) => (
              <article
                key={index}
                className="relative rounded-lg border border-slate-200 bg-white p-7 shadow-sm"
              >
                <Quote
                  size={35}
                  className="absolute right-6 top-6 text-blue-100"
                />

                <div className="flex items-center gap-4">
                  {story.photo ? (
                    <img
                      src={resolveUrl(story.photo)}
                      alt={story.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <GraduationCap size={22} />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {story.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {story.batch}
                      {story.department
                        ? ` • ${story.department}`
                        : ""}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-7 text-slate-600">
                  “{story.story}”
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ====================================================
            CONTRIBUTIONS
            ==================================================== */}

        <section className="mt-16 rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-blue-700">
              Alumni Engagement
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              How Our Alumni Contribute
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Alumni participation can strengthen the institution through
              academic interaction, mentoring, professional guidance,
              community engagement and institutional support.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Academic Mentoring",
              "Career Guidance",
              "Institutional Support",
              "Community Engagement",
            ].map((item, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-600 bg-slate-50 p-5"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {item}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Alumni participation and engagement in institutional
                  development.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================
            ACTIVITIES
            ==================================================== */}

        <section className="mt-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Alumni Engagement
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Activities & Events
              </h2>
            </div>

            <Link
              to="/alumni/activities"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            >
              View All Activities
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {activities.slice(0, 3).map((activity, index) => (
              <article
                key={index}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                {activity.image ? (
                  <img
                    src={resolveUrl(activity.image)}
                    alt={activity.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-400">
                    <CalendarDays size={40} />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <CalendarDays size={14} />
                    {formatDate(activity.date) ||
                      "Alumni Activity"}
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-slate-900">
                    {activity.title}
                  </h3>

                  {activity.venue && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={14} />
                      {activity.venue}
                    </div>
                  )}

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {activity.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ====================================================
            DOCUMENTS
            ==================================================== */}

        <section className="mt-16">
          <div className="mb-7">
            <p className="text-sm font-medium text-blue-700">
              Institutional Documentation
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Alumni Documents
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((document, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <FileText size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-900">
                      {document.title}
                    </h3>

                    {document.academic_year && (
                      <p className="mt-1 text-xs text-slate-500">
                        {document.academic_year}
                      </p>
                    )}
                  </div>
                </div>

                {document.file ? (
                  <a
                    href={resolveUrl(document.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-700"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">
                    Document
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================
            REGISTRATION CTA
            ==================================================== */}

        <section className="mt-16 overflow-hidden rounded-xl bg-blue-900">
          <div className="px-6 py-12 text-center sm:px-10">
            <GraduationCap
              size={40}
              className="mx-auto text-blue-200"
            />

            <h2 className="mt-5 text-2xl font-semibold text-white md:text-3xl">
              Stay Connected With Your College
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100">
              Whether you graduated recently or years ago, remain
              connected with your institution and alumni community.
            </p>

            <Link
              to="/alumni/register"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Register as Alumni
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ====================================================
            CONTACT
            ==================================================== */}

        {(data.email || data.phone || data.address) && (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Contact Alumni Association
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {data.address && (
                <div className="flex gap-3">
                  <MapPin className="text-blue-700" size={19} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Address
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {data.address}
                    </p>
                  </div>
                </div>
              )}

              {data.phone && (
                <div className="flex gap-3">
                  <Phone className="text-blue-700" size={19} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {data.phone}
                    </p>
                  </div>
                </div>
              )}

              {data.email && (
                <div className="flex gap-3">
                  <Mail className="text-blue-700" size={19} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 break-all text-sm text-slate-600">
                      {data.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================
            LOADING INDICATOR
            ==================================================== */}

        {loading && (
          <div className="sr-only">
            Loading alumni information
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}