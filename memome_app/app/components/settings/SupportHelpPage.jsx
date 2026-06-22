// Support hub: FAQs and links to feedback / technical support.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { goBack, paths } from '../../utils/appPaths';
import { SUPPORT_HELP_FAQS, SUPPORT_TECHNICAL_EMAIL } from '../../data/supportHelpFaqs';
import { settingsAssets } from '../../utils/settingsAssets';
import SettingsSubpageHeader from './SettingsSubpageHeader';

function SectionLabel({ children, className = '', id }) {
  return (
    <h2 id={id} className={`support-help-section-label ${className}`.trim()}>
      <span className="support-help-section-underline" aria-hidden="true" />
      {children}
    </h2>
  );
}

function FaqChevron({ open }) {
  return (
    <svg
      className={`support-faq-chevron${open ? ' support-faq-chevron--open' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      width="7"
      height="13"
      viewBox="0 0 7 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.72168 7.22211L1.34415 13L0 11.5558L4.70546 6.5L0 1.44422L1.34415 0L6.72168 5.77789C6.89989 5.96943 7 6.22917 7 6.5C7 6.77083 6.89989 7.03057 6.72168 7.22211Z"
        fill="#797979"
      />
    </svg>
  );
}

function RowChevron() {
  return (
    <svg className="support-help-row-chevron" xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.72168 7.22211L1.34415 13L0 11.5558L4.70546 6.5L0 1.44422L1.34415 0L6.72168 5.77789C6.89989 5.96943 7 6.22917 7 6.5C7 6.77083 6.89989 7.03057 6.72168 7.22211Z" fill="#797979" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M14 0H2C0.9 0 0 0.9 0 2V16L4 12H14C15.1 12 16 11.1 16 10V2C16 0.9 15.1 0 14 0ZM14 10H3.17L2 11.17V2H14V10ZM9 5H7V7H9V5ZM11 5H13V7H11V5ZM5 5H3V7H5V5Z" fill="#797979" />
    </svg>
  );
}

function FaqItem({ item, open, onToggle }) {
  const panelId = `support-faq-${item.id}`;

  return (
    <div className="support-faq-item">
      <button
        type="button"
        className="support-faq-question"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="support-faq-question-text">{item.question}</span>
        <FaqChevron open={open} />
      </button>
      {open ? (
        <p id={panelId} className="support-faq-answer">
          {item.answer}
        </p>
      ) : null}
    </div>
  );
}

export default function SupportHelpPage() {
  const navigate = useNavigate();
  const [openFaqId, setOpenFaqId] = useState(null);

  function handleBack() {
    goBack(navigate, paths.profileSettings);
  }

  function toggleFaq(id) {
    setOpenFaqId((current) => (current === id ? null : id));
  }

  const technicalSupportHref = `mailto:${SUPPORT_TECHNICAL_EMAIL}?subject=${encodeURIComponent('MemoMe technical support')}`;

  return (
    <div className="settings-page support-help-page">
      <SettingsSubpageHeader
        title="Support & Help"
        onBack={handleBack}
        backLabel="Back to settings"
        titleIcon={<img src={settingsAssets.supportIcon} alt="Support and help icon" />}
      />

      <div className="support-help-content">
        <section className="support-help-section" aria-labelledby="support-faqs-heading">
          <SectionLabel id="support-faqs-heading">FAQs</SectionLabel>
          <div className="support-help-box">
            {SUPPORT_HELP_FAQS.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                open={openFaqId === item.id}
                onToggle={() => toggleFaq(item.id)}
              />
            ))}
          </div>
        </section>

        <section className="support-help-section" aria-labelledby="support-links-heading">
          <SectionLabel id="support-links-heading" className="support-help-section-label--wide">Support</SectionLabel>
          <div className="support-help-box">
            <Link to={paths.profileSettingsFeedback} className="support-help-row">
              <span className="support-help-row-icon">
                <FeedbackIcon />
              </span>
              <span className="support-help-row-label">Send feedback</span>
              <RowChevron />
            </Link>
            <a href={technicalSupportHref} className="support-help-row">
              <span className="support-help-row-icon">
                <img src={settingsAssets.technicalSupportIcon} alt="Technical support icon" width={17} height={17} aria-hidden="true" />
              </span>
              <span className="support-help-row-label">Get technical support</span>
              <RowChevron />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
