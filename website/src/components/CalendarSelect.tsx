import * as React from "react";

type CalendarType = 'Groningen' | 'Modern';

// const CalendarTypes = {
//     GRONINGEN: 'Groningen' as const,
//     MODERN: 'Modern' as const
// };

interface CalendarOption {
    value: CalendarType;
    label: string;
    selected?: boolean;
}

interface CalendarSelectProps {
    options: CalendarOption[];
    onChange?: (value: CalendarType) => void;
}

export const CalendarSelect: React.FC<CalendarSelectProps> = () => {
    // const [selected, setSelected] = React.useState<CalendarType>(CalendarTypes.GRONINGEN);
    // const [options, setOptions] = React.useState<CalendarType[]>([CalendarTypes.GRONINGEN, CalendarTypes.MODERN]);
    //
    //
    // return (
    //     <div className="calendar-select justify-self-center flex flex-row gap-4 rounded-xl p-4 bg-white shadow-lg">
    //         {options.map( (value) => {
    //             return (
    //                 <div className="calendar-select-item cursor-pointer rounded-xl p-4
    //                 bg-gray-100 hover:bg-gray-200 transition-colors ease-in-out duration-300
    //                 {}" onClick={setSelected.bind(null, value)}>
    //                     <div>
    //                         {value.toUpperCase()}
    //                     </div>
    //                 </div>
    //             )
    //         })}
    //     </div>
    // )

    return null;
}