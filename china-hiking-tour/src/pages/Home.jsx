import { useLanguage } from '../context/LanguageContext';
import { Calendar, MapPin, Users, Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const { language } = useLanguage();

    const content = {
        en: {
            hero: {
                title: 'China Hiking Adventure 2026',
                subtitle: 'Join the Ealing Outdoor Club on an Unforgettable Journey',
                dates: 'May 8 - May 23, 2026 (14 Days)',
                cta: 'View Itinerary',
                ctaSecondary: 'Express Interest'
            },
            intro: {
                title: 'Discover Ancient China Through Epic Hikes',
                description: 'Join us for an incredible 14-day adventure through China\'s most breathtaking landscapes and historic sites. From the legendary Terracotta Warriors to the majestic Great Wall, from serene mountain trails to vibrant cultural experiences - this journey combines the best of hiking, history, and hospitality.',
                dates: 'May 8 - May 23, 2026'
            },
            highlights: [
                {
                    icon: '🏛️',
                    title: 'Terracotta Warriors',
                    description: 'Marvel at one of the world\'s greatest archaeological discoveries in Xi\'an'
                },
                {
                    icon: '🏔️',
                    title: 'Great Wall Hiking',
                    description: 'Trek along the ancient Ming Dynasty fortifications with stunning mountain views'
                },
                {
                    icon: '⛰️',
                    title: 'Mount Tai',
                    description: 'Climb one of China\'s Five Sacred Mountains, a UNESCO World Heritage Site'
                },
                {
                    icon: '🏞️',
                    title: 'Lushan National Park',
                    description: 'Explore dramatic peaks, waterfalls, and ancient Buddhist temples'
                },
                {
                    icon: '🏘️',
                    title: 'Ancient Villages',
                    description: 'Wander through centuries-old villages in the stunning Wuyuan countryside'
                },
                {
                    icon: '🌊',
                    title: 'Qingdao Beaches',
                    description: 'Relax by the Yellow Sea in this charming coastal city with German heritage'
                }
            ]
        },
        cn: {
            hero: {
                title: '2026中国徒步探险之旅',
                subtitle: '与伊灵户外俱乐部一起踏上难忘的旅程',
                dates: '2026年5月8日 - 5月23日（14天）',
                cta: '查看行程',
                ctaSecondary: '表达兴趣'
            },
            intro: {
                title: '通过史诗般的徒步探索古老的中国',
                description: '加入我们为期14天的中国之旅，探索最令人叹为观止的风景和历史遗迹。从传奇的兵马俑到雄伟的长城，从宁静的山间小径到充满活力的文化体验——这次旅程将徒步、历史和热情好客完美结合。',
                dates: '2026年5月8日 - 5月23日'
            },
            highlights: [
                {
                    icon: '🏛️',
                    title: '兵马俑',
                    description: '在西安欣赏世界上最伟大的考古发现之一'
                },
                {
                    icon: '🏔️',
                    title: '长城徒步',
                    description: '沿着古老的明代长城徒步，欣赏壮丽的山景'
                },
                {
                    icon: '⛰️',
                    title: '泰山',
                    description: '攀登中国五岳之一，联合国教科文组织世界遗产'
                },
                {
                    icon: '🏞️',
                    title: '庐山国家公园',
                    description: '探索险峻的山峰、瀑布和古老的佛教寺庙'
                },
                {
                    icon: '🏘️',
                    title: '古村落',
                    description: '漫步婺源乡村数百年历史的村庄'
                },
                {
                    icon: '🌊',
                    title: '青岛海滩',
                    description: '在这个拥有德国遗产的迷人海滨城市，享受黄海的宁静'
                }
            ]
        }
    };

    const t = content[language] || content.en;

    return (
        <div className="home">
            {/* Hero Section */}
            <section
                className="hero-section"
                style={{
                    background: 'linear-gradient(135deg, rgba(216, 67, 21, 0.9) 0%, rgba(25, 118, 210, 0.85) 100%), url(https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600) center/cover',
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    position: 'relative'
                }}
            >
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h1 style={{
                            color: 'white',
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            marginBottom: '1rem',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            {t.hero.title}
                        </h1>
                        <p style={{
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                            marginBottom: '1.5rem',
                            color: 'rgba(255,255,255,0.95)',
                            fontWeight: 300
                        }}>
                            {t.hero.subtitle}
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            marginBottom: '2rem',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        }}>
                            <Calendar size={20} />
                            <span>{t.hero.dates}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Link to="/itinerary" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
                                {t.hero.cta}
                            </Link>
                            <Link to="/itinerary#interest-form" className="btn btn-outline" style={{
                                fontSize: '1.1rem',
                                borderColor: 'white',
                                color: 'white'
                            }}>
                                {t.hero.ctaSecondary}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intro Section */}
            <section className="section-lg" style={{ background: 'var(--surface-white)' }}>
                <div className="container">
                    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{t.intro.title}</h2>
                        <p style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.9',
                            color: 'var(--text-medium)',
                            marginBottom: '2rem'
                        }}>
                            {t.intro.description}
                        </p>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'var(--off-white)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: 'var(--primary-red)'
                        }}>
                            <Calendar size={24} strokeWidth={2.5} />
                            <span>{t.intro.dates}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section className="section-lg section-alt">
                <div className="container">
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '3rem',
                        fontSize: '2.5rem'
                    }}>
                        {language === 'en' ? 'Trip Highlights' : '行程亮点'}
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {t.highlights.map((highlight, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: 'var(--surface-white)'
                                }}
                            >
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '1rem',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {highlight.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '1rem',
                                    color: 'var(--text-dark)'
                                }}>
                                    {highlight.title}
                                </h3>
                                <p style={{
                                    color: 'var(--text-medium)',
                                    lineHeight: '1.7',
                                    marginBottom: 0
                                }}>
                                    {highlight.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="section-lg" style={{ background: 'var(--primary-blue)', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '2.5rem' }}>
                            {language === 'en' ? 'Ready for an Adventure?' : '准备好冒险了吗？'}
                        </h2>
                        <p style={{
                            fontSize: '1.25rem',
                            marginBottom: '2.5rem',
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: '1.8'
                        }}>
                            {language === 'en'
                                ? 'Join fellow Ealing Outdoor Club members on this incredible journey through China\'s most spectacular landscapes.'
                                : '与伊灵户外俱乐部成员一起，踏上这段穿越中国最壮观风景的难忘旅程。'
                            }
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/itinerary" className="btn btn-primary" style={{ fontSize: '1.125rem' }}>
                                {language === 'en' ? 'View Full Itinerary' : '查看完整行程'}
                            </Link>
                            <Link to="/info" className="btn" style={{
                                fontSize: '1.125rem',
                                background: 'white',
                                color: 'var(--primary-blue)',
                                borderColor: 'white'
                            }}>
                                {language === 'en' ? 'Trip Information' : '行程信息'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
