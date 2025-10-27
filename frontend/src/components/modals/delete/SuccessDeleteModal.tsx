/*
 * DeleteModal
 * Style Component Modal Delete
 * @author : Saowalak 66160380
 * @Create Date : 2025-10-24
 */

import "./deleteModal.css";

/**
 * โมดัลแจ้งผลสำเร็จ (ลบเสร็จ)
 * - open       : เปิด/ปิดโมดัล
 * - title      : ข้อความหัวข้อ (ดีฟอลต์ "ลบสถานที่เสร็จสิ้น")
 * - buttonText : ข้อความปุ่มเดี่ยว (ดีฟอลต์ "รับทราบ")
 * - onClose    : callback เวลากดปิด/กดปุ่ม/คลิกฉากหลัง (ผู้เรียกจะเป็นคน navigate เอง)
 */
type SuccessDeleteModalProps = {
  open: boolean;
  title?: string;
  buttonText?: string;
  onClose: () => void; // ผู้เรียกจะเป็นคน navigate/ปิดเอง
};

export default function SuccessDeleteModal({
  open,
  title = "ลบสถานที่เสร็จสิ้น",
  buttonText = "รับทราบ",
  onClose,
}: SuccessDeleteModalProps) {
  // ถ้าไม่เปิด → ไม่ render องค์ประกอบใด ๆ (ช่วยเรื่อง performance และไม่บังคลิก)
  if (!open) return null;

  return (
    // ใช้ .delete-modal เพื่อ "สโคป" สไตล์เฉพาะโมดัลลบ (ป้องกันชนกับโมดัลอื่น)
    <div className="delete-modal">
      {/* คลิก overlay = ปิดโมดัล (เรียก onClose) */}
      <div
        className="modal-overlay"
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        {/* กันคลิกภายในการ์ดไม่ให้ทะลุไปโดน overlay */}
        <div
          className="modal-card success"
          role="presentation"
          onClick={(e) => e.stopPropagation()}
        >
          {/* วงกลมไอคอนสถานะสำเร็จ */}
          <div className="modal-icon">✓</div>

          {/* หัวข้อ (สไตล์ปรับใน deleteModal.css; ถ้าไม่อยากหนา ดู .modal-title) */}
          <h3 className="modal-title">{title}</h3>

          {/* แถวปุ่มแบบปุ่มเดียว จัดกลาง */}
          <div className="modal-actions single">
            {/* ปุ่มหลักสี accent (กำหนดในไฟล์ CSS) */}
            <button className="btn btn-primary" onClick={onClose}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
