import { Link } from "react-router-dom"


const Administrative = () => {



    return (
        <article className="flex flex-col items-center">
            <h2 className="text-[2.2rem] md:text-[2.5rem] font-bold text-center mt-[2rem] lg:mt-[6.5rem]">Gestion Administrative</h2>
            <Link className="button-generic mt-[0.8rem] text-[1.2em]" to="/">
                Accueil
            </Link>
            <div className='flex flex-col items-center w-[min(85%,_400px)] md:w-[650px] max-xs:w-[92%] gap-[0.75rem] md:gap-[1.5rem] mt-[2rem] md:mt-[4rem]'>
                <Link to="/gestion-administrative/mise-a-jour-revenus" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                md:py-[0.33rem]
                                text-center select-none
                                text-[1.2em]
                                md:text-[1.6em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Mise à jour des revenus</Link>
                <Link to="/gestion-administrative/employes" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                md:py-[0.33rem]
                                text-center select-none
                                text-[1.2em]
                                md:text-[1.6em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Modifier salariés / superviseurs</Link>
                <Link to="/gestion-administrative/cultures" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                md:py-[0.33rem]
                                text-center select-none
                                text-[1.2em]
                                md:text-[1.6em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Modifier Cultures / Champs</Link>
                <Link to="/gestion-administrative/taches" className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                md:py-[0.33rem]
                                text-center select-none
                                text-[1.2em]
                                md:text-[1.6em]
                                font-bold
                                touch-manipulation
                                ltr  w-full' >Modifier tâches</Link>

            </div>
        </article>
    )
}

export default Administrative
