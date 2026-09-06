export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row align-items-center">
          {/* بخش چپ - طراحی و توسعه (وسط‌چین‌شده) */}
          <div className="col-md-6 order-last order-md-first">
            <div className="copyright text-center">
              <p className="credit-text">
                <span className="design-label">طراحی و توسعه توسط</span>
                <span className="divider-dot">-</span>
                <span className="developer-name">مهندس سیدمحمدحسین صادقی</span>
                <span className="divider-dot">-</span>
                <span className="job-title">کارشناس فناوری اطلاعات</span>
                <span className="divider-dot"></span>
                <span className="company-wrapper">
                  <span className="company-name">(واحد تحقیقات و هوشمندسازی</span>
                  <span className="divider-dot">-</span>
                  <span className="company-name">شرکت  سهامی آب منطقه‌ای اردبیل)</span>
                </span>
              </p>
            </div>
          </div>

          {/* بخش راست - لینک‌ها */}
          <div className="col-md-6">
            <div className="terms d-flex justify-content-center justify-content-md-end">
              <a href="#0" className="footer-link">حقوق نرم‌افزار</a>
              <span className="link-divider">|</span>
              <a href="#0" className="footer-link">سیاست‌ها و محرمانگی</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          padding: 16px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.02);
          direction: rtl;
        }

        .copyright {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .credit-text {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 3px;
          justify-content: center;
        }

        .design-label {
          font-size: 12px;
          color: #4f637e;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .divider-dot {
          color: #cbd5e1;
          font-size: 25px;
          margin: 0 3px;
          flex-shrink: 0;
        }

        .developer-name {
          font-weight: 600;
          color: #5a677c;
          font-size: 14px;
          white-space: nowrap;
          transition: color 0.2s;
        }

        .developer-name:hover {
          color: #3b82f6;
        }

        .job-title {
          font-size: 11px;
          color: #475569;
          font-weight: 400;
          white-space: nowrap;
          padding: 1px 6px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: transparent;
          line-height: 1.6;
        }

        .company-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          white-space: nowrap;
          flex-wrap: nowrap;
        }

        .company-name {
          font-size: 14px;
          color: #2563eb;
          font-weight: 500;
          white-space: nowrap;
          transition: color 0.2s;
        }

        .company-name:last-child {
          color: #1e40af;
        }

        .company-name:hover {
          color: #1d4ed8;
        }

        .footer-link {
          font-size: 11px;
          color: #64748b;
          text-decoration: none;
          transition: all 0.25s ease;
          padding: 3px 6px;
          white-space: nowrap;
          border-radius: 6px;
        }

        .footer-link:hover {
          color: #2563eb;
          background: rgba(37, 99, 235, 0.06);
        }

        .link-divider {
          color: #cbd5e1;
          font-size: 13px;
          margin: 0 3px;
        }

        .terms {
          gap: 2px;
          align-items: center;
        }

        /* ========== ریسپانسیو ========== */
        @media (max-width: 992px) {
          .credit-text {
            font-size: 12px;
            gap: 2px;
          }

          .developer-name {
            font-size: 13px;
          }

          .company-name,
          .job-title {
            font-size: 10px;
          }
        }

        @media (max-width: 768px) {
          .footer {
            padding: 14px 0;
          }

          .credit-text {
            font-size: 11px;
            gap: 2px;
          }

          .developer-name {
            font-size: 12px;
          }

          .job-title {
            font-size: 10px;
            padding: 0 5px;
          }

          .company-name {
            font-size: 10px;
          }

          .design-label {
            font-size: 10px;
          }

          .divider-dot {
            font-size: 6px;
            margin: 0 2px;
          }

          .terms {
            margin-top: 8px;
            justify-content: center !important;
          }

          .footer-link {
            font-size: 10px;
            padding: 2px 4px;
          }

          .link-divider {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .footer {
            padding: 12px 0;
          }

          .credit-text {
            font-size: 10px;
            gap: 1px;
          }

          .developer-name {
            font-size: 11px;
          }

          .job-title {
            font-size: 9px;
            padding: 0 4px;
            border-width: 0.5px;
          }

          .company-name {
            font-size: 9px;
          }

          .design-label {
            font-size: 9px;
          }

          .divider-dot {
            font-size: 5px;
            margin: 0 1px;
          }

          .company-wrapper {
            gap: 1px;
          }

          .footer-link {
            font-size: 9px;
            padding: 2px 3px;
          }

          .link-divider {
            font-size: 10px;
            margin: 0 2px;
          }
        }
      `}</style>
    </footer>
  );
};
