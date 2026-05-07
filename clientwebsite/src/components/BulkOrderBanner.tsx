import React from 'react';
import './BulkOrderBanner.css';

const BulkOrderBanner: React.FC = () => {
  return (
    <section id="bulk-queries" className="bulk-banner-section">
      <div className="bulk-banner-overlay">
        <div className="bulk-banner-content">
          <div className="bulk-banner-left">
            <h2>GriDox BULK ORDERS</h2>
          </div>
          <div className="bulk-banner-center">
            <h3>PERFECT FOR EVENTS</h3>
          </div>
          <div className="bulk-banner-right">
            <p className="inquiry-text">FOR CORPORATE OR LARGE QUANTITY INQUIRIES</p>
            <p className="whatsapp-text">WHATSAPP +91 7428144338</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkOrderBanner;
