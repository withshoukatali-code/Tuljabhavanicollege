import { useEffect, useState } from "react";

const API_BASE =
    import.meta.env.VITE_API_URL ||
    "";


export default function StudentActivitiesAdmin() {

    const [activities, setActivities] = useState([]);
    const [selected, setSelected] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [activityForm, setActivityForm] = useState({
        title: "",
        subtitle: "",
        description: "",
        display_order: 0,
        is_active: 1
    });

    const [coordinatorForm, setCoordinatorForm] = useState({
        id: "",
        name: "",
        designation: "",
        achievements: "",
        qualification: "",
        experience: "",
        profile_file_title: "",
        profile: null
    });

    const [itemForm, setItemForm] = useState({
        id: "",
        academic_year: "",
        title: "",
        event_date: "",
        description: "",
        file_title: "",
        file: null,
        display_order: 0,
        is_active: 1
    });


    const loadActivities = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API_BASE}/api/student-activities/admin`
            );

            const result =
                await response.json();

            setActivities(
                result.activities || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };


    const loadActivity = async (id) => {

        const response = await fetch(
            `${API_BASE}/api/student-activities/admin/${id}`
        );

        const result =
            await response.json();

        if (!result.success) {
            return;
        }

        setSelected(result);

        setActivityForm({
            title: result.activity.title || "",
            subtitle: result.activity.subtitle || "",
            description: result.activity.description || "",
            display_order:
                result.activity.display_order || 0,
            is_active:
                result.activity.is_active ?? 1
        });

        const coordinator =
            result.coordinators?.[0];

        setCoordinatorForm({
            id: coordinator?.id || "",
            name: coordinator?.name || "",
            designation:
                coordinator?.designation || "",
            achievements:
                coordinator?.achievements || "",
            qualification:
                coordinator?.qualification || "",
            experience:
                coordinator?.experience || "",
            profile_file_title:
                coordinator?.profile_file_title || "",
            profile: null
        });

    };


    useEffect(() => {
        loadActivities();
    }, []);


    const selectActivity = (activity) => {
        loadActivity(activity.id);
    };


    const saveActivity = async (e) => {

        e.preventDefault();

        if (!selected) return;

        try {

            setSaving(true);

            const response = await fetch(
                `${API_BASE}/api/student-activities/admin/${selected.activity.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        activityForm
                    )
                }
            );

            const result =
                await response.json();

            if (!result.success) {
                alert(
                    result.message ||
                    "Unable to save"
                );
                return;
            }

            alert(
                "Activity updated successfully"
            );

            loadActivities();
            loadActivity(
                selected.activity.id
            );

        } catch (error) {

            console.error(error);

            alert("Server error");

        } finally {

            setSaving(false);
        }
    };


    const saveCoordinator = async (e) => {

        e.preventDefault();

        if (!selected) return;

        const formData = new FormData();

        formData.append(
            "activity_id",
            selected.activity.id
        );

        if (coordinatorForm.id) {
            formData.append(
                "coordinator_id",
                coordinatorForm.id
            );
        }

        formData.append(
            "name",
            coordinatorForm.name
        );

        formData.append(
            "designation",
            coordinatorForm.designation
        );

        formData.append(
            "achievements",
            coordinatorForm.achievements
        );

        formData.append(
            "qualification",
            coordinatorForm.qualification
        );

        formData.append(
            "experience",
            coordinatorForm.experience
        );

        formData.append(
            "profile_file_title",
            coordinatorForm.profile_file_title
        );

        if (coordinatorForm.profile) {
            formData.append(
                "profile",
                coordinatorForm.profile
            );
        }

        try {

            setSaving(true);

            const response = await fetch(
                `${API_BASE}/api/student-activities/admin/coordinator`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const result =
                await response.json();

            if (!result.success) {
                alert(
                    result.message ||
                    "Unable to save coordinator"
                );
                return;
            }

            alert(
                "Coordinator saved successfully"
            );

            loadActivity(
                selected.activity.id
            );

        } catch (error) {

            console.error(error);

            alert("Server error");

        } finally {

            setSaving(false);
        }
    };


    const saveItem = async (e) => {

        e.preventDefault();

        if (!selected) return;

        const formData = new FormData();

        formData.append(
            "activity_id",
            selected.activity.id
        );

        if (itemForm.id) {
            formData.append(
                "item_id",
                itemForm.id
            );
        }

        formData.append(
            "academic_year",
            itemForm.academic_year
        );

        formData.append(
            "title",
            itemForm.title
        );

        formData.append(
            "event_date",
            itemForm.event_date
        );

        formData.append(
            "description",
            itemForm.description
        );

        formData.append(
            "file_title",
            itemForm.file_title
        );

        formData.append(
            "display_order",
            itemForm.display_order
        );

        formData.append(
            "is_active",
            itemForm.is_active
        );

        if (itemForm.file) {
            formData.append(
                "file",
                itemForm.file
            );
        }

        try {

            setSaving(true);

            const response = await fetch(
                `${API_BASE}/api/student-activities/admin/item`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const result =
                await response.json();

            if (!result.success) {
                alert(
                    result.message ||
                    "Unable to save"
                );
                return;
            }

            alert(
                "Activity/report saved"
            );

            setItemForm({
                id: "",
                academic_year: "",
                title: "",
                event_date: "",
                description: "",
                file_title: "",
                file: null,
                display_order: 0,
                is_active: 1
            });

            loadActivity(
                selected.activity.id
            );

        } catch (error) {

            console.error(error);

            alert("Server error");

        } finally {

            setSaving(false);
        }
    };


    const deleteItem = async (id) => {

        if (!window.confirm(
            "Delete this activity/report?"
        )) {
            return;
        }

        await fetch(
            `${API_BASE}/api/student-activities/admin/item/${id}`,
            {
                method: "DELETE"
            }
        );

        loadActivity(
            selected.activity.id
        );
    };


    const deleteCoordinator = async (id) => {

        if (!window.confirm(
            "Delete this coordinator?"
        )) {
            return;
        }

        await fetch(
            `${API_BASE}/api/student-activities/admin/coordinator/${id}`,
            {
                method: "DELETE"
            }
        );

        loadActivity(
            selected.activity.id
        );
    };


    if (loading) {
        return (
            <div className="p-8">
                Loading...
            </div>
        );
    }


    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Student Activities
            </h1>


            <div className="grid lg:grid-cols-[280px_1fr] gap-6">

                {/* LEFT */}

                <div className="bg-white border rounded-xl p-3">

                    <h2 className="font-semibold px-3 py-2">
                        Sections
                    </h2>

                    {activities.map(
                        (activity) => (

                            <button
                                key={activity.id}
                                onClick={() =>
                                    selectActivity(activity)
                                }
                                className={`w-full text-left px-4 py-3 rounded-lg mb-1 ${
                                    selected?.activity?.id === activity.id
                                        ? "bg-blue-50 text-blue-700 font-semibold"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                {activity.title}
                            </button>

                        )
                    )}

                </div>


                {/* RIGHT */}

                {selected ? (

                    <div className="space-y-6">

                        {/* BASIC INFORMATION */}

                        <form
                            onSubmit={saveActivity}
                            className="bg-white border rounded-xl p-6"
                        >

                            <h2 className="text-xl font-bold mb-5">
                                Basic Information
                            </h2>

                            <div className="space-y-4">

                                <input
                                    className="w-full border rounded-lg px-4 py-3"
                                    value={activityForm.title}
                                    onChange={(e) =>
                                        setActivityForm({
                                            ...activityForm,
                                            title: e.target.value
                                        })
                                    }
                                    placeholder="Title"
                                />

                                <input
                                    className="w-full border rounded-lg px-4 py-3"
                                    value={activityForm.subtitle}
                                    onChange={(e) =>
                                        setActivityForm({
                                            ...activityForm,
                                            subtitle: e.target.value
                                        })
                                    }
                                    placeholder="Subtitle"
                                />

                                <textarea
                                    rows="5"
                                    className="w-full border rounded-lg px-4 py-3"
                                    value={activityForm.description}
                                    onChange={(e) =>
                                        setActivityForm({
                                            ...activityForm,
                                            description: e.target.value
                                        })
                                    }
                                    placeholder="Description"
                                />

                                <button
                                    disabled={saving}
                                    className="px-5 py-3 rounded-lg bg-blue-700 text-white font-semibold"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Information"}
                                </button>

                            </div>

                        </form>


                        {/* COORDINATOR */}

                        <form
                            onSubmit={saveCoordinator}
                            className="bg-white border rounded-xl p-6"
                        >

                            <div className="flex justify-between mb-5">

                                <h2 className="text-xl font-bold">
                                    Head / Coordinator
                                </h2>

                                {coordinatorForm.id && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteCoordinator(
                                                coordinatorForm.id
                                            )
                                        }
                                        className="text-red-600"
                                    >
                                        Delete
                                    </button>
                                )}

                            </div>


                            <div className="grid md:grid-cols-2 gap-4">

                                <input
                                    required
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="Name"
                                    value={coordinatorForm.name}
                                    onChange={(e) =>
                                        setCoordinatorForm({
                                            ...coordinatorForm,
                                            name: e.target.value
                                        })
                                    }
                                />

                                <input
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="Designation"
                                    value={coordinatorForm.designation}
                                    onChange={(e) =>
                                        setCoordinatorForm({
                                            ...coordinatorForm,
                                            designation: e.target.value
                                        })
                                    }
                                />

                                <textarea
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="Qualification"
                                    value={coordinatorForm.qualification}
                                    onChange={(e) =>
                                        setCoordinatorForm({
                                            ...coordinatorForm,
                                            qualification: e.target.value
                                        })
                                    }
                                />

                                <textarea
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="Experience"
                                    value={coordinatorForm.experience}
                                    onChange={(e) =>
                                        setCoordinatorForm({
                                            ...coordinatorForm,
                                            experience: e.target.value
                                        })
                                    }
                                />

                                <textarea
                                    className="border rounded-lg px-4 py-3 md:col-span-2"
                                    rows="4"
                                    placeholder="Achievements"
                                    value={coordinatorForm.achievements}
                                    onChange={(e) =>
                                        setCoordinatorForm({
                                            ...coordinatorForm,
                                            achievements: e.target.value
                                        })
                                    }
                                />

                                <input
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="Profile PDF title"
                                    value={coordinatorForm.profile_file_title}
                                    onChange={(e) =>
                                        setCoordinatorForm({
                                            ...coordinatorForm,
                                            profile_file_title: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="border rounded-lg px-4 py-3"
                                    onChange={(e) =>
                                        setCoordinatorForm({
                                            ...coordinatorForm,
                                            profile:
                                                e.target.files?.[0] || null
                                        })
                                    }
                                />

                            </div>


                            <button
                                disabled={saving}
                                className="mt-5 px-5 py-3 rounded-lg bg-blue-700 text-white font-semibold"
                            >
                                Save Coordinator
                            </button>

                        </form>


                        {/* ADD ACTIVITY */}

                        <form
                            onSubmit={saveItem}
                            className="bg-white border rounded-xl p-6"
                        >

                            <h2 className="text-xl font-bold mb-5">
                                Add Activity / Report
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">

                                <input
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="Academic Year e.g. 2025-26"
                                    value={itemForm.academic_year}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            academic_year: e.target.value
                                        })
                                    }
                                />

                                <input
                                    required
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="Activity / Programme Title"
                                    value={itemForm.title}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            title: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="date"
                                    className="border rounded-lg px-4 py-3"
                                    value={itemForm.event_date}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            event_date: e.target.value
                                        })
                                    }
                                />

                                <input
                                    className="border rounded-lg px-4 py-3"
                                    placeholder="PDF title"
                                    value={itemForm.file_title}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            file_title: e.target.value
                                        })
                                    }
                                />

                                <textarea
                                    className="border rounded-lg px-4 py-3 md:col-span-2"
                                    rows="4"
                                    placeholder="Description"
                                    value={itemForm.description}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            description: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    className="border rounded-lg px-4 py-3"
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            file:
                                                e.target.files?.[0] || null
                                        })
                                    }
                                />

                            </div>


                            <button
                                disabled={saving}
                                className="mt-5 px-5 py-3 rounded-lg bg-green-700 text-white font-semibold"
                            >
                                {itemForm.id
                                    ? "Update Activity"
                                    : "Add Activity"}
                            </button>

                        </form>


                        {/* EXISTING ITEMS */}

                        <div className="bg-white border rounded-xl p-6">

                            <h2 className="text-xl font-bold mb-5">
                                Existing Activities / Reports
                            </h2>

                            <div className="space-y-3">

                                {selected.items?.map(
                                    (item) => (

                                        <div
                                            key={item.id}
                                            className="border rounded-lg p-4 flex justify-between gap-4"
                                        >

                                            <div>

                                                <h3 className="font-semibold">
                                                    {item.title}
                                                </h3>

                                                <p className="text-sm text-slate-500">
                                                    {item.academic_year}
                                                    {item.event_date
                                                        ? ` â€¢ ${item.event_date}`
                                                        : ""}
                                                </p>

                                                {item.file_url && (
                                                    <a
                                                        href={`${API_BASE}${item.file_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-700 text-sm"
                                                    >
                                                        View File
                                                    </a>
                                                )}

                                            </div>


                                            <div className="flex gap-3">

                                                <button
                                                    type="button"
                                                    className="text-blue-700"
                                                    onClick={() =>
                                                        setItemForm({
                                                            id: item.id,
                                                            academic_year:
                                                                item.academic_year || "",
                                                            title:
                                                                item.title || "",
                                                            event_date:
                                                                item.event_date || "",
                                                            description:
                                                                item.description || "",
                                                            file_title:
                                                                item.file_title || "",
                                                            file: null,
                                                            display_order:
                                                                item.display_order || 0,
                                                            is_active:
                                                                item.is_active ?? 1
                                                        })
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="text-red-600"
                                                    onClick={() =>
                                                        deleteItem(item.id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                ) : (

                    <div className="bg-white border rounded-xl p-10 flex items-center justify-center text-slate-500">
                        Select a section from the left.
                    </div>

                )}

            </div>

        </div>
    );
}
