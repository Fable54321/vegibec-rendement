import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useTaskCategories, type TaskCategory, type TaskSubcategory } from "@/context/taskCategories/TaskCategoriesContext";





const TaskCategoriesAdmin = () => {


    const [activeTab, setActiveTab] = useState<"addCat" | "delCat" | "addSub" | "delSub">("addCat");
    const [submitLoading, setSubmitLoading] = useState(false);


    const { categories, subcategories, fetchSubcategories, fetchCategories, loadingCategories, loadingSubcategories } = useTaskCategories();

    const mainLoading = loadingCategories || loadingSubcategories || submitLoading;

    const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);


    const [newCategoryName, setNewCategoryName] = useState("");
    const [newSubCategoryName, setNewSubCategoryName] = useState("");






    useEffect(() => {
        if (activeTab === "delSub" && categories.length > 0) {
            const cat = selectedCategory || categories[0];
            setSelectedCategory(cat);
            fetchSubcategories(cat.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, categories]);





    // ✅ Handlers
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return alert("Nom requis");
        setSubmitLoading(true);
        await fetchWithAuth(`/task-categories`, {
            method: "POST",
            body: JSON.stringify({ name: newCategoryName }),
        });
        setNewCategoryName("");

        fetchCategories();
        setSubmitLoading(false);
    };

    const handleDeleteCategory = async (cat: TaskCategory) => {
        if (!confirm(`Supprimer "${cat.name}" ?`)) return;
        setSubmitLoading(true);
        await fetchWithAuth(`/task-categories/${cat.id}`, {
            method: "DELETE",
        });
        fetchCategories();
        const Agronomie = categories.find((c) => c.name === "Agronomie");
        setSelectedCategory(Agronomie || null);
        setSubmitLoading(false);
    };

    const handleAddSubCategory = async () => {
        if (!selectedCategory) return alert("Sélectionnez une catégorie");
        if (!newSubCategoryName.trim()) return alert("Nom requis");
        setSubmitLoading(true);
        await fetchWithAuth(`/task-categories/${selectedCategory.id}/subcategories`, {
            method: "POST",
            body: JSON.stringify({ name: newSubCategoryName }),
        });
        setNewSubCategoryName("");
        fetchSubcategories(selectedCategory.id);
        setSubmitLoading(false);
    };

    const handleDeleteSubCategory = async (sub: TaskSubcategory) => {
        if (!selectedCategory) return;
        if (!confirm(`Supprimer "${sub.name}" ?`)) return;
        setSubmitLoading(true);
        await fetchWithAuth(`/task-categories/${selectedCategory.id}/subcategories/${sub.id}`, {
            method: "DELETE",
        });
        fetchSubcategories(selectedCategory.id);
        setSubmitLoading(false);
    };

    return (
        <article className="p-4 flex flex-col items-center">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setActiveTab("addCat")} className={`px-3 py-1 rounded ${activeTab === "addCat" ? "bg-green-700 text-white" : "bg-gray-200"} hover:cursor-pointer`}>Ajouter Catégorie</button>
                <button onClick={() => setActiveTab("delCat")} className={`px-3 py-1 rounded ${activeTab === "delCat" ? "bg-green-700 text-white" : "bg-gray-200"} hover:cursor-pointer`}>Supprimer Catégorie</button>
                <button onClick={() => setActiveTab("addSub")} className={`px-3 py-1 rounded ${activeTab === "addSub" ? "bg-green-700 text-white" : "bg-gray-200"} hover:cursor-pointer`}>Ajouter Sous-Catégorie</button>
                <button onClick={() => setActiveTab("delSub")} className={`px-3 py-1 rounded ${activeTab === "delSub" ? "bg-green-700 text-white" : "bg-gray-200"} hover:cursor-pointer`}>Supprimer Sous-Catégorie</button>
            </div>

            {/* Tab Contents */}
            <div className="border p-4 rounded bg-white w-[min(95%,_500px)] ">
                {mainLoading ? (
                    <p className="text-center text-gray-600">Chargement en cours… ⏳</p>
                ) :
                    (
                        <>
                            {activeTab === "addCat" && (
                                <div className="flex gap-2 items-center justify-center">
                                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nom catégorie" className="border p-1 rounded" />
                                    <button onClick={handleAddCategory} className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-400 hover:cursor-pointer">Ajouter</button>
                                </div>
                            )}

                            {activeTab === "delCat" && (
                                <div className="flex flex-col gap-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex justify-between items-center border p-1 rounded">
                                            <span>{cat.name}</span>
                                            <button onClick={() => handleDeleteCategory(cat)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-400 hover:cursor-pointer">Supprimer</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "addSub" && (
                                <div className="flex flex-col gap-2">
                                    <select className="border p-1 rounded" value={selectedCategory?.id || ""} onChange={(e) => setSelectedCategory(categories.find(c => c.id === Number(e.target.value)) || null)}>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <div className="flex gap-2 items-center mx-auto">
                                        <input type="text" value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} placeholder="Nom sous-catégorie" className="border p-1 rounded" />
                                        <button onClick={handleAddSubCategory} className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-400 hover:cursor-pointer">Ajouter</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "delSub" && (
                                <div className="flex flex-col gap-2">
                                    <select
                                        className="border p-1 rounded"
                                        value={selectedCategory?.id || ""}
                                        onChange={async (e) => {
                                            const cat = categories.find(c => c.id === Number(e.target.value)) || null;
                                            setSelectedCategory(cat);
                                            if (cat) await fetchSubcategories(cat.id); // 🔹 fetch subcategories immediately
                                        }}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>

                                    <div className="flex flex-col gap-1 mt-2">
                                        {subcategories.map(sub => (
                                            <div key={sub.id} className="flex justify-between items-center border p-1 rounded">
                                                <span>{sub.name}</span>
                                                <button
                                                    onClick={() => handleDeleteSubCategory(sub)}
                                                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-400 hover:cursor-pointer"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
            </div>
        </article>
    );
};

export default TaskCategoriesAdmin;
