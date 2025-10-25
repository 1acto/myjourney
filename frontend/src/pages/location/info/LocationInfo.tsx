/*
* LocationInfo
* Component Modal Delete
* @author : Saowalak 661603780
* @Create Date : 2025-10-23
*/

import { useState } from "react";
import "./LocationInfo.css";
import { FiMoreHorizontal, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; 


/** ========================= โมดัลป๊อปอัพ (Component) =========================
 * ConfirmModal   : กล่อง "ยืนยันการลบ" ที่มี textarea ให้ใส่เหตุผล + ปุ่ม ยกเลิก/ตกลง
 * SuccessModal   : กล่อง "ลบสำเร็จ" ที่มีปุ่มเดียว "รับทราบ"
 * ========================================================================= */
import ConfirmModal from "@/components/modals/delete/ConfirmDeleteModal";
import SuccessModal from "@/components/modals/delete/SuccessDeleteModal";

function LocationInfo(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  /** สถานะเปิด/ปิดของโมดัล
   * showConfirm : true → แสดงกล่องยืนยันการลบ
   * showSuccess : true → แสดงกล่อง "ลบสถานที่เสร็จสิ้น"
   */
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate(); // ใช้สำหรับ redirect

  /** เรียกจากเมนู "ลบ"
   * - ปิดเมนู (สามจุด)
   * - เปิดกล่องยืนยันการลบ (ConfirmModal)
   */
  const openDeleteConfirm = () => {
    setMenuOpen(false);
    setShowConfirm(true);
  };

  /** กด "ตกลง" บน ConfirmModal
   * - พารามิเตอร์ reason จะเป็นเหตุผลที่ผู้ใช้กรอก
   * - ตรงนี้สามารถต่อ API ลบจริงได้ แล้วค่อยเปิด SuccessModal
   * - ตอนนี้เดโม: ปิด confirm → เปิด success
   */
  const handleConfirmDelete = (reason: string) => {
    // TODO: เรียก API ลบ (reason)
    setShowConfirm(false);
    setShowSuccess(true);
  };

  /** กด "รับทราบ" บน SuccessModal
   * - เปลี่ยนหน้าไป /poi ทันที
   */
  const handleAcknowledge = () => {
    navigate("/poi"); // เปลี่ยนหน้า
  };

  return (
    <div className="location-info">
      {/* Header */}
      <div className="location-header">
        <div className="header-left">
          <span className="tag">ร้านค้า</span>
          <div className="branch-title">
            Ollivanders: Makers of Fine Wands Since 382 B.C.
          </div>
        </div>

        <div className="header-right">
          <button
            className="icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FiMoreHorizontal size={22} />
          </button>

          <button className="icon-button close-btn">
            <FiX size={22} />
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <FiEdit2 className="dropdown-icon" />
                แก้ไข
              </div>
              <div className="dropdown-item delete" onClick={openDeleteConfirm}>
                <FiTrash2 className="dropdown-icon" />
                ลบ
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="branch-name">
        Ollivanders: Makers of Fine Wands Since 382 B.C.
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3 className="section-title">ข้อมูลเบื้องต้น</h3>

        {/* ประเภทสถานที่ */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">ประเภทสถานที่:</p>
            <span className="value">ร้านค้า</span>
          </div>
        </div>

        {/* ชื่อสถานที่ */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">ชื่อสถานที่:</p>
            <span className="value">Ollivanders: Makers of Fine Wands Since 382 B.C.</span>
          </div>
        </div>

        {/* คะแนน */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">คะแนน:</p>
            <span className="value">+10 แต้ม</span>
          </div>
        </div>

        {/* สร้างเมื่อ */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">สร้างเมื่อ:</p>
            <span className="InfoValue">
              04/08/2025 @ 15:26 น.{" "}
              <span className="info-by">โดย นายคลินตัน เมืองใจ</span>
            </span>
          </div>
        </div>

        {/* แก้ไขล่าสุด */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">แก้ไขล่าสุด:</p>
            <span className="InfoValue">
              04/08/2025 @ 15:26 น.{" "}
              <span className="info-by">โดย นายคลินตัน เมืองใจ</span>
            </span>
          </div>
        </div>

        {/* ที่อยู่ */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">ที่อยู่:</p>
            <span className="InfoValue">
              16/119 ถนนลงหาดบางแสน 3
              <div className="tag-container">
                <span className="tag">แสนสุข</span>
                <span className="tag">เมืองชลบุรี</span>
                <span className="tag">ชลบุรี</span>
              </div>
            </span>
          </div>
        </div>

        {/* รหัสไปรษณีย์ */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6Z"
                />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">รหัสไปรษณีย์:</p>
            <span className="value">20130</span>
          </div>
        </div>

        {/* ตำแหน่ง */}
        <div className="info-row">
          <div className="icon-wrapper">
            <span className="icon-symbol">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </span>
          </div>
          <div className="text-content">
            <p className="label">ตำแหน่ง:</p>
            <span className="InfoValue">
              ละติจูด:
              <span className="line">13.284613191857556</span>
            </span>
            <span className="InfoValue">
              ลองจิจูด:
              <span className="line">100.92369574570326</span>
            </span>
          </div>
        </div>
      </div>

      {/** ========================= ใช้งานโมดัลยืนยันลบสถานที่ป๊อปอัพ =========================
       * ConfirmModal props:
       * - open        : boolean เปิด/ปิด
       * - title       : ชื่อหัวข้อ
       * - placeholder : placeholder ของ textarea (เหตุผลการลบ)
       * - onClose     : ปิดกล่อง (เช่น กดพื้นหลัง/กดยกเลิก)
       * - onConfirm   : callback เมื่อกด "ตกลง" => ได้ reason (string)
       *
       * SuccessModal props:
       * - open        : boolean เปิด/ปิด
       * - title       : ข้อความแจ้งผล
       * - buttonText  : ปุ่มเดี่ยว (เช่น "รับทราบ")
       * - onClose     : callback ปิดกล่อง/เปลี่ยนหน้า
       *
       * Styling ปุ่ม:
       * - ปุ่ม "ตกลง/รับทราบ" ใช้ class "btn btn-primary" → สีมาจาก --pink (#F31260)
       * - ปุ่ม "ยกเลิก" ใช้ class "btn btn-outline" → สีขอบ --outline (#4D55A0)
       * - ถ้าสีไม่ขึ้น ให้เช็กว่า LocationInfo.css ถูก import แล้ว และไม่มี utility/inline style ไปทับ
       * ====================================================================== */}
      <ConfirmModal
        open={showConfirm}
        title="ยืนยันการลบสถานที่"
        placeholder="กรุณาใส่หมายเหตุ . . ."
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
      />

      <SuccessModal
        open={showSuccess}
        title="ลบสถานที่เสร็จสิ้น"
        buttonText="รับทราบ"
        onClose={handleAcknowledge}
      />
    </div>
  );
}

export default LocationInfo;
