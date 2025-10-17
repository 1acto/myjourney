import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LocationsEditPage.css";
import Swal from "sweetalert2";

interface Province {
  id: number;
  name_th: string;
}

interface District {
  id: number;
  name_th: string;
  province_id: number;
}

interface Subdistrict {
  id: number;
  name_th: string;
  amphure_id: number;
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

interface StepperProps {
  current?: number;
  total?: number;
}

export default function LocationEditPage(): JSX.Element {
  const nav = useNavigate();

  // step
  const [step, setStep] = useState<number>(1);

  // form state (step 1)
  const [locationName, setLocationName] = useState<string>("Shironeko Cafe");
  const [tagLocation, setTagLocation] = useState<string>("ร้านค้า");
  const [editor] = useState<string>("Yo MrWhite (You)"); // ล็อกไว้

  const managers: string[] = [
    "ร้านค้า",
    "โรมแรม",
    "โรงเรียน",
    "ไปษณีย์",
    "คู่แข่ง"
  ];


  // เก็บค่าจังหวัดที่ผู้ใช้เลือก
  const [province, setProvince] = useState<number | "">("");

  // เก็บรายการจังหวัดทั้งหมดจาก API
  const [provinces, setProvinces] = useState<Province[]>([]);

  // State ของอำเภอ
  const [district, setDistrict] = useState<number | "">("");
  const [districts, setDistricts] = useState<District[]>([]);

  // State ของตำบล
  const [subdistrict, setSubdistrict] = useState<number | "">("");
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

  const [text, setText] = useState<string>("");
  const [showButton, setShowButton] = useState<boolean>(true); // ปุ่มถัดไป/ยืนยัน

  //จังหวัด
  useEffect(() => {
    (async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json"
      );
      const data: Province[] = await res.json();
      setProvinces(data.map((p) => ({ id: p.id, name_th: p.name_th })));
    })();
  }, []);

  // อำเภอ
  useEffect(() => {
    if (!province) {
      setDistricts([]);
      setDistrict("");
      return;
    }
    (async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json"
      );
      const data: District[] = await res.json();
      const filtered = data
        .filter((a) => a.province_id === province) // ✅ ใช้ province_id
        .map((a) => ({
          id: a.id,
          name_th: a.name_th,
          province_id: a.province_id,
        }));
      setDistricts(filtered);
      setDistrict("");
    })();
  }, [province]);

  // ตำบล
  useEffect(() => {
    if (!district) {
      setSubdistricts([]);
      setSubdistrict("");
      return;
    }
    (async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json"
      );
      const data: Subdistrict[] = await res.json();
      const filtered = data
        .filter((t) => t.amphure_id === district) // ✅ ใช้ amphure_id
        .map((t) => ({
          id: t.id,
          name_th: t.name_th,
          amphure_id: t.amphure_id,
        }));
      setSubdistricts(filtered);
      setSubdistrict("");
    })();
  }, [district]);

  //การเลื่อนหน้าจอ
  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY; // ขอบล่างของ viewport
      const pageHeight = document.documentElement.scrollHeight; // ความสูงทั้งหมดของหน้า

      if (scrollBottom + 100 >= pageHeight) {
        // เลื่อนใกล้สุดท้าย 100px
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const next = (): void => {
    if (step === 1 && !locationName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อสาขา",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      // step === 3 -> Confirm ก่อนบันทึก
      Swal.fire({
        title: "ยืนยันการแก้ไขข้อมูล",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#F5A524",
        cancelButtonColor: "rgba(146, 146, 146, 1)",
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
      }).then((result: any) => {
        if (result.isConfirmed) {
          // ทำการบันทึกข้อมูลจริง (เช่น API)
          Swal.fire({
            title: "การแก้ไขสถานที่เรียบร้อย",
            icon: "success",
            iconColor: "#F5A524",
            confirmButtonText: "รับทราบ",
            confirmButtonColor: "#F5A524",
          });

          // กลับหน้าหลัก
          nav("/branches"); /*Frank*/ /*คาดว่าต้องเป็นPathก่อนหน้า เช่น locations*/
        }
      });
    }
  };

  const back = (): void => (step > 1 ? setStep((s) => s - 1) : nav(-1));

  return (
    <section className="edit">
      {/* Header bar */}
      <div className="header-bar">
        {/* หัวเรื่อง */}
        <h1 className="edit-title">แก้ไขสถานที่</h1>
        {/* ปุ่มปิด (ขวาบน) */}
        <button
          className="close-btn"
          aria-label="ปิด"
          onClick={() => nav("/branches")} /*Frank */
        >
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* ตัวนับขั้นตอน */}
      <Stepper current={step} total={3} />

      {/* ฟอร์ม (แสดงตามขั้น) */}
      {step === 1 && (
        <div className="card">
          <h2 className="card-title">รายละเอียดของสถานที่ :</h2>

          <Field label="ชื่อของสถานที่:">
            <input
              className="input"
              type="text"
              placeholder="กรอกชื่อสาขา" /*Frank*/
              value={locationName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLocationName(e.target.value)
              } /* บันทึกเวลา อัปเดตที่ locationName */
            />
          </Field>

          <Field label="แท็ก:">
            <div className="select">
              <select
                value={tagLocation}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setTagLocation(e.target.value)
                }
              >
                <option value="" disabled hidden>
                  เลือกแท็ก
                </option>
                {managers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              
            </div>
          </Field>

          <Field label="ผู้แก้ไข:">
            <div className="input input--withIcon">
              <span className="input-value">{editor}</span> 
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M7 11h10v8H7v-8zm2 0V8a3 3 0 016 0v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Field>

          <Field label="หมายเหตุ*">
            <div className="text-box">
              <textarea
                value={text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setText(e.target.value)
                }
                style={{ width: "full", height: "138px" }}
                className="border border-gray-400 rounded-lg p-2 w-full"
                placeholder="กรุณาใส่เหตุผล..."
              />
            </div>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="card-title">สถานที่ตั้ง:</h2>
          <Field label="รหัสไปรษณีย์:">
            <input className="input" placeholder="กรอกรหัสไปรษณีย์" />
          </Field>
          <div className="grid2">
            <Field label="ตำแหน่งละติจูด">
              <input className="input" />
            </Field>
            <Field label="ตำแหน่งลองจิจูด">
              <input className="input" />
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2 className="card-title">สถานที่ตั้ง(ต่อ):</h2>

          <Field label="ที่อยู่:">
            <input className="input" />
          </Field>

          <Field label="รหัสไปรษณีย์:">
            <input className="input" />
          </Field>

          <Field label="จังหวัด:">
            <div className="select">
              <select
                value={province}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setProvince(Number(e.target.value))
                }
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_th} {/*ใช้ชื่อจังหวัด */}
                  </option>
                ))}
              </select>
              <span className="chev" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </Field>

          <Field label="อำเภอ:">
            <div className="select">
              <select
                value={district}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDistrict(Number(e.target.value))
                }
                disabled={!province}
              >
                <option value="">เลือกอำเภอ</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_th} {/*ใช้ชื่ออำเภอ */}
                  </option>
                ))}
              </select>
              <span className="chev" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </Field>

          <Field label="ตำบล:">
            <div className="select">
              <select
                value={subdistrict}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSubdistrict(Number(e.target.value))
                }
                disabled={!district}
              >
                <option value="">เลือกตำบล</option>
                {subdistricts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_th} {/*ใช้ชื่อตำบล */}
                  </option>
                ))}
              </select>
              <span className="chev" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </Field>

          <Field label="คะแนน:">
            <input className="input" />
          </Field>

        </div>
      )}

      {/* แถบปุ่มล่าง */}
      {showButton && (
        <div
          className="cta"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translatex(-50%)",
          }}
        >
          <button className="btn-primary" onClick={next}>
            {step < 3 ? "ถัดไป" : "ยืนยันการแก้ไข"}
          </button>
          <button className="btn-link" onClick={back}>
            ย้อนกลับ
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- Helpers ---------- */
function Field({ label, children }: FieldProps): JSX.Element {
  return (
    <label className="field">
      <div className="field-label">{label}</div>
      {children}
    </label>
  );
}

function Stepper({ current = 1, total = 3 }: StepperProps): JSX.Element {
  return (
    <ol className="step-edit" aria-label={`ขั้นตอน ${current} จาก ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = n == current;
        return (
          <li key={n} className={`step-edit ${active ? "is-active" : ""}`}>
            <span className="dot">{n}</span>
            {n < total && <span className="bar" />}
          </li>
        );
      })}
    </ol>
  );
}
