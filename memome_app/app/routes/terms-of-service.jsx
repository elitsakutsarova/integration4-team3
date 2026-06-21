import '../styles/modules/auth.css';
import { Link } from 'react-router';
import AuthBackButton from '../components/auth/AuthBackButton';
import { TERMS_SECTIONS } from '../data/termsOfServiceContent';
import { paths } from '../utils/appPaths';
import { createAccountAssets } from '../utils/createAccountAssets';

export function meta() {
  return [
    { title: 'MemMe — Terms of Service' },
    { name: 'description', content: 'MemMe terms of service and privacy policy.' },
  ];
}

function TermsHero() {
  return (
    <div className="auth-hero terms-hero">
      <div className="auth-hero__backdrop" aria-hidden="true">
        <img className="auth-hero__grid" src={createAccountAssets.grid} alt="" />
        <div className="auth-hero__accent-wrap">
          <img className="auth-hero__accent" src={createAccountAssets.accent} alt="" />
        </div>
      </div>
      <div className="terms-hero__nav">
        <AuthBackButton to={paths.register} label="Back to create account" />
      </div>
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="auth-page terms-page">
      <div className="auth-flow-shell terms-shell">
        <TermsHero />

        <header className="register-header terms-header">
          <div className="register-title-row">
            <h1 className="register-title">
              <span className="register-title-highlight">Terms of Service</span>
            </h1>
          </div>
          <p className="terms-lead">Please Read, We Beg You</p>
        </header>

        <div className="terms-content">
          {TERMS_SECTIONS.map(section => (
            <section key={section.title} className="terms-section">
              <h2 className="terms-section-title">{section.title}</h2>
              <p className="terms-section-body">{section.body}</p>
            </section>
          ))}

          <Link to={paths.register} className="terms-ack-btn">
            I have definitely read this
          </Link>
        </div>
      </div>
    </div>
  );
}
