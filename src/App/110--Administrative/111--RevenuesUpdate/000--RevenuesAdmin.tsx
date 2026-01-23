import { useState } from "react";
import RevenuesUpdate from "./RevenuesUpdate";
import RevenuesEdit from "./RevenuesEdit";

const RevenuesAdmin = () => {
    const [activeTab, setActiveTab] = useState<"add" | "edit">("add");

    return (
        <article className="w-full flex flex-col items-center pb-[2rem]">
            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b">
                <button
                    onClick={() => setActiveTab("add")}
                    className={`pb-2 font-semibold ${activeTab === "add"
                        ? "border-b-2 border-green-700 text-green-700"
                        : "text-gray-500"
                        }`}
                >
                    Ajouter les revenus
                </button>

                <button
                    onClick={() => setActiveTab("edit")}
                    className={`pb-2 font-semibold ${activeTab === "edit"
                        ? "border-b-2 border-green-700 text-green-700"
                        : "text-gray-500"
                        }`}
                >
                    Modifier les revenus
                </button>
            </div>

            {/* Content */}
            {activeTab === "add" && <RevenuesUpdate />}
            {activeTab === "edit" && <RevenuesEdit />}
        </article>
    );
};


export default RevenuesAdmin;