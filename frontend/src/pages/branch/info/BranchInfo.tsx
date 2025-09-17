import { useState } from "react";
import "./BranchInfo.css";

type TabType = "income" | "branch";
type HistoryTabType = "3months" | "6months" | "12months" | "3years" | "custom";

function BranchInfo(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("income");
  const [historyTab, setHistoryTab] = useState<HistoryTabType>("3months");

  return (
    <div>
      <div className="Title-Container">
        <div className="BranchHeader">
          <span className="BranchID">MXP-001</span>
          <div className="BranchExpress">
            <span className="dot"></span>
            ยอดพัสดุดีมาก
          </div>
        </div>
        <div className="BranchName">
          My Express 1 <br />
          สาขา ม.บูรพา
        </div>
        <div className="Tab-Container">
          <button
            onClick={() => setActiveTab("income")}
            className={`tab-button ${activeTab === "income" ? "active" : ""}`}
          >
            สถิติรายได้
          </button>
          <button
            onClick={() => setActiveTab("branch")}
            className={`tab-button ${activeTab === "branch" ? "active" : ""}`}
          >
            ข้อมูลสาขา
          </button>
        </div>
      </div>
      <div className="Tab-Content">
        {activeTab === "income" && (
          <div>
            <div className="Stat-Name">สถิติเดือนล่าสุด</div>
            <div className="Stat-Container">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">
                    ยอดพัสดุ
                    <span className="stat-unit">(ชิ้น)</span>
                  </div>
                  <div className="stat-date">ก.ค 2025</div>
                </div>
                <div className="stat-number">783</div>
                <div className="stat-footer">
                  <div className="stat-tag">
                    <span className="dot"></span>
                    ยอดพัสดุดีมาก
                  </div>
                  <div className="stat-percent">33.73% ↑</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">
                    รายได้
                    <span className="stat-unit">(บาท)</span>
                  </div>
                  <div className="stat-date">ก.ค 2025</div>
                </div>
                <div className="stat-number">7,830</div>
                <div className="stat-footer">
                  <div className="stat-tag2">ค่าประมาณการจากยอดพัสดุ</div>
                </div>
              </div>
            </div>
            <div className="Stat-Name">สถิติย้อนหลัง</div>
            <div className="full-card">
              <div className="fullcard-title">ยอดพัสดุย้อนหลัง</div>
              <div className="Tab-Container">
                <button
                  onClick={() => setHistoryTab("3months")}
                  className={`tab-button ${historyTab === "3months" ? "active" : ""}`}
                >
                  3 เดือน
                </button>
                <button
                  onClick={() => setHistoryTab("6months")}
                  className={`tab-button ${historyTab === "6months" ? "active" : ""}`}
                >
                  6 เดือน
                </button>
                <button
                  onClick={() => setHistoryTab("12months")}
                  className={`tab-button ${historyTab === "12months" ? "active" : ""}`}
                >
                  12 เดือน
                </button>
                <button
                  onClick={() => setHistoryTab("3years")}
                  className={`tab-button ${historyTab === "3years" ? "active" : ""}`}
                >
                  3 ปี
                </button>
                <button
                  onClick={() => setHistoryTab("custom")}
                  className={`tab-button ${historyTab === "custom" ? "active" : ""}`}
                >
                  ตั้งเอง
                </button>
              </div>
              <div className="graph">
                {historyTab === "3months" && <p>ข้อมูล 3 เดือนล่าสุด</p>}
                {historyTab === "6months" && <p>ข้อมูล 6 เดือนล่าสุด</p>}
                {historyTab === "12months" && <p>ข้อมูล 12 เดือนล่าสุด</p>}
                {historyTab === "3years" && <p>ข้อมูล 3 ปีล่าสุด</p>}
                {historyTab === "custom" && <p>ตั้งค่าปี</p>}
              </div>
            </div>
            <div className="Stat-Container">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">
                    ยอดต่ำสุด
                    <span className="stat-unit">(ชิ้น)</span>
                  </div>
                  <div className="stat-date">3 เดือนล่าสุด</div>
                </div>
                <div className="stat-number">450</div>
                <div className="stat-footer">
                  <div className="stat-lowest-value">พฤษภาคม 2025</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">
                    ยอดสูงสุด
                    <span className="stat-unit">(ชิ้น)</span>
                  </div>
                  <div className="stat-date">3 เดือนล่าสุด</div>
                </div>
                <div className="stat-number">793</div>
                <div className="stat-footer">
                  <div className="stat-highest-value">กรกฎาคม 2025</div>
                </div>
              </div>
            </div>
            <div className="Stat-Container">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">
                    ค่าเฉลี่ย
                    <span className="stat-unit-invisible">(ชิ้น)</span>
                  </div>
                  <div className="stat-date">3 เดือนล่าสุด</div>
                </div>
                <div className="stat-number">450</div>
                <div className="stat-footer">
                  <div className="stat-unit-avg">ชิ้น</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">
                    Std. Dev.
                    <span className="stat-unit">(ชิ้น)</span>
                  </div>
                  <div className="stat-date">3 เดือนล่าสุด</div>
                </div>
                <div className="stat-number">793</div>
                <div className="stat-footer">
                  <div className="stat-lowest-value">ค่าสูง</div>
                  <div className="stat-tag2">23% ของค่าเฉลี่ย</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "branch" && (
          <div>
            <h3>ข้อมูลสาขา</h3>
            <p>สาขา ม.บูรพา, My Express 1</p>
          </div>
        )}
      </div>
      <div style={{ height: "15vh", background: "#FCFCFC" }}></div>
    </div>
  );
}

export default BranchInfo;
