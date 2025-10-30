import * as React from "react";
import type {GarbageData, GarbagePickup} from "../types.ts";
import {getDayText, getMonthText, monthlyPickups} from "../utils/dates.ts";
import {GarbageIcon} from "../utils/garbage.tsx";


interface GarbageCalendarProps {
    data: GarbageData;
}

export const GarbageCalendar: React.FC<GarbageCalendarProps> = ({data}) => {
    const months = monthlyPickups(data.pickups);

    const uniquePickup: { [key: string]: string } = {};

    for (const pickup of data.pickups) {
        if (Object.keys(uniquePickup).includes(pickup.type)) {
            if (uniquePickup[pickup.type] === pickup.placement) {
                continue;
            } else {
                console.log(uniquePickup[pickup.type] + " " + pickup.placement);
            }
        }

        uniquePickup[pickup.type] = pickup.placement;
    }

    return (
        <div className="calendar-container flex flex-col max-w-4xl mx-auto animate-fade-in-up rounded-xl bg-white shadow-lg p-8 dropshadow-2xl">
            {/*<h1>Garbage Calendar</h1>*/}

            <div className="grid grid-cols-2 gap-4">
            {
                months.map((month, index) => (
                    <div key={index} className={"calendar-month"}>
                        <h2 className="bg-groningen text-white font-bold capitalize p-2 mb-2">{getMonthText(index)}</h2>
                        {month.map((pickup: GarbagePickup) => (
                            <div key={pickup.id} className="calendar-day grid grid-cols-3 relative group cursor-pointer ">
                                <div>{getDayText(pickup.date)}</div>
                                <div>{pickup.date.getDate()}</div>
                                <div className={"capitalize"}>{GarbageIcon(pickup.type)} {pickup.type} </div>
                            </div>
                        ))}
                    </div>
                ))
            }
            </div>

            <div className={"calendar-placement mt-16"}>
                <h2 className={"text-xl font-bold mb-4"}>
                    Inleverinformatie
                </h2>
            {
                Object.keys(uniquePickup).map(key => (
                    <div className="calendar-day grid grid-cols-3 relative group cursor-pointer ">
                        <h3>
                            {key}
                        </h3>
                        <p className={"col-span-2"}>
                            {uniquePickup[key]}
                        </p>
                    </div>
                ))
            }

            </div>

        </div>
    );
}