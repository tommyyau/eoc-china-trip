import { useLanguage } from '../context/LanguageContext';
import { FileText, CreditCard, Info as InfoIcon, CheckCircle, XCircle } from 'lucide-react';

const Info = () => {
    const { language } = useLanguage();

    const t = {
        en: {
            title: "Essential Information",
            visaTitle: "Group Visa Information",
            visaItems: [
                "Visa Type: Group visa (all members must enter and exit together)",
                "Validity: 30 days",
                "Document Submission: 40 days before departure",
                "Visa Fee: USD $130 (approx. £100)",
                "Note: Original passports are NOT required, only photocopies."
            ],
            costTitle: "Cost & Inclusions",
            costPrice: "Reference Price: Approx. £1,600 per person (double occupancy)",
            includesTitle: "Includes",
            excludesTitle: "Excludes",
            costIncludes: [
                "Accommodation: 13 nights (mainly 4-star)",
                "Meals: 3 meals per day",
                "Transportation: Dedicated bus + High-speed rail",
                "Services: English/Chinese guides, mountain guide",
                "Tickets: All entry tickets listed",
                "Insurance: Travel agency liability + outdoor accident insurance"
            ],
            costExcludes: [
                "International round-trip airfare",
                "Single room supplement (£455-£585)",
                "Personal expenses",
                "Visa fees"
            ]
        },
        cn: {
            title: "重要信息",
            visaTitle: "团体签证信息",
            visaItems: [
                "签证类型：团体签证（所有成员必须同进同出）",
                "有效期：30天",
                "文件提交：出发前40天",
                "签证费：130美元（约100英镑）",
                "注意：不需要护照原件，只需复印件。"
            ],
            costTitle: "费用与包含",
            costPrice: "参考价格：约 £1,600 每人（双人入住）",
            includesTitle: "包含",
            excludesTitle: "不包含",
            costIncludes: [
                "住宿：13晚（主要是4星级）",
                "餐饮：每日3餐",
                "交通：专用巴士 + 高铁",
                "服务：中英文导游，登山向导",
                "门票：行程所列所有门票",
                "保险：旅行社责任险 + 户外意外险"
            ],
            costExcludes: [
                "国际往返机票",
                "单房差 (£455-£585)",
                "个人消费",
                "签证费"
            ]
        }
    };

    const content = t[language];

    return (
        <div className="info-page">
            {/* Page Header */}
            <section className="section" style={{
                background: 'linear-gradient(135deg, var(--primary-red) 0%, var(--primary-blue) 100%)',
                color: 'white',
                textAlign: 'center',
                padding: '4rem 0'
            }}>
                <div className="container">
                    <h1 style={{ color: 'white', marginBottom: '1rem' }}>
                        {content.title}
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'rgba(255,255,255,0.9)',
                        maxWidth: '700px',
                        margin: '0 auto'
                    }}>
                        {language === 'en'
                            ? 'Everything you need to know about visas, costs, and trip inclusions'
                            : '关于签证、费用和行程包含内容的所有信息'}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="section-lg section-alt">
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {/* Visa Section */}
                        <div className="card" style={{ padding: '2rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1.5rem',
                                color: 'var(--primary-blue)'
                            }}>
                                <FileText size={32} strokeWidth={2} />
                                <h2 style={{ marginBottom: 0, color: 'var(--text-dark)' }}>
                                    {content.visaTitle}
                                </h2>
                            </div>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                {content.visaItems.map((item, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            fontSize: '1rem',
                                            lineHeight: '1.7',
                                            color: 'var(--text-medium)'
                                        }}
                                    >
                                        <span style={{
                                            color: 'var(--success-green)',
                                            flexShrink: 0,
                                            marginTop: '0.25rem'
                                        }}>
                                            <CheckCircle size={18} />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Cost Section */}
                        <div className="card" style={{ padding: '2rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1.5rem',
                                color: 'var(--primary-red)'
                            }}>
                                <CreditCard size={32} strokeWidth={2} />
                                <h2 style={{ marginBottom: 0, color: 'var(--text-dark)' }}>
                                    {content.costTitle}
                                </h2>
                            </div>

                            <div style={{
                                background: 'var(--off-white)',
                                padding: '1.25rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '2rem',
                                borderLeft: '4px solid var(--primary-red)'
                            }}>
                                <p style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: 'var(--primary-red)',
                                    marginBottom: 0
                                }}>
                                    {content.costPrice}
                                </p>
                            </div>

                            {/* Includes */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    marginBottom: '1rem',
                                    color: 'var(--success-green)',
                                    fontWeight: 700
                                }}>
                                    ✓ {content.includesTitle}
                                </h3>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem'
                                }}>
                                    {content.costIncludes.map((item, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                                fontSize: '0.9375rem',
                                                color: 'var(--text-medium)',
                                                lineHeight: '1.6'
                                            }}
                                        >
                                            <span style={{
                                                color: 'var(--success-green)',
                                                flexShrink: 0,
                                                marginTop: '0.125rem'
                                            }}>
                                                <CheckCircle size={16} />
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Excludes */}
                            <div>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    marginBottom: '1rem',
                                    color: 'var(--text-light)',
                                    fontWeight: 700
                                }}>
                                    × {content.excludesTitle}
                                </h3>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem'
                                }}>
                                    {content.costExcludes.map((item, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                                fontSize: '0.9375rem',
                                                color: 'var(--text-light)',
                                                lineHeight: '1.6'
                                            }}
                                        >
                                            <span style={{
                                                color: 'var(--text-light)',
                                                flexShrink: 0,
                                                marginTop: '0.125rem'
                                            }}>
                                                <XCircle size={16} />
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Info;
