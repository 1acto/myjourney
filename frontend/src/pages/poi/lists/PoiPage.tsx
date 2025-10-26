import "./PoiPage.css";
import { FiChevronLeft, FiPlus, FiStar } from "react-icons/fi";
import { FaMusic } from "react-icons/fa";

function PoiPage(): JSX.Element {
  return (
    <div className="poi-container">
      {/* Header */}
      <div className="poi-header">
        <button className="icon-btn">
          <FiChevronLeft size={20} />
        </button>
        <h2 className="poi-title">My Memories</h2>
        <div className="header-right">
          <button className="icon-btn add-btn">
            <FiPlus size={18} />
          </button>
          <img
            src="https://randomuser.me/api/portraits/women/65.jpg"
            alt="profile"
            className="profile-pic"
          />
        </div>
      </div>

      {/* Section - Recent Highlight */}
      <div className="poi-section">
        <div className="section-header">
          <FaMusic className="section-icon highlight-icon" />
          <span>Recent Highlight</span>
        </div>

        <div className="poi-card">
          <img
            src="https://picsum.photos/400/200?random=1"
            alt="beach"
            className="poi-image"
          />
          <div className="poi-info">
            <div className="poi-name">ชายหาดบางแสน</div>
            <div className="poi-date">23 ตุลาคม 2568</div>
          </div>
        </div>
      </div>

      {/* Section - All Journey */}
      <div className="poi-section">
        <div className="section-header">
          <FiStar className="section-icon journey-icon" />
          <span>All Journey</span>
        </div>

        <div className="poi-card">
          <img
            src="https://picsum.photos/400/200?random=2"
            alt="beach"
            className="poi-image"
          />
          <div className="poi-info">
            <div className="poi-name">ชายหาดบางแสน</div>
            <div className="poi-date">23 ตุลาคม 2568</div>
          </div>
        </div>

        <div className="poi-card">
          <img
            src="https://picsum.photos/400/200?random=3"
            alt="mountain"
            className="poi-image"
          />
          <div className="poi-info">
            <div className="poi-name">อ่างเก็บน้ำบางพระ</div>
            <div className="poi-date">22 ตุลาคม 2568</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoiPage;
