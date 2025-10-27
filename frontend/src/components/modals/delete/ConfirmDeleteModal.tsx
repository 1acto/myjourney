/*
 * ConfirmDeleteModal
 * Component Modal Delete
 * @author : Saowalak 66160380
 * @Create Date : 2025-10-24
 */

import { useState } from "react";
import "./deleteModal.css";

/**
 * โมดัลยืนยันการลบ
 * - open        : เปิด/ปิดโมดัล
 * - title       : ข้อความหัวข้อ (ค่าเริ่มต้น: "ยืนยันการลบ")
 * - placeholder : ข้อความใน textarea (ค่าเริ่มต้น: "กรุณาใส่หมายเหตุ . . .")
 * - onClose     : ฟังก์ชันเมื่อปิดโมดัล (กดฉากหลัง/ปุ่มยกเลิก/ปุ่มปิด)
 * - onConfirm   : ฟังก์ชันเมื่อกด "ตกลง" พร้อมเหตุผลที่กรอก (reason)
 */
type ConfirmDeleteModalProps = {
  open: boolean;
  title?: string;
  placeholder?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function ConfirmDeleteModal({
  open,
  title = "ยืนยันการลบ",
  placeholder = "กรุณาใส่หมายเหตุ . . .",
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  /**
   * เหตุผลที่ผู้ใช้กรอกใน textarea
   * - ใช้ตรวจว่ามีการกรอกก่อนกด "ตกลง" (ถ้าไม่มีจะ disabled)
   */
  const [reason, setReason] = useState("");

  // ถ้าไม่ได้สั่งให้เปิดโมดัล → ไม่ render อะไรเลย (คืนค่า null)
  if (!open) return null;

  /**
   * กด "ตกลง"
   * - ตัดช่องว่างหัวท้าย (trim) และตรวจว่ามีข้อความจริงไหม
   * - ส่งเหตุผลให้ผู้เรียกผ่าน onConfirm
   * - เคลียร์ค่า reason เพื่อพร้อมใช้งานครั้งต่อไป
   */
  const handleConfirm = () => {
    if (!reason.trim()) return; // กันเคสกดรัว ๆ โดยไม่มีข้อความ
    onConfirm(reason.trim());
    setReason("");
  };

  /**
   * ปิดโมดัลและรีเซ็ตค่า
   * - ใช้ทั้งตอนกดพื้นหลัง (overlay) และ "ยกเลิก"
   */
  const closeAndReset = () => {
    setReason("");
    onClose();
  };

  return (
    // ครอบทั้งหมดด้วย .delete-modal เพื่อ "สโคป" CSS แยกจากโมดัลอื่น
    <div className="delete-modal">
      {/* คลิก overlay = ปิดโมดัล */}
      <div
        className="modal-overlay"
        role="button"
        tabIndex={0}
        onClick={closeAndReset}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeAndReset();
        }}
      >
        {/* กันไม่ให้คลิกภายในการ์ดแล้วไปทริกเกอร์ overlay */}
        <div
          className="modal-card confirm"
          role="presentation"
          onClick={(e) => e.stopPropagation()}
        >
          {/* วงกลมไอคอนแจ้งเตือน */}
          <div className="modal-icon">!</div>

          {/* หัวข้อโมดัล (สไตล์กำหนดใน CSS) */}
          <h3 className="modal-title">{title}</h3>

          {/* กล่องข้อความสำหรับกรอกเหตุผลการลบ */}
          <textarea
            className="modal-textarea"
            placeholder={placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {/* ปุ่มคำสั่งด้านล่าง: ยกเลิก / ตกลง */}
          <div className="modal-actions">
            {/* ปุ่มยกเลิก: ปิดและเคลียร์ค่า */}
            <button className="btn btn-outline" onClick={closeAndReset}>
              ยกเลิก
            </button>

            {/* ปุ่มตกลง: ส่งเหตุผลกลับให้ผู้เรียก (ปิด/เปิด success modal ภายนอกเอง) */}
            <button
              className="btn btn-primary"
              disabled={!reason.trim()} // ปิดปุ่มถ้ายังไม่กรอก
              onClick={handleConfirm}
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
