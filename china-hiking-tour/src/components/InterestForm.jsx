import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Send, CheckCircle2 } from 'lucide-react';

const InterestForm = () => {
    const { language } = useLanguage();
    const [formData, setFormData] = useState({ name: '', mobile: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const t = {
        en: {
            title: "Express Your Interest",
            subtitle: "Leave your details and we'll get back to you shortly",
            name: "Your Name",
            mobile: "Mobile Number",
            email: "Email Address",
            message: "Message (Optional)",
            submit: "Send Interest",
            submitting: "Sending...",
            success: "Thank you! We've received your interest and will contact you soon.",
            placeholderName: "John Doe",
            placeholderMobile: "+44 7700 900000",
            placeholderEmail: "johndoe@example.com"
        },
        cn: {
            title: "表达您的兴趣",
            subtitle: "留下您的联系方式，我们会尽快回复",
            name: "您的姓名",
            mobile: "手机号码",
            email: "电子邮箱",
            message: "留言（可选）",
            submit: "提交意向",
            submitting: "发送中...",
            success: "感谢您！我们已收到您的意向，将尽快与您联系。",
            placeholderName: "张三",
            placeholderMobile: "+86 138 0000 0000",
            placeholderEmail: "zhangsan@example.com"
        }
    };

    const content = t[language];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', mobile: '', email: '', message: '' });
        }, 5000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (submitted) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.1) 0%, rgba(27, 94, 32, 0.05) 100%)',
                padding: '3rem 2rem',
                borderRadius: '16px',
                textAlign: 'center',
                border: '2px solid rgba(56, 142, 60, 0.3)',
                boxShadow: '0 4px 12px rgba(56, 142, 60, 0.1)'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    background: 'var(--success-green)',
                    color: 'white',
                    borderRadius: '50%',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 16px rgba(56, 142, 60, 0.3)'
                }}>
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--success-green)',
                    marginBottom: '0.5rem',
                    fontFamily: 'var(--font-heading)'
                }}>
                    {language === 'en' ? 'Sent Successfully!' : '发送成功！'}
                </h3>
                <p style={{
                    fontSize: '1.0625rem',
                    color: 'var(--text-medium)',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    {content.success}
                </p>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '700px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-heading)'
                }}>
                    {content.title}
                </h3>
                <p style={{
                    fontSize: '1.0625rem',
                    color: 'var(--text-medium)'
                }}>
                    {content.subtitle}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{
                background: 'var(--surface-white)',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)'
            }}>
                {/* Name & Mobile Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: 'var(--text-dark)',
                            marginBottom: '0.625rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {content.name} *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={content.placeholderName}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                borderRadius: '8px',
                                border: '2px solid var(--border-color)',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                fontFamily: 'var(--font-body)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: 'var(--text-dark)',
                            marginBottom: '0.625rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {content.mobile} *
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            required
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder={content.placeholderMobile}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                borderRadius: '8px',
                                border: '2px solid var(--border-color)',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                fontFamily: 'var(--font-body)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'var(--text-dark)',
                        marginBottom: '0.625rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {content.email} *
                    </label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={content.placeholderEmail}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            border: '2px solid var(--border-color)',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'var(--font-body)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'var(--text-dark)',
                        marginBottom: '0.625rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {content.message}
                    </label>
                    <textarea
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            border: '2px solid var(--border-color)',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'var(--font-body)',
                            resize: 'vertical',
                            minHeight: '120px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '1.125rem 2rem',
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--primary-red) 0%, #C62828 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(216, 67, 21, 0.3)',
                        fontFamily: 'var(--font-heading)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(216, 67, 21, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(216, 67, 21, 0.3)';
                    }}
                >
                    <Send size={22} strokeWidth={2.5} />
                    {content.submit}
                </button>
            </form>
        </div>
    );
};

export default InterestForm;
