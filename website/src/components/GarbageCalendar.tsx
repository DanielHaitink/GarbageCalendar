import * as React from "react";
import type {GarbageData, GarbagePickup} from "../types.ts";
import {getDayText, getMonthText, sortPickups} from "../utils/dates.ts";


interface GarbageCalendarProps {
    data: GarbageData;
}

export const GarbageCalendar: React.FC<GarbageCalendarProps> = ({data}) => {
    const months: GarbagePickup[][] = new Array(12);

    for (const pickup of sortPickups(data.pickups)) {
        if (!months[pickup.date.getMonth()]) {
            months[pickup.date.getMonth()] = [];
        }

        months[pickup.date.getMonth()].push(pickup);
    }

    return (
        <div className="calendar-container flex flex-col max-w-4xl mx-auto animate-fade-in-up rounded-xl bg-white shadow-lg p-8 dropshadow-2xl">
            <h1>Garbage Calendar</h1>

            <div className="grid grid-cols-2 gap-4">
            {
                months.map((month, index) => (
                    <div key={index}>
                        <h2 className="bg-red-500 text-white font-bold capitalize p-2 mb-2">{getMonthText(index)}</h2>
                        {month.map((pickup: GarbagePickup) => (
                            <div key={pickup.id} className="calendar-day grid grid-cols-3">
                                <div>{getDayText(pickup.date)}</div>
                                <div>{pickup.date.getDate()}</div>
                                <div>{pickup.type}</div>
                            </div>
                        ))}
                    </div>
                ))
            }
            </div>

        </div>
    );
}