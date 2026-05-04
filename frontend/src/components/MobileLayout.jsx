import React from 'react';

const MobileLayout = ({ children }) => {
  return (
    <div className="mobile-layout">
      {children}
      <style>{`
        .mobile-layout {
          min-height: 100vh;
          padding-bottom: 70px; /* Space for bottom navigation */
        }

        @media (min-width: 769px) {
          .mobile-layout {
            padding-bottom: 0;
          }
        }

        /* Ensure content doesn't get hidden behind bottom nav */
        @media (max-width: 768px) {
          body {
            padding-bottom: env(safe-area-inset-bottom);
          }

          .ant-layout-content {
            padding-bottom: 80px !important;
          }

          /* Fix for iOS Safari bottom bar */
          @supports (-webkit-touch-callout: none) {
            .mobile-layout {
              padding-bottom: calc(70px + env(safe-area-inset-bottom));
            }
          }
        }
      `}</style>
    </div>
  );
};

export default MobileLayout;
