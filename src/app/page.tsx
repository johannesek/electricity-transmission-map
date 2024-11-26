"use client"

import React, { useState, useEffect } from 'react';
import {NextUIProvider} from "@nextui-org/react";
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl/maplibre';
import {GeoJsonLayer} from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import type {Feature, Geometry} from 'geojson';
import type {PickingInfo} from '@deck.gl/core';
import {Tooltip} from "@nextui-org/react";

import Toolbar from './components/Toolbar';

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
    const [time, setTime] = useState(0);
    const [step, setStep] = useState(0.01);
    const [running, setRunning] = useState(true);
    const [trailLength, setTrailLength] = useState(1);
    const loopLength = 1338;
    let loopRunning = true;
    const [animation] = useState({id: 0});

    const date = new Date(2021, 0, 1 + Math.floor(time));

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
        pickable: true,
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
                getTooltip={({object}: PickingInfo) => {
                    if (object) {
                        if (object.source) {
                            return `${object.source} - ${object.target} : ${object.value} MWh`;
                        } else if (object.properties.zoneName) {
                            const zoneName = object.properties.zoneName;
                            const trimmedZoneName = zoneName.includes('-') ? zoneName.split('-')[1] : zoneName;
                            return trimmedZoneName;
                            // return object.properties.zoneName;  
                        } else {
                            return null;
                        }
                    }}}
                layers={[bidding_zones, trips]}
                >
                <Map reuseMaps mapStyle={MAP_STYLE} />
            </DeckGL>
        </div>
        <div className="z-2 p-4 absolute rounded-lg top-2rem left-2rem flex flex-col space-y-3 justify-items-end">
            <Toolbar 
                time={time} 
                setTime={setTime} 
                loopLength={loopLength} 
                step={step} 
                changeStep={changeStep} 
                trailLength={trailLength} 
                setTrailLength={setTrailLength} 
                running={running} 
                setRunning={setRunning} 
            /> 
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
                                <div className="text-tiny">This might not reflect the utilization compared to the physical maximal capacity of the transmission line.</div>
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
        <div className="absolute top-3 right-3 text-white text-xl">
            {date.toDateString()} 
        </div>
        <div className="absolute bottom-3 left-3 text-white text-xl">
            Total daily cross-border electricity transmission
        </div>
        <div className="absolute bottom-2 right-2 text-white text-xs">
            Data sources: <a href="https://transparency.entsoe.eu">ENTSO-e</a>, <a href="https://github.com/electricitymaps" target="_blank" rel="noopener noreferrer">Electricitymaps</a>
        </div>

    </NextUIProvider>
    );
}

