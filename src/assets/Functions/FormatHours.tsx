type FormatHoursProps = {
    hours: number;
    className?: string;
    hourClassName?: string;
    minuteClassName?: string;
    unitClassName?: string;
};

const FormatHours = ({
    hours,

}: FormatHoursProps) => {
    if (isNaN(hours)) return <span >—</span>;

    // convert fractional hours to minutes
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    // format the hour and minute numbers using fr-CA locale (non-breaking spaces for thousands)
    const formattedHours = h.toLocaleString("fr-CA");
    const formattedMinutes = String(m).padStart(2, "0");

    const nbsp = "\u00A0"; // non-breaking space between number and letter

    return (
        <span >
            <span >{formattedHours}</span>
            <span className="text-[0.8rem]">h</span>
            {nbsp}
            <span >{formattedMinutes}</span>
            <span className="text-[0.8rem]" >m</span>
        </span>
    );
};

export default FormatHours;
