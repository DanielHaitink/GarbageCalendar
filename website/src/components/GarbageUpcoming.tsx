import * as React from "react";
import type {GarbageData, GarbagePickup} from "../types.ts";
import {getDaysUntil, sortPickups} from "../utils/dates.ts";
import {GarbageIcon} from "../utils/garbage.tsx";

interface GarbageUpcomingProps {
    data: GarbageData;
}

const filteredPickups = (pickups: GarbagePickup[]) => {
    return sortPickups(pickups).filter(
        (pickup: GarbagePickup) => {
            const daysUntil = getDaysUntil(pickup.date);

            return !(daysUntil > 7 || daysUntil < 0);
        }
    )
}

const getDaysUntilName = (date: Date) => {
    const daysUntil = getDaysUntil(date);

    switch (daysUntil) {
        case 0: return "Vandaag";
        case 1: return "Morgen";
        case 2: return "Overmorgen";
        default: return `In ${daysUntil} dagen`;
    }
}

export const GarbageUpcoming: React.FC<GarbageUpcomingProps> = ({data}) => {

    return (
        <div className={""}>
            {filteredPickups(data.pickups).map( (value) => {
            return (
                <div key={value.id} className="calendar-day grid grid-cols-4">
                    <div>{getDaysUntilName(value.date)}</div>
                    <div className={"capitalize"}>{GarbageIcon(value.type)} {value.type}</div>
                    <div className={"col-span-2"}>{value.placement}</div>
                </div>
            )
        })}
        </div>
    )

}