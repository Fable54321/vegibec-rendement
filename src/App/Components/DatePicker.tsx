import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaHandPointer } from "react-icons/fa";

type DatePickerProps = {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    label?: string;
};

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, label }) => {
    return (
        <div className=" task-date-picker flex flex-col items-center w-full mt-[0.5rem]">
            {label && <label>{label}</label>}
            <div className="flex relative mt-[0.25rem]">
                <ReactDatePicker
                    selected={selectedDate}
                    onChange={onChange}
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()} // optional: prevent future dates
                    placeholderText="Sélectionner une date"
                    className="datepicker-input border rounded border-green-400 p-1 pl-2 text-[0.8rem] text-left w-[70%]"
                />
                <FaHandPointer size={10} color="#4b7312" className="absolute right-[2rem] top-[0.5rem]" />
            </div>
        </div>
    );
};

export default DatePicker;