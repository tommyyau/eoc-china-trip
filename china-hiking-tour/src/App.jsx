import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Itinerary from './pages/Itinerary';
import Info from './pages/Info';

function App() {
    return (
        <LanguageProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/itinerary" element={<Itinerary />} />
                    <Route path="/info" element={<Info />} />
                </Routes>
            </Layout>
        </LanguageProvider>
    );
}

export default App;
