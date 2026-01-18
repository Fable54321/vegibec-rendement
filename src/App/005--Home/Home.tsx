import { Link, useNavigate } from 'react-router-dom'
import vegibec from '../../assets/vegibec.png'
import { useAuth } from '../../context/AuthContext';
import Login from '@/components/login';

const Home = () => {

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    if (!user) {
        return <Login />
    }

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const handleLogout = async () => {

        const confirmed = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
        if (!confirmed) return;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            console.log(data.message);

            logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <main className="relative flex flex-col items-center w-full md:text-[1.2em] pb-[0.5rem]">
            <div className='flex flex-col lg:flex-row lg:w-full lg:justify-between lg:px-[1rem] w-fit gap-[0.5rem] mt-[0.75rem]'>
                <Link to="change-password" className='text-[0.7rem]  md:text-[0.8rem] button-generic'>Changer mot de passe</Link>
                <Link to="gestion-administrative" className='text-[0.7rem]  md:text-[0.8rem] button-generic'>Gestion Administrative +</Link>
                <button onClick={handleLogout} className='text-[0.7rem]  md:text-[0.8rem] button-generic'>Se déconnecter</button>
            </div>
            <section className="flex flex-col items-center w-full mt-[0.75rem] text-[1.9em] gap-[1rem] md:gap-[1.2rem] font-bold text-center">
                <h1>Outil de rendement comparatif</h1>
                <img src={vegibec} alt="le logo de Vegibec" className='w-[min(80%,_370px)]' />
            </section>
            {/* *****Peut-être ajouter tendance générale acutelle vegibec vs usda******* */}

            <section className='flex flex-col items-center w-full mt-[2rem] gap-[2rem] md:gap-[2rem]'>
                <div className='flex flex-col items-center w-[min(85%,_400px)] md:w-[650px] gap-[0.75rem] md:gap-[1rem] '>
                    <h2 className='text-[1.7em] font-extrabold text-center'>Nouvelle entrée</h2>
                    <Link to="entrer-couts-des-taches" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Entrée des tâches</Link>
                    <Link to="/entrer-salaires-annuels" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Entrée des salaires annuels</Link>
                    <Link to="/entrer-autres-couts" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Entrée des autres coûts</Link>
                    <Link to="/entrer-unites-vendues" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Entrée des unités vendues (ventes)</Link>

                </div>
                <div className='flex flex-col items-center w-[min(85%,_400px)] md:w-[650px] gap-[0.75rem] lg:gap-[1rem] '>
                    <h2 className='text-[1.7em] font-extrabold text-center'>Visualisation des coûts et revenus</h2>
                    <Link to="/comparatif-usda" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full'>Comparatif USDA</Link>
                    <Link to="/couts" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full'>Coûts</Link>
                    <Link to="/revenus" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full'>Revenus</Link>
                    <Link to="/journal-des-entrees" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.2em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Journal des entrées (correction)</Link>
                </div>
            </section>
        </main>
    )
}

export default Home
