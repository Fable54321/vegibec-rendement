import { useState } from "react";


import SecondStep from "./015--SecondStep/SecondStep";
import FirstStep from "./011--firstStep/FirstStep";
import { Link } from "react-router-dom";





const TaskCostsInput = () => {


    const [task, setTask] = useState({
        Entretien: false,
        Entrepôt: false,
        Agronomie: false,
        Pompage: false,
        Autre: false,

    })

    const vegetables = [
        "Céleri",
        "Chou",
        "Chou de Bruxelles",
        "Chou-fleur",
        "Coeur de romaine",
        "Endives",
        "Laitue",
        "Laitue frisée",
        "Laitue pommée",
        "Laitue romaine",
        "Poivron",
        "Zucchini"
    ];


    const [subCategories, setSubcategories] = useState<string[]>([]);
    const [subCategory, setSubCategory] = useState('');
    const [cultureDefined, setCultureDefined] = useState(false);
    const [selectedVeggie, setSelectedVeggie] = useState(vegetables[0]);
    const [supervisor, setSupervisor] = useState("");


    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());


    const [numberOfWages, setNumberOfWages] = useState(1);
    const [wages, setWages] = useState(new Array(numberOfWages).fill(0));

    const [multiplier, setMultiplier] = useState(new Array(numberOfWages).fill(1));
    const [hoursInput, setHoursInput] = useState<string>("");





    //dont forget to change to false **************************
    const [isFirstStepCompleted, setIsFirstStepCompleted] = useState(false);



    return (
        <>
            <h1 className="text-[2.2rem] text-center mt-[2rem] lg:mt-[4.5rem] ">
                Enregistrement des tâches effectuées
            </h1>

            <div className="flex flex-col items-center w-full">
                <Link className="button-generic mt-[1.2rem]" to="/">Accueil</Link>
                <Link to="/couts-des-taches" className="lg:text-[1.2rem] lg:mt-[0.9rem] text-green-700 underline block text-center mt-[0.5rem] mb-[-1rem] w-[50%] font-bold text-[1.1rem]">
                    Voir les rapports de coûts des tâches
                </Link>
            </div>
            <article className="flex flex-col items-center w-full lg:mt-[1.5rem] lg:text-[1.2rem]" >
                {!isFirstStepCompleted && (
                    <FirstStep
                        task={task}
                        setTask={setTask}
                        subCategories={subCategories}
                        setSubcategories={setSubcategories}
                        subCategory={subCategory}
                        setSubCategory={setSubCategory}
                        cultureDefined={cultureDefined}
                        setCultureDefined={setCultureDefined}
                        selectedVeggie={selectedVeggie}
                        setSelectedVeggie={setSelectedVeggie}
                        vegetables={vegetables}
                        isFirstStepCompleted={isFirstStepCompleted}
                        setIsFirstStepCompleted={setIsFirstStepCompleted}
                        supervisor={supervisor}
                        setSupervisor={setSupervisor}
                    />
                )}

                {isFirstStepCompleted && (
                    <SecondStep
                        numberOfWages={numberOfWages}
                        setNumberOfWages={setNumberOfWages}
                        wages={wages}
                        setWages={setWages}
                        multiplier={multiplier}
                        setMultiplier={setMultiplier}
                        hoursInput={hoursInput}
                        setHoursInput={setHoursInput}
                        isFirstStepCompleted={isFirstStepCompleted}
                        setIsFirstStepCompleted={setIsFirstStepCompleted}
                        task={task}
                        subCategory={subCategory}
                        selectedVeggie={selectedVeggie}
                        cultureDefined={cultureDefined}
                        supervisor={supervisor}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                )}
            </article>
        </>
    );
};

export default TaskCostsInput;