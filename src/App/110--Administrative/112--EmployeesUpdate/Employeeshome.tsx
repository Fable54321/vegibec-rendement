import { useEmployees } from "@/context/employees/EmployeesContext";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import AddSalaried from "./000--AddSalaried/AddSalaried";
import DeleteSalaried from "./100--DeleteSalaried/DeleteSalaried";
import AddSupervisor from "./200--AddSupervisor/AddSupervisor";
import DeleteSupervisor from "./300--DeleteSupervisor/DeleteSupervisor";


const Employeeshome = () => {

    const { employees } = useEmployees();
    const { supervisors } = useSupervisors();

    const [selectedTab, setSelectedTab] = useState(1);





    return (
        <article className="flex flex-col items-center  mx-auto">

            <Link to="/" className="button-generic mt-[2rem] text-[1em]">
                Accueil
            </Link>
            <div className="mt-[1rem] flex gap-[0.8rem]">
                <button
                    type="button"
                    onClick={() => setSelectedTab(1)}
                    className={`px-3 py-1 rounded border hover:cursor-pointer
      ${selectedTab === 1
                            ? "bg-green-700 text-white border-green-700"
                            : "bg-white text-green-700 border-green-700 hover:bg-green-50"}
    `}
                >
                    Ajouter Salarié
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedTab(2)}
                    className={`px-3 py-1 rounded border hover:cursor-pointer
      ${selectedTab === 2
                            ? "bg-red-700 text-white border-red-700"
                            : "bg-white text-red-700 border-red-700 hover:bg-red-50"}
    `}
                >
                    Supprimer Salarié
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab(3)}
                    className={`px-3 py-1 rounded border hover:cursor-pointer
    ${selectedTab === 3
                            ? "bg-green-700 text-white border-green-700"
                            : "bg-white text-green-700 border-green-700 hover:bg-green-50"}
  `}
                >
                    Ajouter Superviseur

                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab(4)}
                    className={`px-3 py-1 rounded border hover:cursor-pointer
    ${selectedTab === 4
                            ? "bg-red-700 text-white border-red-700"
                            : "bg-white text-red-700 border-red-700 hover:bg-red-50"}
  `}
                >
                    Supprimer Superviseur

                </button>
            </div>

            {selectedTab === 1 && <AddSalaried employees={employees} />}
            {selectedTab === 2 && <DeleteSalaried employees={employees} />}
            {selectedTab === 3 && <AddSupervisor supervisors={supervisors} />}
            {selectedTab === 4 && <DeleteSupervisor supervisors={supervisors} />}

        </article>
    )
}

export default Employeeshome
