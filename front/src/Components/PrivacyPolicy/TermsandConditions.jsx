import React, { useEffect, useState } from 'react';
import './TermsandConditions.css'; // Import the CSS file

const TermsandConditions = () => {

    const [effectiveDate, setEffectiveDate] = useState('');

  useEffect(() => {
    // Retrieve date from localStorage (or from props/API if preferred)
    const storedDate = localStorage.getItem('registrationDate');

    if (storedDate) {
      const dateObj = new Date(storedDate);
      const formatted = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
         hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setEffectiveDate(formatted);
    } else {
      // Fallback: use today's date
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setEffectiveDate(today);
    }
  }, []);

  return (
    <div className="terms-container">
      <h1>Terms and Conditions</h1>
      <p><strong>Effective Date:</strong> {effectiveDate}</p>
      <p>
        Welcome to <strong>HULAM-E</strong>, a platform designed exclusively for the University of Science and Technology of Southern Philippines (USTP) community to facilitate rentals and errands. By accessing and using our website and services, you agree to comply with the following Terms and Conditions.
      </p>

      <Section title="1. User Eligibility" items={[
        'Users must be officially affiliated with USTP (students, faculty, or staff).',
        'Accurate and up-to-date information is required during registration and use.',
      ]} />

      <Section title="2. Account Responsibilities" items={[
        'Users are solely responsible for maintaining the confidentiality of their login credentials.',
        'Any unauthorized use of an account must be reported to HULAM-E immediately.',
      ]} />

      <Section title="3. Rental and Errand Policies" items={[
        'All listings and transactions must comply with applicable USTP rules and regulations.',
        'Users are responsible for returning rented items in their original condition.',
        'Transactions between users are made at their own discretion and responsibility.',
      ]} />

      <Section title="4. Prohibited Activities" items={[
        'Posting illegal, offensive, or inappropriate content.',
        'Engaging in fraudulent, misleading, or harmful activities.',
        'Using the platform for non-USTP-related or non-educational purposes.',
      ]} />

      <Section title="5. Payment and Fees" items={[
        'HULAM-E does not process or facilitate any payments.',
        'All financial transactions are to be settled directly between users.',
      ]} />

      <Section title="6. Liability and Disclaimers" items={[
        'HULAM-E is not liable for any damage, loss, or dispute that may arise from interactions or transactions on the platform.',
        'Users engage with the platform and others at their own risk.',
      ]} />

      <Section title="7. Termination of Use" items={[
        'Violation of these terms may lead to account suspension or termination.',
        'HULAM-E reserves the right to remove any content that violates its policies or USTP guidelines.',
      ]} />

      <Section title="8. Amendments" items={[
        'These Terms and Conditions may be updated at any time.',
        'Continued use of the platform after changes indicates acceptance of the updated terms.',
      ]} />

      <p>If you have any questions or concerns, please contact the HULAM-E support team.</p>
    </div>
  );
};

const Section = ({ title, items }) => (
  <div className="section">
    <h2>{title}</h2>
    <ul>
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

export default TermsandConditions;
