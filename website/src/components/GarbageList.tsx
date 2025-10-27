import type {GarbageData, GarbageType} from "../types.ts";
import * as React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faTrashAlt,
    faTree,
    faLeaf,
    faNewspaper,
    faSheetPlastic,
    faGlasses,
    faBattery,
    faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";

interface GarbageListProps {
    data: GarbageData;
}

const Months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

const GarbageTypeIcon = (type: GarbageType) => {
    switch (type) {
        case "kca":
            return <FontAwesomeIcon icon={faBattery}/>;
        case "kerstbomen":
            return <FontAwesomeIcon icon={faTree}/>
        case "ander":
            return <FontAwesomeIcon icon={faTrashAlt}/>;
        case "restafval":
            return <FontAwesomeIcon icon={faTrashAlt}/>;
        case "gft":
            return <FontAwesomeIcon icon={faLeaf}/>;
        case "papier":
            return <FontAwesomeIcon icon={faNewspaper}/>;
        case "plastic":
            return <FontAwesomeIcon icon={faSheetPlastic}/>;
        case "glas":
            return <FontAwesomeIcon icon={faGlasses}/>;
        default:
            return <FontAwesomeIcon icon={faTrashAlt}/>;
    }
}

const GarbageDate = (date: Date) => {
    return date.getDay().toFixed(0) + " " + Months[date.getMonth()] + " " + date.getFullYear();
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

const GarbageTypeLabel = (type: GarbageType) => {
    switch (type) {
        case "gft":
            return "GFT";
        case "papier":
            return "Papier";
        case "plastic":
            return "Plastic";
        case "glas":
            return "Glas";
        case "kca":
            return "KCA";
        case "kerstbomen":
            return "Kerstbomen";
        case "ander":
            return "Ander";
        case "restafval":
            return "Restafval";
    }
}

export const GarbageList: React.FC<GarbageListProps> = ({data}) => {
    console.log(data);
    const sortedPickups = data.pickups.sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
        <div className="garbage-list  flex flex-col max-w-4xl mx-auto animate-fade-in-up
        text-center rounded-xl bg-white shadow-lg p-8 dropshadow-2xl">
            <h2 className="text-xl text-red-500 font-bold mb-16">Afvalkalender</h2>
            <div className={"flex flex-wrap justify-center gap-4"}>
                {sortedPickups.map((pickup) => (
                    <div
                        className={`rounded-xl w-1/4 min-w-36 drop-shadow-2xl p-8 cursor-pointer
                        transition-colors ease-in-out duration-300 
                        bg-gradient-to-br from-gray-50 ${GarbageTypeColor(pickup.type)}`}
                        key={pickup.id}>
                        <div className="card-container flex flex-row gap-8 justify-between items-center">
                            <div className="icon">{GarbageTypeIcon(pickup.type)}</div>
                            <div>
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

                            <div className="placement-info invisible opacity-0 group-[a]-hover:visible absolute text-xs top-12 left-2 right-2 text-center bg-white p-2 rounded-md shadow-md border z-10">
                                {pickup.placement}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}