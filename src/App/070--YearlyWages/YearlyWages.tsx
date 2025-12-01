import { Link } from 'react-router-dom'
import { ChevronRightIcon } from "@heroicons/react/24/solid";

const YearlyWages = () => {
    return (
        <article className='w-full flex flex-col items-center mt-[9rem] md:text-[1.5em]'>
            <div className='flex flex-col items-center w-[min(85%,_400px)] md:w-[600px] gap-[1.7rem] '>
                <h2 className='text-[2.2em] font-extrabold text-center'>Gestion des salaires annuels</h2>
                <Link to="/entree-salaires-annee-complete" className='flex flex-col items-center gap-[0.8rem]'>
                    <h3 className='text-center font-bold text-[1.4em] text-green-700'>Entrée d'un salaire pour l'année complète</h3>
                    <button className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.4em]
                                font-bold
                                touch-manipulation
                                flex flex-row items-center justify-center
                                ltr  w-fit' ><ChevronRightIcon className='w-5 h-5 md:w-7 md:h-7' />
                        <ChevronRightIcon className='w-5 h-5 md:w-7 md:h-7' />
                        <ChevronRightIcon className='w-5 h-5 md:w-7 md:h-7' />
                    </button>
                </Link>
                <Link to="/modifier-salaires-annuels" className='flex flex-col items-center gap-[0.8rem]'>
                    <h3 className='text-center font-bold text-[1.4em] text-green-700'>Entrée d'un salaire pour l'année partielle ou modification pour l'année en cours</h3>
                    <button className='bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.4em]
                                font-bold
                                touch-manipulation
                                flex flex-row items-center justify-center
                                ltr  w-fit' ><ChevronRightIcon className='w-5 h-5 md:w-7 md:h-7' />
                        <ChevronRightIcon className='w-5 h-5 md:w-7 md:h-7' />
                        <ChevronRightIcon className='w-5 h-5 md:w-7 md:h-7' />
                    </button>
                </Link>
            </div>
        </article>
    )
}

export default YearlyWages
