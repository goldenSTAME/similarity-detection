// src/components/SupportWindow/SupportWindow.tsx
import React, { useState } from 'react';
import './SupportWindow.css';

const SupportWindow: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

    // Form state
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [topic, setTopic] = useState<string>('General Question');
    const [message, setMessage] = useState<string>('');
    const [attachScreenshot, setAttachScreenshot] = useState<boolean>(false);

    // Sample FAQs data
    const faqs = [
        {
            id: 1,
            question: "How do I upload an image for similarity search?",
            answer: "To upload an image, navigate to the 'Select Image' page, then either drag and drop your image onto the upload zone or click the 'Select Image' button to browse your files. The app currently supports JPEG format images. After uploading, you can click 'Search' to find similar items or 'Split and Search' to automatically detect and search for multiple clothing items in one image."
        },
        {
            id: 2,
            question: "What does the 'Split and Search' feature do?",
            answer: "The 'Split and Search' feature automatically detects individual clothing items within a single image, separates them into segments, and performs individual similarity searches for each detected item. This is useful when you have an outfit or multiple clothing pieces in one photo and want to search for each separately. The results will be organized by segments, showing matches for each detected item."
        },
        {
            id: 3,
            question: "How accurate are the similarity scores?",
            answer: "Similarity scores range from 0% to 100%, with higher percentages indicating greater similarity. Our algorithms analyze multiple aspects including color, pattern, shape, and texture. Scores above 90% generally indicate very close matches, while scores between 70-90% represent good matches with slight variations. The accuracy depends on image quality, lighting conditions, and the distinctiveness of the clothing item."
        },
        {
            id: 4,
            question: "Can I save or export my search results?",
            answer: "Yes, search results are automatically saved to your search history. You can access past searches in the History section. To export results, look for the Export button in the results view, which allows you to download the data in common formats like CSV or PDF. For administrative users, additional export options are available in the Admin panel."
        },
        {
            id: 5,
            question: "Why can't I see my previous searches after logging in again?",
            answer: "Search history is linked to your account. If you're not seeing previous searches, check that you're logged in with the same account. Search history is also stored in your browser's local storage, so clearing browser data or using a different device may result in history not being visible. For best results, ensure you're logged in with your account and haven't cleared browser data."
        },
        {
            id: 6,
            question: "What image formats are supported?",
            answer: "Currently, the application supports JPEG (.jpg, .jpeg) format images. Support for additional formats like PNG, WebP, and others is planned for future releases. For best results, use high-quality images with good lighting and minimal background clutter."
        },
        {
            id: 7,
            question: "How do I get access to the API?",
            answer: "API access is available for enterprise users. To request API access, please contact our sales team through the contact form on this page or email api@stylesentry.com. Include information about your intended use case and volume requirements. Our team will follow up with pricing details and documentation."
        },
        {
            id: 8,
            question: "How can I delete my account and data?",
            answer: "To delete your account, go to Settings > Account Management > Delete Account. This will permanently remove your account and all associated data including search history. Please note that deletion is irreversible. If you only want to clear search history without deleting your account, go to History and use the 'Clear All History' option."
        }
    ];

    // Sample tutorial topics
    const tutorials = [
        {
            id: 1,
            title: "Getting Started Guide",
            description: "Learn the basics of the application and how to perform your first search",
            icon: "book-open",
            color: "blue"
        },
        {
            id: 2,
            title: "Advanced Search Techniques",
            description: "Discover techniques to get more accurate and relevant search results",
            icon: "search",
            color: "purple"
        },
        {
            id: 3,
            title: "Using Split Image Search",
            description: "Learn how to search for multiple items in a single image",
            icon: "scissors",
            color: "green"
        },
        {
            id: 4,
            title: "Managing Search History",
            description: "Organize, filter, and leverage your search history effectively",
            icon: "clock",
            color: "yellow"
        },
        {
            id: 5,
            title: "Admin Panel Tutorial",
            description: "Complete guide for administrators on managing the system",
            icon: "shield-check",
            color: "red"
        },
        {
            id: 6,
            title: "API Integration Guide",
            description: "Technical documentation for developers integrating with our API",
            icon: "code",
            color: "indigo"
        }
    ];

    // Filter FAQs based on search query
    const filteredFaqs = searchQuery
        ? faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : faqs;

    // Handle form submission
    const handleSubmitMessage = () => {
        // In a real implementation, this would send the data to a server
        console.log({
            firstName,
            lastName,
            email,
            topic,
            message,
            attachScreenshot
        });

        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setTopic('General Question');
        setMessage('');
        setAttachScreenshot(false);

        // Show success message
        alert('Message sent! We will respond within 24 hours.');
    };

    // Function to render icons
    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case "book-open":
                return (
                    <svg className="support-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                );
            case "search":
                return (
                    <svg className="support-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                );
            case "scissors":
                return (
                    <svg className="support-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                    </svg>
                );
            case "clock":
                return (
                    <svg className="support-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case "shield-check":
                return (
                    <svg className="support-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case "code":
                return (
                    <svg className="support-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="support-window">
            {/* Header section */}
            <div className="support-header">
                <div className="support-header-content">
                    <h1>Help & Support</h1>
                    <p>Find answers to common questions and learn how to use our features</p>

                    <div className="support-search">
                        <input
                            type="text"
                            placeholder="Search for help topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="clear-search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="support-content">
                <div className="support-columns">
                    {/* Left column: FAQ Section */}
                    <div className="support-column">
                        <div className="section-header">
                            <h2>Frequently Asked Questions</h2>
                            <p>
                                Got a question? We've got answers. If you don't see what you're looking for, try the search above.
                            </p>
                        </div>

                        <div className="faq-list">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <div
                                        key={faq.id}
                                        className={`faq-item ${activeQuestion === faq.id ? 'active' : ''}`}
                                    >
                                        <button
                                            className="faq-question"
                                            onClick={() => setActiveQuestion(activeQuestion === faq.id ? null : faq.id)}
                                        >
                                            <h3>{faq.question}</h3>
                                            <svg
                                                className={`faq-arrow ${activeQuestion === faq.id ? 'rotated' : ''}`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {activeQuestion === faq.id && (
                                            <div className="faq-answer">
                                                <p>{faq.answer}</p>
                                                <div className="faq-helpful">
                                                    <button>
                                                        Was this helpful?
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3>No results found</h3>
                                    <p>
                                        We couldn't find any FAQs matching your search. Try with different keywords or browse all questions.
                                    </p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="view-all-button"
                                    >
                                        View all FAQs
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="contact-prompt">
                            <h3>Still need help?</h3>
                            <p>
                                Can't find what you're looking for? Contact our support team.
                            </p>
                            <div className="contact-buttons">
                                <a href="#email-support" className="contact-button secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email Support
                                </a>
                                <a href="#live-chat" className="contact-button primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Live Chat
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Video Tutorials and Contact Form */}
                    <div className="support-column">
                        <div className="section-header">
                            <h2>Tutorials & Resources</h2>
                            <p>
                                Learn how to use our features with step-by-step guides and tutorials
                            </p>
                        </div>

                        <div className="tutorials-grid">
                            {tutorials.map((tutorial) => (
                                <div
                                    key={tutorial.id}
                                    className={`tutorial-card ${tutorial.color}`}
                                >
                                    <div className="tutorial-icon">
                                        {renderIcon(tutorial.icon)}
                                    </div>
                                    <h3>{tutorial.title}</h3>
                                    <p>{tutorial.description}</p>
                                    <button className="tutorial-link">
                                        View Tutorial
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div id="email-support" className="contact-form">
                            <h3>Contact Support</h3>
                            <p>
                                Fill out this form and we'll get back to you within 24 hours.
                            </p>
                            <div className="form-grid">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="first-name">First name</label>
                                        <input
                                            type="text"
                                            id="first-name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="last-name">Last name</label>
                                        <input
                                            type="text"
                                            id="last-name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="topic">Topic</label>
                                    <select
                                        id="topic"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    >
                                        <option>General Question</option>
                                        <option>Technical Support</option>
                                        <option>Account Issues</option>
                                        <option>Feature Request</option>
                                        <option>Billing</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    ></textarea>
                                    <p className="form-help">
                                        Please describe your issue or question in detail
                                    </p>
                                </div>

                                <div className="form-group checkbox-group">
                                    <div className="checkbox-container">
                                        <input
                                            id="attach_screenshot"
                                            type="checkbox"
                                            checked={attachScreenshot}
                                            onChange={(e) => setAttachScreenshot(e.target.checked)}
                                        />
                                        <div>
                                            <label htmlFor="attach_screenshot">
                                                Attach screenshot
                                            </label>
                                            <p>Check this box if you'd like to include a screenshot with your next message</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        onClick={handleSubmitMessage}
                                        className="send-button"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA section */}
            <div className="cta-section">
                <div className="cta-content">
                    <h2>
                        <span>Ready to get started?</span>
                        <span className="cta-subtitle">Try our premium features today.</span>
                    </h2>
                    <div className="cta-buttons">
                        <a href="#" className="cta-button light">
                            Upgrade Now
                        </a>
                        <a href="#" className="cta-button dark">
                            Learn more
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportWindow;