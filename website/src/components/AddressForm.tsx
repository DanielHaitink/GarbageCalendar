import type {Address} from "../types.ts";
import * as React from "react";
import {useState} from "react";

interface AddressFormProps {
    onSubmit: (address: Address) => void;
    initialAddress?: Address;
}

interface FormError {
    postcode?: string;
    number?: string;
    suffix?: string
}

interface FormState {
    Address: Address;
    errors: FormError;
    isSubmitting: boolean;
}

export const AddressForm : React.FC<AddressFormProps> = ({ onSubmit, initialAddress }) => {
    const [formState, setFormState] = useState<FormState>({
        Address: initialAddress || {
            postcode: '',
            number: '',
            suffix: ''
        },
        errors: {},
        isSubmitting: false
    });

    const validatePostalCode = (code: string): string | undefined => {
        if (code.length !== 6 || (code.length > 0 && !/^\d{4}[A-z]{2}$/.test(code.trim())))
            return "Postcode moet 4 cijfers en 2 letters bevatten";
        return undefined;
    }

    const validateNumber = (number: string): string | undefined => {
        if (number.length > 4)
            return "Huisnummer mag maximaal 4 cijfers bevatten";
        if (number.length > 0 && !/^\d+$/.test(number.trim()))
            return "Huisnummer mag alleen cijfers bevatten";

        return undefined;
    }

    const validateSuffix = (suffix: string): string | undefined => {
        if (suffix?.length > 2)
            return "Toevoeging mag maximaal 2 karakters bevatten";
        if (suffix?.length > 0 && !/^[A-z]$/.test(suffix.trim()))
            return "Toevoeging mag alleen letters bevatten";

        return undefined;
    }

    const updateField = (field: keyof Pick<Address, "postcode" | "number" | "suffix">, value: string): void => {
        setFormState(prevState => {
            const newState = {
                ...prevState,
                Address: {
                    ...prevState.Address,
                    [field]: value
                }
            };

            delete newState.errors[field as keyof FormError];

            return newState;
        })
    };

    const validate = (): boolean => {
        const errors = {
            postcode: validatePostalCode(formState.Address.postcode),
            number: validateNumber(formState.Address.number),
            suffix: validateSuffix(formState.Address.suffix || '')
        };

        setFormState(prevState => ({...prevState, errors: errors}));

        console.log(errors);

        return !Object.values(errors).some(e => e !== undefined);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate())
            return;

        setFormState(prevState => ({...prevState, isSubmitting: true}));

        try {
            const address: Address = {
                postcode: formState.Address.postcode.trim(),
                number: formState.Address.number.trim(),
                suffix: formState.Address.suffix?.trim() || undefined
            };

            await onSubmit(address);
        } catch (e) {
            console.error(e);
            // setFormState(prevState => ({...prevState, isSubmitting: false}));
        } finally {
            setFormState(prevState => ({...prevState, isSubmitting: false}));
        }
    };

    return (
        <form
            className="bg-white p-8 rounded-xl shadow-lg mb-8 max-w-md mx-auto"
            onSubmit={handleSubmit}
        >
            <div className="mb-6">
                <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Postcode:
                </label>
                <input
                    id="postalCode"
                    type="text"
                    value={formState.Address.postcode}
                    onChange={(e) => {
                        updateField("postcode", e.target.value)
                    }}
                    placeholder="9751AB"
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                    focus:outline-none transistion-colors placeholder-gray-400
                    ${formState.errors.postcode
                                 ? 'border-red-500 focus:border-red-500'
                                 : 'border-gray-300 focus:border-blue-500'
                             }

                   }`}
                    required
                    minLength={6}
                    maxLength={6}
                />
                {formState.errors.postcode && (
                    <p className="text-red-500 text-xs italic mt-2">
                        {formState.errors.postcode}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label
                    htmlFor="houseNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Huisnummer:
                </label>
                <input
                    id="houseNumber"
                    type="text"
                    value={formState.Address.number}
                    onChange={(e) => updateField("number", e.target.value)}
                    placeholder="123"
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                    focus:outline-none transistion-colors placeholder-gray-400
                    ${formState.errors.number
                                 ? 'border-red-500 focus:border-red-500'
                                 : 'border-gray-300 focus:border-blue-500'
                             }

                   }`}
                    required
                    maxLength={4}
                />
                {formState.errors.number && (
                    <p className="text-red-500 text-xs italic mt-2">
                        {formState.errors.number}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label
                    htmlFor="suffix"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Toevoeging (optioneel):
                </label>
                <input
                    id="suffix"
                    type="text"
                    value={formState.Address.suffix}
                    onChange={(e) => updateField("suffix", e.target.value)}
                    placeholder="A"
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                    focus:outline-none transistion-colors placeholder-gray-400
                    ${formState.errors.suffix
                                 ? 'border-red-500 focus:border-red-500'
                                 : 'border-gray-300 focus:border-blue-500'
                             }

                   }`}
                    maxLength={2}
                />
                {formState.errors.suffix && (
                    <p className="text-red-500 text-xs italic mt-2">
                        {formState.errors.suffix}
                    </p>
                )}
            </div>

            <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold
                         py-3 px-6 rounded-lg transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Zoek ophaaldata
            </button>
            {formState.isSubmitting && (
                <div className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-200"></div>
                </div>
            )}
        </form>
    );
}