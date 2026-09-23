import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import errorImage from '../assets/images/error.png';
export default function ErrorPage() {
  const { t } = useLanguage();
  const location = useLocation();

  // Extract error detail from query params if available
  const query = new URLSearchParams(location.search);
  const detail = query.get('detail');

  return (
    <div className="pim-error-screen-container">
      <style>{`
        .pim-error-screen-container {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-segoe);
          padding: 40px 20px;
        }

        .error-content-wrapper {
          display: flex;
          align-items: center;
          gap: 40px;
          max-width: 800px;
        }

        .error-screen-img {
          width: 160px;
          height: 160px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .error-text-container {
          display: flex;
          flex-direction: column;
        }

        .error-headline {
          font-size: 20px;
          font-weight: 600;
          color: #555555;
          margin-bottom: 8px;
        }

        .error-detail-tag {
          font-size: 16px;
          font-weight: 400;
          color: #777777;
          margin-left: 6px;
        }

        .error-subline {
          font-size: 16px;
          font-weight: 600;
          color: #555555;
          margin-bottom: 24px;
        }

        .red-text {
          color: #E24C4C;
          font-weight: 600;
        }

        .error-action-line {
          font-size: 16px;
          font-weight: 600;
          color: #555555;
        }

        .back-link {
          color: #018FE1;
          text-decoration: none;
          font-weight: 600;
        }

        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="error-content-wrapper">
        <img src={errorImage} alt="Error" className="error-screen-img" />

        <div className="error-text-container">
          <div className="error-headline">
            {t('errorScreen.unexpected')}
            {detail && <span className="error-detail-tag">[{detail}]</span>}
            {!detail && '.'}
          </div>

          <div className="error-subline">
            <span>{t('errorScreen.please')} </span>
            <span className="red-text">{t('errorScreen.contact')}</span>
          </div>

          <div className="error-action-line">
            <span>
              {t('errorScreen.or')}{' '}
              <Link to="/" className="back-link">
                {t('errorScreen.back')}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
