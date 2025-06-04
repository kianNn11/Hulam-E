import React, { useState } from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const [accepted, setAccepted] = useState(false);
  const [acceptedDate, setAcceptedDate] = useState('');

  const handleAccept = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setAccepted(true);
    setAcceptedDate(formattedDate);

    // Optional: store it in localStorage
    localStorage.setItem('privacyAcceptedDate', now.toISOString());

    alert('Thank you for accepting the Privacy and Security Policy.');
  };

  return (
    <div className="policy-container">
      <h1>Privacy and Security</h1>

      <Section title="1. Information Collection" items={[
        'We collect personal data such as name, student ID, and contact details upon registration.',
        'User activity on the platform is logged for security and improvement purposes.'
      ]} />

      <Section title="2. Data Usage" items={[
        'Collected data is used to verify user identity, improve services, and maintain security.',
        'We do not sell or share user data with third parties without consent.'
      ]} />

      <Section title="3. Data Protection" items={[
        'We implement security measures to safeguard user data.',
        'Users are encouraged to use strong passwords and report suspicious activities.'
      ]} />

      <Section title="4. Third-Party Services" items={[
        'HULAM-E may integrate third-party services for additional features.',
        'We are not responsible for the data practices of external services.'
      ]} />

      <Section title="5. User Rights" items={[
        'Users can request access, modification, or deletion of their data.',
        'Data deletion requests may be subject to platform policies and regulations.'
      ]} />

      <Section title="6. Security Breach Notification" items={[
        'In the event of a data breach, affected users will be notified promptly.'
      ]} />

      <Section title="7. Changes to Policy" items={[
        'This Privacy and Security Policy may be updated as needed. Users will be informed of any significant changes.'
      ]} />

      <p className="final-text">
        By using HULAM-E, you acknowledge and agree to these Terms and Privacy Policies.
      </p>

      {!accepted && (
        <button className="accept-button" onClick={handleAccept}>
          I Accept
        </button>
      )}

      {accepted && (
        <p className="accepted-message">
          You have accepted the policy on <strong>{acceptedDate}</strong>.
        </p>
      )}
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

export default PrivacyPolicy;
