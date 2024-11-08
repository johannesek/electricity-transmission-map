"use client"

import React, { useState, useEffect } from 'react';
import {NextUIProvider} from "@nextui-org/react";
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl/maplibre';
import {GeoJsonLayer} from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import type {Feature, Geometry} from 'geojson';
import type {PickingInfo} from '@deck.gl/core';
import {Slider} from '@nextui-org/react';
import {Button} from "@nextui-org/button";
import {Tooltip} from "@nextui-org/react";

type PropertiesType = {
  zoneName: string;
};

type TransmissionType = {
    source: string;
    target: string;
    value: number;
    value_rel: number; // value relative to the maximum value over all timestamps
    timestamps: number[];
    path: number[];
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

export default function Home() {
    // document.title = "Cross-border electricity transmission";
    
    const [time, setTime] = useState(0);
    const [step, setStep] = useState(0.01);
    const [running, setRunning] = useState(true);
    const [trailLength, setTrailLength] = useState(1);

    // const intervalMS = 10;
    // const loopLength = 1800;

    // useEffect(() => {
    // const interval = setInterval(() => {
    //     setTime(t => (t + step) % loopLength);
    // }, intervalMS);

    // return () => clearInterval(interval);
    // }, []);

    // const step = 0.01;
    const loopLength = 1338;
    let loopRunning = true;
    const [animation] = useState({id: 0});

    const animate = () => {
        if (loopRunning) {
            setTime(t => (t + step) % loopLength);
            animation.id = window.requestAnimationFrame(animate);
        }
    }

    const changeStep = (newStep: number) => {
        if (running) {
            setStep(newStep);
            window.cancelAnimationFrame(animation.id);
            animation.id = window.requestAnimationFrame(animate);
        } else {
            setStep(newStep);
        }
    }

    useEffect(() => {
        if (!running) {
          loopRunning = false;
          window.cancelAnimationFrame(animation.id);
          return;
        }
    
        loopRunning = true;
        animation.id = window.requestAnimationFrame(animate); // start animation
        return () => {
          loopRunning = false;
          window.cancelAnimationFrame(animation.id);
        };
      }, [running]);

    const bidding_zones = new GeoJsonLayer<PropertiesType>({
        id: 'GeoJsonLayer',
        data: 'world.geojson',
        stroked: true,
        filled: true,
        pointType: 'circle+text',
        pickable: false,
        getFillColor: [160, 160, 180, 0],
        getLineColor: [150, 150, 150],
        getText: (f: Feature<Geometry, PropertiesType>) => f.properties.zoneName,
        getLineWidth: 1500,
        getPointRadius: 4,
        getTextSize: 20
    });

    const trips = new TripsLayer<TransmissionType>({
        id: 'trips',
        data: 'exports.json',
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getWidth: d => d.value,
        getColor: d =>  [255 * d.value_rel, 255 * (1 - d.value_rel), 0],
        opacity: 0.6,
        rounded: true,
        trailLength: trailLength,
        currentTime: time,
        pickable: true,
    });

    return (
        
    <NextUIProvider>
      <div>
            <div className='mapbox'>
                <DeckGL
                    initialViewState={{
                    longitude: 14.0,
                    latitude: 59.0,
                    zoom: 4,
                    pitch: 0
                    }}
                    controller
                    // getTooltip={({object}: PickingInfo<Feature<Geometry, PropertiesType>>) => object && object.target}
                    getTooltip={({object}: PickingInfo<TransmissionType>) => 
                        object ? `${object.source} - ${object.target} : ${object.value} MW` : null
                      }
                    layers={[bidding_zones, trips]}
                >
                <Map reuseMaps mapStyle={MAP_STYLE} />
            </DeckGL>
            </div>

            <div className="z-2 w-1/4 p-4 absolute bg-gray-700 bg-opacity-80 rounded-lg top-10 left-10 flex flex-col space-y-3 justify-items-end">
                <div>
                    <Slider
                    startContent={
                        <Button size="sm" radius="full" isIconOnly onClick={() => setTime(time - 1)} style={{ backgroundColor: 'transparent' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </Button>
                    }
                    endContent={
                        <Button size="sm" radius="full" isIconOnly onClick={() => setTime(time + 1)} style={{ backgroundColor: 'transparent' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </Button>
                    }
                    label="Date"
                    size="sm"
                    minValue={0}
                    maxValue={loopLength}
                    step={1}
                    value={time}
                    getValue={value => new Date(2021, 1, 1 + Number(value)).toDateString()}
                    onChange={value => { setTime(Number(value)); }}
                    />
                </div>

                {/* Slider for step size of the animation */}
                <div>
                    <Slider
                    startContent={
                        <Button size="sm" radius="full" isIconOnly onClick={() => changeStep(step - 0.001)} style={{ backgroundColor: 'transparent' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </Button>
                    }
                    endContent={
                        <Button size="sm" radius="full" isIconOnly onClick={() => changeStep(step + 0.001)} style={{ backgroundColor: 'transparent' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </Button>
                    }
                    label="Animation speed"
                    size="sm"
                    minValue={0.001}
                    maxValue = {0.5}
                    step={0.001}
                    value={step}
                    onChange={value => { changeStep(Number(value)); }}
                    />
                </div>
                {/* Set trail length */}
                <div>
                  <Slider
                startContent={
                    <Button size="sm" radius="full" isIconOnly onClick={() => setTrailLength(trailLength - 0.1)} style={{ backgroundColor: 'transparent' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </Button>
                }
                endContent={
                    <Button size="sm" radius="full" isIconOnly onClick={() => setTrailLength(trailLength + 0.1)} style={{ backgroundColor: 'transparent' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </Button>
                }
                  label="Trail length"
                  size="sm"
                  minValue={0.1}
                  maxValue={10}
                  step={0.1}
                  value={trailLength}
                  getValue={value => value + " days"}
                  onChange={value => { setTrailLength(Number(value)); }}
                  />
                </div>
                {/* button to play/pause the animation */}
                <Button
                  onClick={() => { setRunning(!running) }}
                  color="primary"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z" />
                </svg>
                </Button>

                {/* <Button onClick={() => { setRunning(!running) }}>{running ? "Pause" : "Play"}</Button> */}
            </div>
        </div>
        <div className="absolute right-2 w-1/3 text-white bottom-10 px-10 z-10 bottom-0.1 grid grid-cols-3 gap-0 justify-between">
            <div className="col-span-full bg-gradient-to-r m-4from-0% from-green-500 to-red-500 to-100% h-3"></div>
            <div className="col-span-1 text-left">0%</div>
            <div className="col-span-1 text-center">
                <span className="inline-flex items-center gap-1">
                    <span>Utilization</span>
                    <span>
                        <Tooltip content={
                            <div className="px-1 py-2">
                                <div className="text-small font-bold">Percentage of the maximum transmitted electricity over the whole time period over the specific line.</div>
                                <div className="text-tiny">This might not reflect the utilization compared to the physical maximal capacity of the tansmission line.</div>
                            </div>
                        }>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>
                        </Tooltip>
                    </span>
                </span>
            </div>
            <div className="col-span-1 text-right">100%</div>
        </div>

    </NextUIProvider>
    );
}

