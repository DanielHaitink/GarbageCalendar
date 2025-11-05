import type {Address} from "../types.ts";

interface RecentSearchesProps {
    recentSearches: Address[];
    onClick?: (address: Address) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ recentSearches, onClick }) => {
    const handleClick = (address: Address) => {
        if (onClick)
            onClick(address);
    }

    const recentSearchesList = recentSearches.map(search => (
        <div
            key={search.postcode + search.number + search.suffix}
            className="rounded-3xl p-2 text-white bg-groningen hover:bg-red-500 cursor-pointer transition-colors ease-in-out duration-300"
            onClick={handleClick.bind(null, search)}
        >
            {search.postcode} {search.number} {search.suffix}
        </div>
    ));

    return (
        <div className="flex gap-4 text-center mb-10 max-w-md mx-auto justify-center justify-self-center flex-wrap">
            {recentSearchesList}
        </div>
    );
};
