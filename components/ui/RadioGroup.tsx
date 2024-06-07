import type { NextPage } from 'next';
import cx from 'clsx';

export interface Radio {
    name: string;
    label: string;
    value: string;
}

interface RadioGroupProps {
    options: Radio[];
    selectedValue: string;
    onChange: (value: string) => void;
}

/**
 * @param props.options Array to add several Radio
 * @param props.selectedValue selected value by user
 * @param props.onChange on change event for Radio
 * @returns
 */
const RadioGroup: NextPage<RadioGroupProps> = ({ options, selectedValue, onChange }) => {
    return (
        <div className="flex justify-start space-x-5 ml-1">
            {options.map((option) => (
                <div key={option.name} className="flex justify-start space-x-2 items-center">
                    <div className="grid place-items-center">
                        <input
                            id={option.name}
                            value={option.value}
                            name={option.name}
                            type="radio"
                            className={cx(
                                'peer col-start-1 row-start-1',
                                'appearance-none shrink-0',
                                'w-4 h-4 border-2 border-violet-500 rounded-full',
                                'focus:outline-none focus:ring-offset-0 focus:ring-2 focus:ring-violet-500',
                                'disabled:border-gray-400'
                            )}
                            checked={selectedValue === option.value}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        <div
                            className={cx(
                                'pointer-events-none',
                                'col-start-1 row-start-1',
                                'w-2 h-2 rounded-full peer-checked:bg-violet-600',
                                'peer-checked:peer-disabled:bg-gray-400'
                            )}
                        />
                    </div>
                    <label htmlFor={option.name} className="text-start hover:cursor-pointer">
                        {option.label}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default RadioGroup;
