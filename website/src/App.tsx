import {useState} from 'react'
import './App.css'
import {AddressForm} from "./components/AddressForm.tsx";
import {type Address, type GarbageData} from "./types.ts";
import {GarbageCalendar} from "./components/GarbageCalendar.tsx";

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

    const handleGarbageDataSuccess = (data: GarbageData) => {
        setGarbageData(data);
    }

    return (
        <div className="App min-h-screen bg-fixed bg-gradient-to-br from-red-50 via-blue-50 to-green-50 ">
            <div className="flex flex-col">
                <header className="text-center mb-16 pt-16">
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

                    {currentAddress && !garbageData && (
                        <div className="current-address text-center text-xl mb-16"></div>
                    )}

                    {currentAddress && garbageData && (
                        <div className="current-address text-center text-xl mb-16">
                            <p>
                                {garbageData.rawAddress.street} {garbageData.rawAddress.housenumber}{garbageData.rawAddress.addition}
                            </p>
                            <p>
                                {currentAddress.postcode}
                            </p>
                        </div>
                    )}

                    {garbageData && (
                        <GarbageCalendar data={garbageData}/>
                    )
                    }
                </main>

                <footer className="text-center text-sm mt-32 pb-8 animate-fade-in-up">
                    Gemaakt door <a href="https://lionsdensoftware.nl">Lions Den Software</a> | <a
                    href="https://danielhaitink.nl" target="_blank" rel="noreferrer">Daniël Haitink</a>
                    <br/>
                    <a href="https://github.com/danielhaitink/garbage-calendar" target="_blank" rel="noreferrer">Bekijk
                        de code op Github</a>
                </footer>
            </div>
        </div>
    );
}

export default App
