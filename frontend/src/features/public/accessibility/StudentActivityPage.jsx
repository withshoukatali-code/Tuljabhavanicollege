import { useEffect, useState } from "react";
import {
    ArrowUpRight,
    Download,
    FileText,
    UserRound
} from "lucide-react";

import TopBar from "../header/TopBar";
import Navbar from "../navbar/Navbar";
import PublicFooter from "../Footer/PublicFooter";

const API_BASE =
    import.meta.env.VITE_API_URL ||
    "";

export default function StudentActivityPage({
    slug
}) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadPage = async () => {

            try {

                setLoading(true);

                const response = await fetch(
                    `${API_BASE}/api/student-activities/public/${slug}`
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load page"
                    );
                }

                const result =
                    await response.json();

                if (!result.success) {
                    throw new Error(
                        result.message ||
                        "Unable to load page"
                    );
                }

                setData(result);

            } catch (err) {

                console.error(err);

                setError(
                    err.message ||
                    "Something went wrong"
                );

            } finally {

                setLoading(false);
            }
        };

        loadPage();

    }, [slug]);


    if (loading) {

        return (
            <>
                <TopBar />
                <Navbar />

                <main className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-slate-500">
                        Loading...
                    </div>
                </main>

                <PublicFooter />
            </>
        );
    }


    if (error || !data) {

        return (
            <>
                <TopBar />
                <Navbar />

                <main className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-red-600">
                        {error || "Page not found"}
                    </div>
                </main>

                <PublicFooter />
            </>
        );
    }


    const {
        activity,
        coordinator,
        items = []
    } = data;


    return (
        <>
            <TopBar />
            <Navbar />

            <main className="bg-slate-50">

                {/* HERO */}

                <section className="bg-[#0f3262] text-white">

                    <div className="max-w-7xl mx-auto px-6 py-16">

                        <div className="max-w-4xl">

                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200 mb-4">
                                Student Development
                            </p>

                            <h1 className="text-4xl md:text-5xl font-bold">
                                {activity.title}
                            </h1>

                            {activity.subtitle && (
                                <p className="mt-5 text-lg text-blue-100">
                                    {activity.subtitle}
                                </p>
                            )}

                        </div>

                    </div>

                </section>


                <div className="max-w-7xl mx-auto px-6 py-12">

                    <div className="grid lg:grid-cols-[1fr_340px] gap-10">

                        {/* MAIN */}

                        <div>

                            {activity.description && (
                                <section className="bg-white rounded-2xl border border-slate-200 p-7 mb-8">

                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                        About the Activity
                                    </h2>

                                    <p className="text-slate-600 leading-8 whitespace-pre-line">
                                        {activity.description}
                                    </p>

                                </section>
                            )}


                            {/* ACTIVITIES / REPORTS */}

                            <section className="bg-white rounded-2xl border border-slate-200 p-7">

                                <div className="flex items-center justify-between gap-4 mb-6">

                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            Activities & Reports
                                        </h2>

                                        <p className="text-slate-500 mt-1">
                                            Activities, programmes and supporting reports
                                        </p>
                                    </div>

                                </div>


                                {items.length === 0 ? (

                                    <div className="py-10 text-center text-slate-500">
                                        No activities or reports available.
                                    </div>

                                ) : (

                                    <div className="space-y-4">

                                        {items.map((item) => (

                                            <article
                                                key={item.id}
                                                className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
                                            >

                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                                    <div className="flex gap-4">

                                                        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                                            <FileText
                                                                size={20}
                                                            />
                                                        </div>

                                                        <div>

                                                            <div className="flex flex-wrap items-center gap-2 mb-1">

                                                                {item.academic_year && (
                                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                                                        {item.academic_year}
                                                                    </span>
                                                                )}

                                                                {item.event_date && (
                                                                    <span className="text-xs text-slate-500">
                                                                        {new Date(
                                                                            item.event_date
                                                                        ).toLocaleDateString(
                                                                            "en-IN",
                                                                            {
                                                                                day: "2-digit",
                                                                                month: "short",
                                                                                year: "numeric"
                                                                            }
                                                                        )}
                                                                    </span>
                                                                )}

                                                            </div>

                                                            <h3 className="font-semibold text-lg text-slate-900">
                                                                {item.title}
                                                            </h3>

                                                            {item.description && (
                                                                <p className="mt-2 text-slate-600 leading-7">
                                                                    {item.description}
                                                                </p>
                                                            )}

                                                        </div>

                                                    </div>


                                                    {item.file_url && (

                                                        <a
                                                            href={`${API_BASE}${item.file_url}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f3262] text-white text-sm font-semibold hover:bg-blue-900"
                                                        >
                                                            <Download
                                                                size={16}
                                                            />

                                                            {item.file_title ||
                                                                "View Report"}

                                                            <ArrowUpRight
                                                                size={15}
                                                            />
                                                        </a>

                                                    )}

                                                </div>

                                            </article>

                                        ))}

                                    </div>
                                )}

                            </section>

                        </div>


                        {/* SIDEBAR */}

                        <aside>

                            {coordinator && (

                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">

                                    <div className="flex items-center gap-3 mb-6">

                                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                            <UserRound
                                                size={21}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">
                                                Head / Coordinator
                                            </p>

                                            <h2 className="font-bold text-slate-900">
                                                {coordinator.name}
                                            </h2>
                                        </div>

                                    </div>


                                    {coordinator.designation && (
                                        <div className="mb-5">

                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                                Designation
                                            </p>

                                            <p className="text-slate-800">
                                                {coordinator.designation}
                                            </p>

                                        </div>
                                    )}


                                    {coordinator.qualification && (
                                        <div className="mb-5">

                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                                Qualification
                                            </p>

                                            <p className="text-slate-700 whitespace-pre-line">
                                                {coordinator.qualification}
                                            </p>

                                        </div>
                                    )}


                                    {coordinator.experience && (
                                        <div className="mb-5">

                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                                Experience
                                            </p>

                                            <p className="text-slate-700 whitespace-pre-line">
                                                {coordinator.experience}
                                            </p>

                                        </div>
                                    )}


                                    {coordinator.achievements && (
                                        <div className="mb-5">

                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                                Achievements
                                            </p>

                                            <p className="text-slate-700 whitespace-pre-line leading-7">
                                                {coordinator.achievements}
                                            </p>

                                        </div>
                                    )}


                                    {coordinator.profile_file_url && (

                                        <a
                                            href={`${API_BASE}${coordinator.profile_file_url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0f3262] text-white font-semibold hover:bg-blue-900"
                                        >
                                            <FileText size={17} />

                                            {coordinator.profile_file_title ||
                                                "View Profile"}
                                        </a>

                                    )}

                                </div>

                            )}

                        </aside>

                    </div>

                </div>

            </main>

            <PublicFooter />
        </>
    );
}
