import React, { useState } from 'react';
import './TermsModal.css';
import logo from '../Assets/logo.png';

const TermsModal = ({ onAccept, onClose }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleAccept = () => {
        if (isChecked) {
            onAccept();
        }
    };

    return (
        <div className="terms-modal-overlay" onClick={onClose}>
            <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
                <img src={logo} alt="HULAM-E Logo" className="terms-logo" />
                <h1>Terms and Conditions</h1>

                <div className="terms-text">
                    <p>Welcome to HULAM-E, a platform designed for the USTP community to facilitate rentals and errands. By accessing and using our website, you agree to comply with these Terms and Conditions.</p>

                    <h4>1. User Eligibility</h4>
                    <ul>
                        <li>Users must be affiliated with USTP.</li>
                        <li>Users must provide accurate and up-to-date information during registration.</li>
                    </ul>

                    <h4>2. Account Responsibilities</h4>
                    <ul>
                        <li>Users are responsible for maintaining the confidentiality of their account credentials.</li>
                        <li>Any unauthorized use of an account must be reported immediately.</li>
                    </ul>

                    <h4>3. Rental and Errand Policies</h4>
                    <ul>
                        <li>All listings must comply with USTP regulations.</li>
                        <li>Users must ensure that rented items are returned in their original condition.</li>
                        <li>Transactions between users are their sole responsibility.</li>
                    </ul>

                    <h4>4. Prohibited Activities</h4>
                    <ul>
                        <li>Posting illegal or inappropriate content.</li>
                        <li>Engaging in fraudulent activities.</li>
                        <li>Misuse of the platform for non-educational purposes.</li>
                    </ul>

                    <h4>5. Payment and Fees</h4>
                    <ul>
                        <li>HULAM-E does not facilitate payments but provides a platform for listings and communications.</li>
                        <li>Any monetary transactions between users are their responsibility.</li>
                    </ul>

                    <h4>6. Liability and Disclaimers</h4>
                    <ul>
                        <li>HULAM-E is not responsible for damages, losses, or disputes arising from user interactions.</li>
                        <li>Users engage with others at their own risk.</li>
                    </ul>

                    <h4>7. Termination of Use</h4>
                    <ul>
                        <li>Violation of these terms may result in account suspension or termination.</li>
                        <li>HULAM-E reserves the right to remove content that violates its policies.</li>
                    </ul>

                    <h4>8. Amendments</h4>
                    <p>These Terms may be updated periodically. Continued use of the platform signifies acceptance of any changes.</p>
                </div>

                <div className="terms-checkbox">
                    <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={isChecked}
                        onChange={() => setIsChecked(!isChecked)}
                    />
                    <label htmlFor="agreeTerms">I have read and agree to the Terms and Conditions</label>
                </div>

                <div className="terms-modal-buttons">
                    <button onClick={handleAccept} disabled={!isChecked}>
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
