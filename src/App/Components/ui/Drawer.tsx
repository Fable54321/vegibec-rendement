import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
};


const Drawer = ({ open, onClose, title, children }: DrawerProps) => {

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            {/* BACKDROP */}
            <div
                className={`
          fixed inset-0 bg-black/40 z-40 transition-opacity
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
                onClick={onClose}
            />

            {/* PANEL */}
            <div
                className={`
          fixed top-0 right-0 h-full w-[min(90%,_640px)] bg-white z-50
          shadow-xl transform transition-transform duration-200
          overflow-y-auto
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {title || "Ajouter une culture"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 rounded p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Drawer;
