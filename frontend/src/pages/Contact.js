import React,
{
    useState
}

    from 'react';
import Button from '../components/common/Button';
import './Contact.css';

const Contact = () => {

    const [formData,
        setFormData] = useState({
            name: '',
            email: '',
            subject: '',
            message: ''
        });

    const [errors,
        setErrors] = useState({});
    const [isSubmitting,
        setIsSubmitting] = useState(false);
    const [isSubmitted,
        setIsSubmitted] = useState(false);

    const contactInfo = [{
        icon: '📍', title: 'Visit Us', details: ['123 Food Street, Downtown', 'New York, NY 10001']
    }

        ,
    {
        icon: '📞', title: 'Call Us', details: ['+1 234 567 890', '+1 234 567 891']
    }

        ,
    {
        icon: '✉️', title: 'Email Us', details: ['support@fooddelivery.com', 'careers@fooddelivery.com']
    }

        ,
    {
        icon: '⏰', title: 'Working Hours', details: ['Monday - Friday: 9AM - 9PM', 'Weekends: 10AM - 8PM']
    }

    ];

    const faqs = [{
        question: 'How do I track my order?',
        answer: 'You can track your order in real-time from the "My Orders" section in your account. Click on the active order to see live tracking updates.'
    }

        ,
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept credit/debit cards, UPI (Google Pay, PhonePe, Paytm), net banking, and cash on delivery.'
    }

        ,
    {
        question: 'How long does delivery take?',
        answer: 'Delivery typically takes 25-40 minutes depending on your location and restaurant preparation time.'
    }

        ,
    {
        question: 'Can I cancel my order?',
        answer: 'Orders can be cancelled within 2 minutes of placing them. Please contact support for cancellation requests after that.'
    }

        ,
    {
        question: 'How do I get a refund?',
        answer: 'Refunds are processed within 5-7 business days to your original payment method. Contact support for refund requests.'
    }

    ];

    const validateForm = () => {
        const newErrors = {}

            ;

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

        ;

    const handleChange = (e) => {
        const {
            name,
            value
        }

            = e.target;

        setFormData(prev => ({
            ...prev, [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev, [name]: ''
            }));
        }
    }

        ;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubmitted(true);

            setFormData({
                name: '', email: '', subject: '', message: ''
            });
        }

        catch (error) {
            console.error('Error submitting form:', error);
        }

        finally {
            setIsSubmitting(false);
        }
    }

        ;

    const [activeFaq,
        setActiveFaq] = useState(null);

    return (<div className="contact-page" > {
        /* Hero Section */
    }

        <section className="contact-hero" > <div className="hero-content" > <h1 className="hero-title" >Get in Touch</h1> <p className="hero-subtitle" > Have questions? We'd love to hear from you. Send us a message and we' ll respond as soon as possible. </p> </div> </section> <div className="contact-container" > {
            /* Contact Info Cards */
        }

            <div className="contact-info-grid" > {
                contactInfo.map((info, index) => (<div key={
                    index
                }

                    className="info-card" > <div className="info-icon" > {
                        info.icon
                    }

                    </div> <h3 className="info-title" > {
                        info.title
                    }

                    </h3> {
                        info.details.map((detail, i) => (<p key={
                            i
                        }

                            className="info-detail" > {
                                detail
                            }

                        </p>))
                    }

                </div>))
            }

            </div> {
                /* Contact Form & Map */
            }

            <div className="contact-form-section" > <div className="form-container" > <h2 className="form-title" >Send us a Message</h2> {
                isSubmitted ? (<div className="success-message" > <div className="success-icon" >✓</div> <h3>Message Sent !</h3> <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button className="new-message-btn" onClick={
                        () => setIsSubmitted(false)
                    }

                    > Send Another Message </button> </div>) : (<form onSubmit={
                        handleSubmit
                    }

                        className="contact-form" > <div className="form-row" > <div className="form-group" > <label htmlFor="name" >Your Name *</label> <input type="text"
                            id="name"
                            name="name"

                            value={
                                formData.name
                            }

                            onChange={
                                handleChange
                            }

                            className={
                                errors.name ? 'error' : ''
                            }

                        /> {
                                errors.name && <span className="error-message" > {
                                    errors.name
                                }

                                </span>
                            }

                        </div> <div className="form-group" > <label htmlFor="email" >Email Address *</label> <input type="email"
                            id="email"
                            name="email"

                            value={
                                formData.email
                            }

                            onChange={
                                handleChange
                            }

                            className={
                                errors.email ? 'error' : ''
                            }

                        /> {
                                    errors.email && <span className="error-message" > {
                                        errors.email
                                    }

                                    </span>
                                }

                            </div> </div> <div className="form-group" > <label htmlFor="subject" >Subject *</label> <input type="text"
                                id="subject"
                                name="subject"

                                value={
                                    formData.subject
                                }

                                onChange={
                                    handleChange
                                }

                                className={
                                    errors.subject ? 'error' : ''
                                }

                            /> {
                                errors.subject && <span className="error-message" > {
                                    errors.subject
                                }

                                </span>
                            }

                        </div> <div className="form-group" > <label htmlFor="message" >Message *</label> <textarea id="message"
                            name="message"
                            rows="6"

                            value={
                                formData.message
                            }

                            onChange={
                                handleChange
                            }

                            className={
                                errors.message ? 'error' : ''
                            }

                            placeholder="Tell us how we can help..."

                        /> {
                                errors.message && <span className="error-message" > {
                                    errors.message
                                }

                                </span>
                            }

                        </div> <Button type="submit"
                            variant="primary"
                            size="large"

                            fullWidth isLoading={
                                isSubmitting
                            }

                        > Send Message </Button> </form>)
            }

            </div> {
                    /* Map Placeholder */
                }

                <div className="map-container" > <h3 className="map-title" >Find Us Here</h3> <div className="map-placeholder" > <div className="map-marker" >📍</div> <p>123 Food Street, Downtown</p> <p>New York, NY 10001</p> <button className="directions-btn" >Get Directions →</button> </div> </div> </div> {
                /* FAQ Section */
            }

            <div className="faq-section" > <h2 className="faq-title" >Frequently Asked Questions</h2> <div className="faq-grid" > {
                faqs.map((faq, index) => (<div key={
                    index
                }

                    className="faq-item" > <button className={
                        `faq-question $ {
                        activeFaq===index ? 'active' : ''
                    }

                    `
                    }

                        onClick={
                            () => setActiveFaq(activeFaq === index ? null : index)
                        }

                    > <span> {
                        faq.question
                    }

                        </span> <span className="faq-icon" > {
                            activeFaq === index ? '−' : '+'
                        }

                        </span> </button> <div className={
                            `faq-answer $ {
                        activeFaq===index ? 'open' : ''
                    }

                    `
                        }

                        > <p> {
                            faq.answer
                        }

                        </p> </div> </div>))
            }

            </div> </div> {
                /* Social Connect */
            }

            <div className="social-section" > <h2 className="social-title" >Connect With Us</h2> <p className="social-subtitle" >Follow us on social media for updates and offers</p> <div className="social-links" > <a href="#" className="social-link facebook" >📘 Facebook</a> <a href="#" className="social-link instagram" >📷 Instagram</a> <a href="#" className="social-link twitter" >🐦 Twitter</a> <a href="#" className="social-link linkedin" >🔗 LinkedIn</a> </div> </div> </div> </div>);
}

    ;

export default Contact;