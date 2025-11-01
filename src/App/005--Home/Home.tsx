import { Link } from 'react-router-dom'
import vegibec from '../../assets/vegibec.png'
import { useAuth } from '../../context/AuthContext';
import Login from '@/components/login';

const Home = () => {

    const { user } = useAuth();

    if (!user) {
        return <Login />
    }

    return (
        <main className="flex flex-col item-center w-full md:text-[1.5em]">
            <section className="flex flex-col items-center w-full mt-[2rem] text-[1.9em] gap-[1rem] md:gap-[1.5rem] font-bold text-center">
                <h1>Outil de rendement comparatif</h1>
                <img src={vegibec} alt="le logo de Vegibec" className='w-[min(80%,_400px)]' />
            </section>
            {/* *****Peut-être ajouter tendance générale acutelle vegibec vs usda******* */}

            <section className='flex flex-col items-center w-full mt-[2.5rem] gap-[2.5rem] md:gap-[3.5rem]'>
                <div className='flex flex-col items-center w-[min(85%,_400px)] md:w-[650px] gap-[0.75rem] '>
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
                                ltr  w-full' >Entrer une nouvelle tâche</Link>
                </div>
                <div className='flex flex-col items-center w-[min(85%,_400px)] md:w-[650px] gap-[0.75rem] lg:gap-[1.5rem] '>
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
                </div>
            </section>
        </main>
    )
}

export default Home
