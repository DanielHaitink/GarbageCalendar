import * as React from "react";
import type {GarbageData, GarbagePickup} from "../types.ts";
import {getDayText, getMonthText, monthlyPickups} from "../utils/dates.ts";
import {GarbageIcon, GarbageTypeLabel} from "../utils/garbage.tsx";
import {GarbageUpcoming} from "./GarbageUpcoming.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPrint} from "@fortawesome/free-solid-svg-icons";

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

    const print = () => {
        window.print();
    }

    return (
        <div
            className="calendar-container flex flex-col max-w-4xl mx-auto  rounded-xl bg-white shadow-lg p-8 dropshadow-2xl
                print:w-full print:h-full print:rounded-none print:shadow-none print:p-0">
            <button onClick={print} className={"fixed right-50 bottom-10 w-16 h-16 bg-groningen rounded-4xl drop-shadow-xl shadow-md z-50 hover:bg-red-500 print:hidden"}>
                <FontAwesomeIcon icon={faPrint} color={"#f1f1f1"}></FontAwesomeIcon>
            </button>

            <h1 className="text-xl font-bold mb-16 text-center print:mb-2 print:font-normal print:text-lg">
                {data.rawAddress.street} {data.rawAddress.housenumber}{data.rawAddress.addition}, {data.rawAddress.city}
            </h1>

            {Object.keys(uniquePickup).length === 0 ? (
                <p className="text-gray-500 italic text-center">Geen inlever informatie gevonden voor dit adres</p>
            ) : (

                <div>

                    <div className={"calendar-upcoming mb-16 print:hidden"}>
                        <h2 className={"bg-groningen text-white text-xl font-bold capitalize p-2 mb-2"}>
                            Komende week
                        </h2>
                        <GarbageUpcoming data={data}/>
                    </div>

                    <div className="grid grid-cols-2 gap-4 print:grid-cols-3 print:gap-2">
                        {
                            months.map((month, index) => (
                                <div key={index} className={"calendar-month break-inside-avoid"}>
                                    <h2 className="bg-groningen text-white font-bold capitalize p-2 mb-2 print:p-0 print:pl-1 print:mb-1 print:text-sm">{getMonthText(index)}</h2>
                                    {month.map((pickup: GarbagePickup) => (
                                        <div key={pickup.id}
                                             className="calendar-day grid grid-cols-5 relative group print:text-sm">
                                            <div>{pickup.date.getDate()}</div>
                                            <div className={"col-span-2"}>{getDayText(pickup.date)}</div>
                                            {/*<div className={"hidden print:block"}></div>*/}
                                            <div
                                                className={"capitalize col-span-2"}><span className={""}>{GarbageIcon(pickup.type)} </span>{GarbageTypeLabel(pickup.type)} </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        }
                    </div>

                    <div className={"calendar-placement mt-16 print:mt-4 break-inside-avoid"}>
                        <h2 className={"text-xl font-bold mb-4 print:text-lg print:font-bold print:mb-2"}>
                            Inleverinformatie
                        </h2>
                        {
                            Object.keys(uniquePickup).map((key) => (
                                <div key={key} className="calendar-day grid grid-cols-3 relative group print:text-sm ">
                                    <h3>
                                        {GarbageTypeLabel(key)}
                                    </h3>
                                    <p className={"col-span-2"}>
                                        {uniquePickup[key]}
                                    </p>
                                </div>
                            ))
                        }

                    </div>
                </div>
            )}
        </div>
    );
}