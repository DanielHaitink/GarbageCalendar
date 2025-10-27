import {useState} from 'react'
import './App.css'
import {AddressForm} from "./components/AddressForm.tsx";
import type {Address, GarbageData} from "./types.ts";
import {garbageApi} from "./services/garbageApi.ts";
import {GarbageList} from "./components/GarbageList.tsx";

// import 'tailwindcss/tailwind.css';

function App() {
    const [currentAddress, setCurrentAddress] = useState<Address | undefined>(undefined);
    const [garbageData, setGarbageData] = useState<GarbageData | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    const handleAddressSubmit = async (address: Address) => {
        console.log(address);
        setCurrentAddress(address);
        setGarbageData(undefined);
        setError(undefined);

        try {
            setGarbageData(await garbageApi.getGarbageData(address));
        } catch (e) {
            // @ts-ignore
            setError(e.message);
        }
    }

    return (
        <div className="App min-h-screen bg-fixed bg-gradient-to-br from-red-50 via-blue-50 to-green-50">
            <div className="flex flex-col">
                <header className="text-center mb-16 pt-16 animate-fade-in-up">
                    <h1 className="font-bold text-shadow-amber-100 text-xl mb-6 text-red-500">Afvalkalender
                        Groningen</h1>
                    <p>Vul je adresgegevens in om de kalender te bekijken</p>
                </header>

                <main className="flex-grow animate-fade-in-up">
                    {!currentAddress && < AddressForm onSubmit={handleAddressSubmit}
                                 initialAddress={currentAddress}/>
                    }

                    {/*{currentAddress && (*/}
                    {/*    <div className="current-address">*/}
                    {/*        <h2>Geselecteerd adres:</h2>*/}
                    {/*        <p>*/}
                    {/*            {currentAddress.postcode} {currentAddress.number} {currentAddress.suffix}*/}
                    {/*        </p>*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {garbageData && (
                        <GarbageList data={garbageData}/>
                    )}

                    {error && (
                        <div className="error">
                            <h2>Fout</h2>
                            <p>{error}</p>
                        </div>
                    )}
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
