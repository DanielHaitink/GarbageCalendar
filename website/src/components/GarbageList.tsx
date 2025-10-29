import type {GarbageData, GarbageType} from "../types.ts";
import * as React from "react";
import {GarbageUpcoming} from "./GarbageUpcoming.tsx";
import {GarbageIcon, GarbageTypeLabel} from "../utils/garbage.tsx";
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface GarbageListProps {
    data: GarbageData;
}

const Months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const Days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

const GarbageDate = (date: Date) => {
    return date.getDate().toFixed(0) + " " + Months[date.getMonth()];
}

const GarbageDay = (date: Date) => {
    return Days[date.getUTCDay()];
}

const GarbageTypeColor = (type: GarbageType) => {
    switch (type) {
        case "kca":
            return "to-yellow-100 hover:to-yellow-200";
        case "kerstbomen":
            return "to-green-200 hover:to-green-300";
        case "ander":
            return "to-red-200 hover:to-red-300";
        case "restafval":
            return "to-gray-200 hover:to-gray-300";
        case "gft":
            return "to-green-100 hover:to-green-200";
        case "papier":
            return "to-blue-200 hover:to-blue-300";
        case "plastic":
            return "to-green-200 hover:to-green-300";
        case "glas":
            return "to-purple-500 hover:to-purple-600";
        default:
            return "to-blue-500 hover:to-blue-600";
    }
}

export const GarbageList: React.FC<GarbageListProps> = ({data}) => {
    console.log(data);
    const sortedPickups = data.pickups.sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
        <div className="garbage-list flex flex-col max-w-4xl mx-auto animate-fade-in-up
        text-center rounded-xl bg-white shadow-lg p-8 dropshadow-2xl">
            <h2 className="text-xl text-red-500 font-bold mb-16">Afvalkalender</h2>

            <div className="calendar-upcoming mb-16 flex flex-col gap-4 ">
                <h2 className="text-xl text-red-500 font-bold mb-4">Komende week</h2>
                <GarbageUpcoming data={data}/>
            </div>

            <div className="calendar-container flex flex-col">
                <h2 className="text-xl text-red-500 font-bold mb-4">Kalender</h2>
                <div className={"grid grid-cols-3 justify-center gap-4"}>
                    {sortedPickups.map((pickup) => (
                        <div
                            className={`rounded-xl min-w-36 drop-shadow-2xl p-8 cursor-pointer
                        transition-colors ease-in-out duration-300 
                        bg-gradient-to-br from-gray-50 ${GarbageTypeColor(pickup.type)}`}
                            key={pickup.id}>
                            <div className="card-container flex flex-col gap-8 justify-between items-center">
                                <div className="icon">{GarbageIcon(pickup.type)}</div>
                                <div>
                                    <div className="day font-bold">{GarbageDay(pickup.date)}</div>
                                    <div className="date">{GarbageDate(pickup.date)}</div>
                                    <div className="type">{GarbageTypeLabel(pickup.type)}</div>
                                    <div className="description">{pickup.description}</div>
                                </div>

                                <div className="more-info absolute top-0 right-0 cursor-pointer group min-w-full">
                                    <FontAwesomeIcon icon={faQuestionCircle}
                                                     className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"/>
                                    <div
                                        className="placement-info absolute invisible transition-opacity ease-in-out duration-300
                                      bg-white opacity-0 group-hover:visible group-hover:opacity-100
                                    top-10 text-center rounded-md shadow-md p-5 z-50 min-w-full">
                                        {pickup.placement}
                                    </div>
                                </div>

                                <div
                                    className="placement-info invisible opacity-0 group-[a]-hover:visible absolute text-xs top-12 left-2 right-2 text-center bg-white p-2 rounded-md shadow-md border z-10">
                                    {pickup.placement}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}