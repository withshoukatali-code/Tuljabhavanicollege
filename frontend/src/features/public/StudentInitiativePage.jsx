import { ArrowUpRight, BookOpen, CalendarDays, FileText, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import TopBar from "./header/TopBar";
import Navbar from "./navbar/Navbar";
import PublicFooter from "./Footer/PublicFooter";

const nccResources = [
  {
    label: "NCC awards and achievements",
    url: "https://tuljabhavanicollege.org.in/wp-content/uploads/2022/04/Awards-Achivents-of-NCC.pdf",
  },
  {
    label: "B and C certificate examination results",
    url: "https://tuljabhavanicollege.org.in/wp-content/uploads/2022/04/Results-of-NCC-%E2%80%98C-%E2%80%98B-Certificate-Exam.pdf",
  },
  {
    label: "NCC special entry scheme notice",
    url: "https://tuljabhavanicollege.org.in/wp-content/uploads/2021/11/NCC_49.pdf",
  },
  {
    label: "Yoga Day activity report",
    url: "https://tuljabhavanicollege.org.in/wp-content/uploads/2021/11/Yoga-From-Home-_-Tuljabhavani-mahavidyalaya-Tuljapur.pdf",
  },
  {
    label: "Tree plantation activity report",
    url: "https://tuljabhavanicollege.org.in/wp-content/uploads/2021/11/Tree-plantation-from-home.pdf",
  },
  {
    label: "Blood donation and health check-up report",
    url: "https://tuljabhavanicollege.org.in/wp-content/uploads/2021/12/TMT-BloodDonationCamp-WPS-Office-1.pdf",
  },
];

const initiatives = {
  ncc: {
    shortName: "NCC",
    title: "National Cadet Corps",
    subtitle: "Discipline, leadership and service",
    description:
      "The college NCC unit develops responsible citizens through discipline, leadership, training and community service.",
    image: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/ncc2.jpg",
    imageAlt: "NCC cadets participating in a college activity",
    imagePosition: "object-center",
    facts: [
      { label: "College unit started", value: "1976", icon: CalendarDays },
      { label: "Published enrolment", value: "53 cadets", note: "2019-20 source figure", icon: UsersRound },
    ],
    introduction:
      "The National Cadet Corps was established on 16 July 1948 under the NCC Act XXXVI of 1948. Its national purpose is to help young people grow into disciplined citizens and future leaders, including in the defence services.",
    history: [
      { date: "1948", text: "The National Cadet Corps came into existence at national level under the Ministry of Defence." },
      { date: "1976", text: "The boys unit of the Tuljabhavani college NCC programme was started." },
      { date: "2019-20", text: "The source page records 53 enrolled cadets: 45 boys and 8 girls." },
    ],
    activities: [
      "Yoga Day",
      "Tree plantation",
      "Blood donation and health checks",
      "Rashtriya Ekata activities",
      "Community development and self-help",
      "Environment protection and service to weaker sections",
    ],
    principles: [
      "Work without fuss.",
      "Tell no lies.",
      "Obey with a smile.",
      "Be punctual.",
    ],
    leader: { label: "NCC Head and NAAC Coordinator", name: "Prof. Maj. Dr. Y. A. Doke", detail: "NCC Personal No. NCC/SD/45056" },
    resources: nccResources,
    gallery: [
      { src: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/ncc2.jpg", alt: "NCC cadets at a college programme" },
      { src: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/ncc.png", alt: "NCC cadets in uniform" },
      { src: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/ncc1.jpg", alt: "NCC unit activity at Tuljabhavani College" },
    ],
    source: "https://tuljabhavanicollege.org.in/ncc/",
    accent: "#52633b",
    overlay: "from-[#182019]/90 via-[#182019]/55 to-[#182019]/10",
  },
  nss: {
    shortName: "NSS",
    title: "National Service Scheme",
    subtitle: "Community engagement through student action",
    description:
      "The National Service Scheme gives students an opportunity to serve their community, develop social awareness and turn volunteer spirit into practical action.",
    image: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/images-1-150x150SliderNSS2.jpg",
    imageAlt: "NSS volunteers taking part in a community activity",
    imagePosition: "object-center",
    facts: [
      { label: "Active since", value: "1984", note: "College establishment", icon: CalendarDays },
      { label: "Sanctioned unit", value: "100 volunteers", icon: UsersRound },
    ],
    introduction:
      "NSS at Tuljabhavani Mahavidyalaya has been active since the college was established in 1984. The sanctioned unit of 100 volunteers conducts social programmes and helps students build awareness through service.",
    history: [
      { date: "Since 1984", text: "The college NSS unit has organized student-led social and community programmes." },
      { date: "100 volunteers", text: "The college source lists a sanctioned unit strength of one hundred volunteers." },
    ],
    activities: [
      "Swami Vivekananda Jayanti celebrations",
      "Blood donation",
      "Tree plantation",
      "Republic Day celebrations",
      "Independence Day celebrations",
      "Library book arrangement",
      "Computer awareness",
      "Road safety awareness",
      "Community camps and outreach",
    ],
    principles: [],
    leader: { label: "NSS Head", name: "Shri Vivekanand H. Chavan", detail: "Unit functions under the guidance of Hon. Prin. Dr. Shahjahan M. Maner." },
    resources: [],
    gallery: [
      { src: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/download-150x150SliderNSS.jpg", alt: "NSS volunteers during a service activity" },
      { src: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/images-1-150x150SliderNSS2.jpg", alt: "NSS volunteers at a college programme" },
      { src: "https://tuljabhavanicollege.org.in/wp-content/uploads/2023/06/images-2-150x150SliderNSS3.jpg", alt: "NSS community engagement at Tuljabhavani College" },
    ],
    source: "https://tuljabhavanicollege.org.in/nss/",
    accent: "#087a68",
    overlay: "from-[#102a27]/90 via-[#102a27]/55 to-[#102a27]/10",
  },
};

export default function StudentInitiativePage({ type }) {
  const page = initiatives[type] || initiatives.ncc;

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <TopBar />
      <Navbar />

      <main>
        <header className="relative isolate min-h-[19rem] overflow-hidden bg-slate-900 sm:min-h-[23rem]">
          <img
            src={page.image}
            alt={page.imageAlt}
            className={`absolute inset-0 h-full w-full object-cover ${page.imagePosition}`}
            fetchPriority="high"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${page.overlay}`} />
          <div className="relative mx-auto flex min-h-[19rem] max-w-7xl flex-col justify-end px-4 py-9 sm:min-h-[23rem] sm:px-6 sm:py-12 lg:px-8">
            <Link to="/students-era" className="mb-5 w-fit text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white">
              Students' Era
            </Link>
            <p className="text-sm font-semibold text-white/85">Tuljabhavani Mahavidyalaya, Tuljapur · {page.shortName}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">{page.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/85">{page.description}</p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section aria-label={`${page.shortName} unit facts`} className="grid border-b border-slate-200 sm:grid-cols-2">
            {page.facts.map(({ label, value, note, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 border-b border-slate-200 py-5 sm:border-b-0 sm:py-6 sm:even:border-l sm:even:pl-8">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-slate-200" style={{ color: page.accent }}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
                  {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-10 py-9 md:grid-cols-[minmax(0,1fr)_280px] lg:gap-16 lg:py-12">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{page.subtitle}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">About the {page.shortName} unit</h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{page.introduction}</p>

              <div className="mt-9 border-t border-slate-200">
                <h3 className="py-4 text-lg font-semibold text-slate-900">Unit history</h3>
                <ol className="divide-y divide-slate-200 border-y border-slate-200">
                  {page.history.map((item) => (
                    <li key={item.date} className="grid gap-2 py-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5">
                      <span className="text-sm font-semibold" style={{ color: page.accent }}>{item.date}</span>
                      <span className="text-sm leading-6 text-slate-600">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {page.principles.length > 0 && (
                <div className="mt-9">
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">Cardinals of NCC discipline</h3>
                  <ol className="grid gap-x-8 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-2 sm:divide-y-0">
                    {page.principles.map((principle, index) => (
                      <li key={principle} className="flex gap-3 py-3 text-sm text-slate-700 sm:border-b sm:border-slate-200">
                        <span className="font-bold tabular-nums" style={{ color: page.accent }}>0{index + 1}</span>
                        {principle}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-9">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Activities and service</h3>
                <ul className="grid gap-x-8 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-2 sm:divide-y-0">
                  {page.activities.map((activity, index) => (
                    <li key={activity} className="flex gap-3 py-3 text-sm leading-6 text-slate-700 sm:border-b sm:border-slate-200">
                      <span className="font-semibold tabular-nums" style={{ color: page.accent }}>{String(index + 1).padStart(2, "0")}</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="h-fit border-t-4 pt-5 md:border-t-0 md:border-l md:border-t-0 md:border-l-2 md:pl-6" style={{ borderColor: page.accent }}>
              <p className="text-xs font-semibold uppercase text-slate-500">Unit Head</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{page.leader.name}</h3>
              <p className="mt-1 text-sm font-medium" style={{ color: page.accent }}>{page.leader.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{page.leader.detail}</p>

              {page.resources.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-2 text-sm font-bold uppercase text-slate-700">Reports and resources</h3>
                  <ul className="divide-y divide-slate-200 border-y border-slate-200">
                    {page.resources.map((resource) => (
                      <li key={resource.url}>
                        <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 py-3 text-sm font-medium leading-5 text-slate-700 hover:text-slate-950">
                          <FileText size={16} className="mt-0.5 shrink-0" style={{ color: page.accent }} aria-hidden="true" />
                          <span className="min-w-0 flex-1">{resource.label}</span>
                          <ArrowUpRight size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </section>

          <section className="border-t border-slate-200 py-8 lg:py-10" aria-labelledby="initiative-gallery">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">On campus</p>
                <h2 id="initiative-gallery" className="mt-1 text-xl font-bold text-slate-900">{page.shortName} in action</h2>
              </div>
              <a href={page.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:underline">
                Official {page.shortName} page <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {page.gallery.map((image) => (
                <figure key={image.src} className="min-w-0">
                  <img src={image.src} alt={image.alt} loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                </figure>
              ))}
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}