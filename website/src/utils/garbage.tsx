import type {GarbageType} from "../types.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faTrashAlt,
    faTree,
    faLeaf,
    faNewspaper,
    faSheetPlastic,
    faGlasses,
    faBattery
} from "@fortawesome/free-solid-svg-icons";

export const GarbageIcon = (garbageType: GarbageType) => {
    switch (garbageType) {
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

export const GarbageTypeLabel = (type: GarbageType | string) => {
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
            return "Kerstboom";
        case "ander":
            return "Ander";
        case "restafval":
            return "Restafval";
    }
}