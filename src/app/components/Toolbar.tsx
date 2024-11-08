import React from 'react';
import { Button } from '@nextui-org/react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react";
import SliderWithButtons from './SliderWithButtons';


type ToolbarProps = {
    time: number;
    setTime: (time: number) => void;
    loopLength: number;
    step: number;
    changeStep: (step: number) => void;
    trailLength: number;
    setTrailLength: (trailLength: number) => void;
    running: boolean;
    setRunning: (running: boolean) => void;
};




const Toolbar: React.FC<ToolbarProps> = ({
    time,
    setTime,
    loopLength,
    step,
    changeStep,
    trailLength,
    setTrailLength,
    running,
    setRunning,
}) => {
    return (
            <Dropdown closeOnSelect={false}
                className="min-w-[40vw] bg-opacity-80"
            >
            <DropdownTrigger>
                <Button >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Settings">
                <DropdownSection showDivider>
                    <DropdownItem key="date-slider">
                        <SliderWithButtons
                            label="Date"
                            minValue={0}
                            maxValue={loopLength}
                            step={1}
                            value={time}
                            getValue={value => new Date(2021, 1, 1 + Number(value)).toDateString()}
                            onChange={value => { setTime(Number(value)); }}
                        />
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                    <DropdownItem key="animation-speed-slider">
                        <SliderWithButtons
                            label="Animation speed"
                            minValue={0.001}
                            maxValue={0.5}
                            step={0.001}
                            value={step}
                            getValue={value => String(value)}
                            onChange={value => { changeStep(Number(value)); }}
                        />
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                <DropdownItem key="trail-length-slider">
                    <SliderWithButtons
                        label="Trail length"
                        minValue={0.1}
                        maxValue={10}
                        step={0.1}
                        value={trailLength}
                        getValue={value => value + " days"}
                        onChange={value => { setTrailLength(Number(value)); }}
                    />
                </DropdownItem>
                </DropdownSection>
                    <DropdownItem key="play-pause">
                    <div className="flex justify-center">
                    <Button onClick={() => { setRunning(!running) }} color="primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z" />
                        </svg>
                    </Button>
                    </div>
                    </DropdownItem>
            </DropdownMenu>
            </Dropdown>
    );
};

export default Toolbar;