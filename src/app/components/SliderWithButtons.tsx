import React from 'react';
import { Slider, Button, SliderValue } from '@nextui-org/react';

interface SliderWithButtonsProps {
    label: string;
    minValue: number;
    maxValue: number;
    step: number;
    value: number;
    onChange: (value: SliderValue) => void;
    getValue: (value: SliderValue) => string;
}

const SliderWithButtons: React.FC<SliderWithButtonsProps> = ({ label, minValue, maxValue, step, value, onChange, getValue }) => {

    return (
            <Slider
            startContent={
                <Button size="sm" radius="full" isIconOnly onClick={() => onChange(value - step)} style={{ backgroundColor: 'transparent' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </Button>
            }
            endContent={
                <Button size="sm" radius="full" isIconOnly onClick={() => onChange(value + step)} style={{ backgroundColor: 'transparent' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </Button>
            }
            size="sm"
            label={label}
            value={value}
            minValue={minValue}
            maxValue={maxValue}
            step={step}
            onChange={onChange}
            getValue={getValue}
            aria-labelledby="continuous-slider"
        />
    );
};

export default SliderWithButtons;