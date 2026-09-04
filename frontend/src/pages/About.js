import React from 'react';
import './About.css';

const About = () => {
    const stats = [
        { value: '500+', label: 'Restaurants', icon: '🏪' },
        { value: '10k+', label: 'Daily Orders', icon: '📦' },
        { value: '50k+', label: 'Happy Customers', icon: '😊' },
        { value: '30 min', label: 'Avg Delivery Time', icon: '⏱️' }
    ];

    const team = [
        { name: 'John Doe', role: 'CEO & Founder', image: '/team1.jpg', bio: 'Visionary leader with 15+ years in food tech' },
        { name: 'Jane Smith', role: 'CTO', image: '/team2.jpg', bio: 'Tech expert passionate about innovation' },
        { name: 'Mike Johnson', role: 'Head of Operations', image: '/team3.jpg', bio: 'Ensuring smooth delivery operations' },
        { name: 'Sarah Williams', role: 'Customer Success', image: '/team4.jpg', bio: 'Committed to customer satisfaction' }
    ];

    const values = [
        { icon: '⚡', title: 'Fast Delivery', description: 'Quick and reliable delivery service' },
        { icon: '🍔', title: 'Quality Food', description: 'Best quality ingredients from top restaurants' },
        { icon: '💳', title: 'Secure Payments', description: 'Multiple secure payment options' },
        { icon: '🎉', title: 'Great Offers', description: 'Exclusive deals and discounts' }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1 className="hero-title">About FoodDelivery</h1>
                    <p className="hero-subtitle">
                        We're on a mission to connect people with the best food in their city
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="story-section">
                <div className="container">
                    <div className="story-content">
                        <div className="story-text">
                            <h2 className="section-title">Our Story</h2>
                            <p className="story-paragraph">
                                Founded in 2020, FoodDelivery started with a simple idea: to make great food accessible to everyone.
                                What began as a small delivery service has now grown into a platform connecting thousands of
                                restaurants with millions of happy customers.
                            </p>
                            <p className="story-paragraph">
                                We believe that good food has the power to bring people together. That's why we work tirelessly
                                to ensure that every order is delivered with care, speed, and a smile. Our technology-driven
                                approach ensures that you get your favorite meals hot and fresh, right at your doorstep.
                            </p>
                            <p className="story-paragraph">
                                Today, we're proud to be one of the fastest-growing food delivery platforms, but our mission
                                remains the same: to make every meal moment special.
                            </p>
                        </div>
                        <div className="story-image">
                            <div className="image-placeholder">🍔</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-icon">{stat.icon}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="mission-section">
                <div className="container">
                    <div className="mission-grid">
                        <div className="mission-card">
                            <div className="mission-icon">🎯</div>
                            <h3 className="mission-title">Our Mission</h3>
                            <p className="mission-text">
                                To deliver happiness through great food, connecting local restaurants with food lovers
                                while ensuring speed, quality, and convenience.
                            </p>
                        </div>
                        <div className="mission-card">
                            <div className="mission-icon">👁️</div>
                            <h3 className="mission-title">Our Vision</h3>
                            <p className="mission-text">
                                To become the most loved food delivery platform, revolutionizing how people discover
                                and enjoy food in their cities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="container">
                    <h2 className="section-title center">Our Core Values</h2>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-icon">{value.icon}</div>
                                <h3 className="value-title">{value.title}</h3>
                                <p className="value-description">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="container">
                    <h2 className="section-title center">Meet Our Team</h2>
                    <p className="section-subtitle">The passionate people behind FoodDelivery</p>
                    <div className="team-grid">
                        {team.map((member, index) => (
                            <div key={index} className="team-card">
                                <div className="team-image">
                                    <div className="image-placeholder">{member.name.charAt(0)}</div>
                                </div>
                                <h3 className="team-name">{member.name}</h3>
                                <p className="team-role">{member.role}</p>
                                <p className="team-bio">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-choose-us">
                <div className="container">
                    <h2 className="section-title center">Why Choose Us?</h2>
                    <div className="features-grid">
                        <div className="feature">
                            <div className="feature-icon">🚚</div>
                            <h3 className="feature-title">Fast Delivery</h3>
                            <p className="feature-description">Lightning-fast delivery with real-time tracking</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">🍽️</div>
                            <h3 className="feature-title">Wide Selection</h3>
                            <p className="feature-description">Choose from 500+ restaurants and cuisines</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">💰</div>
                            <h3 className="feature-title">Best Prices</h3>
                            <p className="feature-description">Exclusive deals and competitive pricing</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">🛡️</div>
                            <h3 className="feature-title">Secure Payments</h3>
                            <p className="feature-description">Multiple secure payment options</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">⭐</div>
                            <h3 className="feature-title">Quality Assurance</h3>
                            <p className="feature-description">Strict quality checks on every order</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">💬</div>
                            <h3 className="feature-title">24/7 Support</h3>
                            <p className="feature-description">Round-the-clock customer service</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to start ordering?</h2>
                        <p className="cta-text">Join thousands of happy customers who order with FoodDelivery every day</p>
                        <button className="cta-button">Order Now</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;