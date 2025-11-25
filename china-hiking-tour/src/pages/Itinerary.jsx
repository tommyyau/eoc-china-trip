import React from 'react';
import { itineraryData } from '../data/itineraryData';
import ItineraryCard from '../components/ItineraryCard';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import PDFDownload from '../components/PDFDownload';
import InterestForm from '../components/InterestForm';

const Itinerary = () => {
    const { language } = useLanguage();

    const t = {
        en: {
            title: "Detailed Itinerary",
            subtitle: "A day-by-day guide to your adventure.",
            download: "Download Itinerary (PDF)",
            interestTitle: "Interested in this trip?",
            interestSubtitle: "Leave your details and we'll get back to you."
        },
        cn: {
            title: "详细行程",
            subtitle: "您的冒险之旅每日指南。",
            download: "下载行程 (PDF)",
            interestTitle: "对这次旅行感兴趣？",
            interestSubtitle: "留下您的联系方式，我们会与您联系。"
        }
    };

    const content = t[language];

    return (
        <div className="itinerary-page">
            <section className="section bg-background">
                <div className="container">
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl mb-4"
                        >
                            {content.title}
                        </motion.h1>
                        <p className="text-xl text-text-light mb-8">{content.subtitle}</p>
                        <PDFDownload label={content.download} />
                    </div>

                    <div className="timeline relative" style={{ marginTop: '4rem' }}>
                        {/* Vertical Line (Desktop only) */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20 hidden md:block transform -translate-x-1/2"></div>

                        {itineraryData.map((day, index) => (
                            <ItineraryCard key={day.day} day={day} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-white">
                <div className="container max-w-2xl text-center">
                    <h2 className="text-3xl mb-4">{content.interestTitle}</h2>
                    <p className="text-text-light mb-8">{content.interestSubtitle}</p>
                    <InterestForm />
                </div>
            </section>
        </div>
    );
};

export default Itinerary;
