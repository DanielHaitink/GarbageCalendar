import type {GarbageData} from "../types.ts";
import * as React from "react";

interface GarbageListProps {
    data: GarbageData;
}

export const GarbageList: React.FC<GarbageListProps> = ({ data }) => {
    console.log(data);
    const sortedPickups = data.pickups.sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
            <div className="garbage-list">
                <h2>Afvalkalender</h2>
                <ul>
                    {sortedPickups.map((pickup) => (
                        <li key={pickup.id}>
                            <div className="date">{pickup.dateString}</div>
                            <div className="type">{pickup.type}</div>
                            <div className="description">{pickup.description}</div>
                        </li>
                    ))}
                </ul>
            </div>
    );
}