
import type {GarbageData, GarbageType} from "../types.ts";
import * as React from "react";
import {GarbageUpcoming} from "./GarbageUpcoming.tsx";
import {GarbageIcon, GarbageTypeLabel} from "../utils/garbage.tsx";
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {monthlyPickups} from "../utils/dates.ts";

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
            return "to-garbage-kca hover:to-garbage-kca";
        case "kerstbomen":
            return "to-garbage-christmas hover:to-green-300";
        case "restafval":
            return "to-garbage-rest hover:to-gray-300";
        case "gft":
            return "to-garbage-gft hover:to-green-200";
        case "papier":
            return "to-garbage-paper hover:to-blue-300";
        case "plastic":
            return "to-garbage-plastic hover:to-green-300";
        case "glas":
            return "to-garbage-glass hover:to-purple-600";
        case "ander":
        default:
            return "to-garbage-other hover:to-blue-600";
    }
}

export const GarbageList: React.FC<GarbageListProps> = ({data}) => {
    const [hoveredPickup, setHoveredPickup] = React.useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0, width: 0, height: 0 });

    console.log(data);
    const sortedPickups = monthlyPickups(data.pickups);

    const handleMouseEnter = (pickupId: string, event: React.MouseEvent) => {
        const iconElement = event.currentTarget;
        const cardElement = iconElement.closest('.garbage-card');
        const containerRect = iconElement.closest('.garbage-list')?.getBoundingClientRect();

        if (containerRect && cardElement) {
            const cardRect = cardElement.getBoundingClientRect();
            setTooltipPosition({
                x: cardRect.left - containerRect.left,
                y: cardRect.top - containerRect.top + 30,
                width: cardRect.width,
                height: cardRect.height
            });
        }
        setHoveredPickup(pickupId);
    };

    const handleMouseLeave = () => {
        setHoveredPickup(null);
    };

    return (
        <div className="garbage-list flex flex-col max-w-4xl mx-auto 
        text-center rounded-xl bg-white shadow-lg p-8 dropshadow-2xl relative">
            <h2 className="text-xl text-red-500 font-bold mb-16">Afvalkalender</h2>

            <div className="calendar-upcoming mb-16 flex flex-col gap-4 ">
                <h2 className="text-xl text-red-500 font-bold mb-4">Komende week</h2>
                <GarbageUpcoming data={data}/>
            </div>

            <div className="calendar-container bg-red">
                <div className="calendar-months bg-green">
                    {sortedPickups.map((month) => (
                        <div key={month[0].date.getMonth()}>
                            <div className="calendar-month-header text-xl font-bold pt-16 pb-6 text-gradient capitalize">
                                {Months[month[0].date.getMonth()]}
                            </div>

                            <div className="calendar-grid grid grid-cols-4 gap-4">
                                {month.map((pickup) => (
                                    <div
                                        className={`garbage-card rounded-xl drop-shadow-2xl p-6 cursor-pointer relative
                                        transition-colors ease-in-out duration-300 
                                        bg-gradient-to-br from-gray-50 ${GarbageTypeColor(pickup.type)}`}
                                        key={pickup.id}>
                                        <div className="card-container flex flex-row justify-around items-center">
                                            <div className="icon">{GarbageIcon(pickup.type)}</div>
                                            <div>
                                                <div className="day font-bold">{GarbageDay(pickup.date)}</div>
                                                <div className="date">{GarbageDate(pickup.date)}</div>
                                                <div className="type">{GarbageTypeLabel(pickup.type)}</div>
                                                <div className="description">{pickup.description}</div>
                                            </div>

                                            <div className="more-info absolute top-2 right-2 cursor-pointer"
                                                 onMouseEnter={(e) => handleMouseEnter(pickup.id, e)}
                                                 onMouseLeave={handleMouseLeave}>
                                                <FontAwesomeIcon icon={faQuestionCircle}
                                                               className="text-gray-500 hover:text-gray-700"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {hoveredPickup && (
                <div
                    className="absolute bg-white text-sm rounded-xl shadow-lg p-6 pointer-events-none z-10
                               flex items-center justify-center transition-opacity ease-in-out duration-300"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        width: tooltipPosition.width,
                        minHeight: tooltipPosition.height / 2, // Make it half height or adjust as needed
                    }}>
                    {sortedPickups.flat().find(p => p.id === hoveredPickup)?.placement}
                </div>
            )}
        </div>
    );
}