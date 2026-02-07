import CulturesUpdate from "@/App/110--Administrative/113--CulturesUpdate/CulturesUpdate";
import Drawer from "./ui/Drawer";
import { useVegetables } from "@/context/vegetables/VegetablesContext";

type Props = {
    open: boolean;
    onClose: () => void;
};

export const AddCultureDrawer = ({ open, onClose }: Props) => {
    const { refreshVegetables } = useVegetables();

    const handleClose = async () => {
        await refreshVegetables();
        onClose();
    };

    return (
        <Drawer open={open} onClose={handleClose} title="Ajouter une culture">
            <CulturesUpdate embedded onClose={handleClose} />
        </Drawer>
    );
};
