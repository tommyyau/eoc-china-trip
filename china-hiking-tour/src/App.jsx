import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ParallaxProvider } from 'react-scroll-parallax';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Itinerary from './pages/Itinerary';
import Info from './pages/Info';
import PageTransition from './components/effects/PageTransition';

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={
                        <PageTransition>
                            <Home />
                        </PageTransition>
                    }
                />
                <Route
                    path="/itinerary"
                    element={
                        <PageTransition>
                            <Itinerary />
                        </PageTransition>
                    }
                />
                <Route
                    path="/info"
                    element={
                        <PageTransition>
                            <Info />
                        </PageTransition>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <LanguageProvider>
            <ParallaxProvider>
                <Layout>
                    <AnimatedRoutes />
                </Layout>
            </ParallaxProvider>
        </LanguageProvider>
    );
}

export default App;
