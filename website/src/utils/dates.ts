import type {GarbagePickup} from "../types.ts";

const Months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const Days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

export const getDateText = (date: Date) => {
    return date.getDate().toFixed(0) + " " + Months[date.getMonth()] + " " + date.getFullYear();
}

export const getMonthText = (month: number) => {
    return Months[month];
}

export const getDayText = (date: Date) => {
    return Days[date.getUTCDay()];
}

export const getDayAndDateText = (date: Date) => {
    return getDayText(date) + " " + getDateText(date);
}

export const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

export const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear();
}

export const getDaysUntil = (date: Date) => {
    const today = new Date();
    return Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export const sortPickups = (pickups: GarbagePickup[]) => {
    return pickups.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const monthlyPickups = (pickups: GarbagePickup[]) => {
    const months: GarbagePickup[][] = new Array(12);

    for (const pickup of sortPickups(pickups)) {
        if (!months[pickup.date.getMonth()]) {
            months[pickup.date.getMonth()] = [];
        }

        months[pickup.date.getMonth()].push(pickup);
    }

    return months;
}