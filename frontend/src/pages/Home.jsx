import React from 'react';
import Hero from '../components/Hero';
import Team from '../components/Team';
import ProjectAbout from "../components/ProjectAbout";


export default function Home() {
    return (
        <>
            <Hero />
            <ProjectAbout />
            <Team />
        </>
    );
}