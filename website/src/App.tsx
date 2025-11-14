import {useState} from 'react'
import './App.css'
import {AddressForm} from "./components/AddressForm.tsx";
import {type Address, type GarbageData} from "./types.ts";
import {GarbageCalendar} from "./components/GarbageCalendar.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

// import tailwindcss from "@tailwindcss/vite";

function App() {
    const parameters = new URLSearchParams(document.location.search);
    const [currentAddress, setCurrentAddress] = useState<Address | undefined>(
        parameters.get("postcode") !== null && parameters.get("number") !== null ? {
            postcode: parameters.get("postcode") || "",
            number: Number.parseInt(parameters.get("number") || ""),
            suffix: parameters.get("suffix") || ""
        } : undefined);
    const [garbageData, setGarbageData] = useState<GarbageData | undefined>(undefined);

    const handleAddressSubmit = (address: Address) => {
        console.log(address);
        setCurrentAddress(address);
        setGarbageData(undefined);
    }

    const handleGarbageDataSuccess = (data: GarbageData | undefined) => {
        setGarbageData(data);

        if (data === undefined)
            return window.history.pushState({}, '', `?`);

        const newUrl = new URLSearchParams({
            "postcode": data.address.postcode,
            "number": data.address.number.toFixed(0),
            "suffix": data.address.suffix || "",
            "autoSubmit": ""
        }).toString();

        window.history.pushState({}, '', `?${newUrl}`);
    }

    return (
        <div
            className="App min-h-screen bg-fixed bg-gradient-to-br from-red-50 via-blue-50 to-green-50 print:bg-none print:bg-white print:text-black">
            <div className="flex flex-col">
                <header className="text-center mb-16 pt-16 print:hidden">
                    <h1 className="font-bold text-shadow-amber-100 text-3xl mb-6 text-groningen">Afvalkalender
                        Groningen</h1>
                </header>

                <main className="flex-grow animate-fade-in-up">
                    {!garbageData && < AddressForm
                        onSubmit={handleAddressSubmit}
                        onSuccess={handleGarbageDataSuccess}
                        initialAddress={currentAddress}
                        autoSubmit={parameters.get("autoSubmit") !== null || false}/>
                    }

                    {garbageData && (
                        <div className={"max-w-4xl mx-auto  rounded-xl bg-white shadow-lg p-8 dropshadow-2xl\n" +
                            "                print:w-full print:h-full print:rounded-none print:shadow-none print:p-0"}>
                            <div className="navigation absolute print:hidden">
                                <button className={"navigation-back hover:contrast-0 focus:contrast-0 print:hidden"}
                                        onClick={handleGarbageDataSuccess.bind(null, undefined)}><FontAwesomeIcon
                                    icon={faArrowLeft}/></button>
                            </div>
                            <GarbageCalendar data={garbageData}/>
                        </div>
                    )
                    }
                </main>

                <footer className="text-center text-sm mt-32 pb-8 
                print:absolute print:-bottom-0 print:left-0 print:w-full print:text-left print:text-xs print:m-0 print:p-0">
                    Gemaakt door <a href="https://lionsdensoftware.nl">Lions Den Software</a> | <a
                    href="https://danielhaitink.nl" target="_blank" rel="noreferrer">Daniël Haitink</a>
                    <br/>
                    <a href="https://github.com/DanielHaitink/GarbageCalendar" target="_blank" rel="noreferrer"
                       className={"print:hidden"}>Bekijk
                        de code op Github</a>
                </footer>
            </div>
        </div>
    );
}

export default App
