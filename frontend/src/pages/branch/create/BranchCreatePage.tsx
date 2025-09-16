import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { CircleCheck } from "lucide-react";
import { useBranches } from "../../../hooks/useBranches";
import "./BranchCreatePage.css";

// Type definitions
interface Province {
  id: string;
  name_th: string;
  districts: District[];
}

interface District {
  id: string;
  name_th: string;
  tambons: Tambon[];
}

interface Tambon {
  id: string;
  name_th: string;
  zip_code: string;
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

interface StepperProps {
  current?: number;
  total?: number;
}

export default function BranchCreatePage(): JSX.Element {
  const nav = useNavigate();
  const { createBranch, loading, error } = useBranches();
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // step
  const [step, setStep] = useState<number>(1);

  // form state (step 1)
  const [branchName, setBranchName] = useState<string>("");
  const [branchCode] = useState<string>("MPX-0013"); // ล็อกไว้
  const [manager, setManager] = useState<string>("");
  const [sales, setSales] = useState<string>("");

  // form state (step 2 & 3)
  const [address, setAddress] = useState<string>("");
  const [postcode, setPostcode] = useState<string>("");

  const managers: string[] = [
    "นายออเทอร์ โวท์",
    "นางสาวจิระภา มณี",
    "นายทศพล ศรีทอง",
  ];
  const salesList: string[] = [
    "นายฮาลั่น มิวอิ้ง",
    "นางสาวอุบล พิชิต",
    "นายพชร สุขดี",
  ];

  // จังหวัด/อำเภอ/ตำบล (id)
  const [provinceId, setProvinceId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [tambonId, setTambonId] = useState<string>("");

  // รายการจังหวัดทั้งหมด
  const [provinces, setProvinces] = useState<Province[]>([]);

  // lat/lng
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  // modal
  const [openModal, setOpenModal] = useState<boolean>(false);

  const confirmAndClose = async (): Promise<void> => {
    try {
      // Get province, district, and tambon names from IDs
      const selectedProvince = provinces.find((p) => p.id === provinceId);
      const selectedDistrict = selectedProvince?.districts.find(
        (d) => d.id === districtId
      );
      const selectedTambon = selectedDistrict?.tambons.find(
        (t) => t.id === tambonId
      );

      const branchData = {
        name: branchName.trim(),
        address: address.trim(),
        postcode: postcode.trim() || undefined,
        lat: parseFloat(lat),
        long: parseFloat(lng),
        province: selectedProvince?.name_th || undefined,
        district: selectedDistrict?.name_th || undefined,
        subdistrict: selectedTambon?.name_th || undefined,
      };

      const result = await createBranch(branchData);

      if (result) {
        setOpenModal(false);
        setShowSuccess(true);
      } else {
        // API call failed, show error message
        const errorMessage =
          error || "เกิดข้อผิดพลาดในการสร้างสาขา กรุณาลองใหม่อีกครั้ง";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Failed to create branch:", error);
      alert("เกิดข้อผิดพลาดในการสร้างสาขา กรุณาลองใหม่อีกครั้ง");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json"
        );
        const data = await res.json();
        const provs: Province[] = (Array.isArray(data) ? data : []).map(
          (p: any) => ({
            id: String(p.id),
            name_th: p.name_th || p.name || "",
            districts: (p.amphure || p.amphures || p.district || []).map(
              (a: any) => ({
                id: String(a.id),
                name_th: a.name_th || a.name || "",
                tambons: (a.tambon || a.tambons || []).map((t: any) => ({
                  id: String(t.id),
                  name_th: t.name_th || t.name || "",
                  zip_code: t.zip_code || t.zip || "",
                })),
              })
            ),
          })
        );

        provs.sort((a, b) => a.name_th.localeCompare(b.name_th, "th"));
        provs.forEach((p) =>
          p.districts.sort((a, b) => a.name_th.localeCompare(b.name_th, "th"))
        );
        provs.forEach((p) =>
          p.districts.forEach((d) =>
            d.tambons.sort((a, b) => a.name_th.localeCompare(b.name_th, "th"))
          )
        );

        setProvinces(provs);
      } catch (e) {
        console.error("โหลดข้อมูลจังหวัดล้มเหลว:", e);
      }
    })();
  }, []);

  // อำเภอ/ตำบลตามที่เลือก
  const districtList: District[] = useMemo(() => {
    const p = provinces.find((x) => x.id === provinceId);
    return p ? p.districts : [];
  }, [provinces, provinceId]);

  const tambonList: Tambon[] = useMemo(() => {
    const d = districtList.find((x) => x.id === districtId);
    return d ? d.tambons : [];
  }, [districtList, districtId]);

  const next = (): void => {
    // Validation for step 1
    if (step === 1) {
      if (!branchName.trim()) {
        alert("กรุณากรอกชื่อสาขา");
        return;
      }
      if (!manager.trim()) {
        alert("กรุณาเลือกผู้ดูแลสาขา");
        return;
      }
      if (!sales.trim()) {
        alert("กรุณาเลือกพนักงานขาย");
        return;
      }
    }

    // Validation for step 2
    if (step === 2) {
      if (!lat.trim()) {
        alert("กรุณากรอกตำแหน่งละติจูด");
        return;
      }
      if (!lng.trim()) {
        alert("กรุณากรอกตำแหน่งลองจิจูด");
        return;
      }
      // Validate that lat/lng are valid numbers
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (isNaN(latNum) || isNaN(lngNum)) {
        alert("กรุณากรอกตำแหน่งละติจูดและลองจิจูดเป็นตัวเลข");
        return;
      }
      if (latNum < -90 || latNum > 90) {
        alert("ละติจูดต้องอยู่ระหว่าง -90 ถึง 90");
        return;
      }
      if (lngNum < -180 || lngNum > 180) {
        alert("ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180");
        return;
      }
    }

    // Validation for step 3
    if (step === 3) {
      if (!address.trim()) {
        alert("กรุณากรอกที่อยู่");
        return;
      }
      if (!provinceId) {
        alert("กรุณาเลือกจังหวัด");
        return;
      }
      if (!districtId) {
        alert("กรุณาเลือกอำเภอ");
        return;
      }
      if (!tambonId) {
        alert("กรุณาเลือกตำบล");
        return;
      }
    }

    if (step < 3) setStep((s) => s + 1);
    else setOpenModal(true); // เปิดโมดัลตอนกดบันทึก
  };

  const back = (): void => (step > 1 ? setStep((s) => s - 1) : nav(-1));

  return (
    <section className="create">
      {/* ปุ่มปิด (ขวาบน) */}
      <div className="header-bar">
        {/* หัวเรื่อง */}
        <h1 className="create-title">เพิ่มสาขาใหม่</h1>
        <button
          className="close-btn"
          aria-label="ปิด"
          onClick={() => nav("/branches")}
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

      {/* ฟอร์ม */}
      {step === 1 && (
        <div className="card">
          <h2 className="card-title">รายละเอียดของสาขา :</h2>

          <Field label="ชื่อของสาขา:">
            <input
              className="input"
              type="text"
              placeholder="กรอกชื่อสาขา"
              value={branchName}
              onChange={(e) =>
                setBranchName(e.target.value)
              } /* บันทึกเวลา อัปเดตที่ branchName */
            />
          </Field>

          <Field label="รหัสสาขา:">
            <div className="input input--withIcon">
              <span className="input-value">{branchCode}</span>
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

          <Field label="ผู้ดูแล:">
            <div className="select">
              <select
                value={manager}
                onChange={(e) => setManager(e.target.value)}
              >
                <option value="" disabled hidden>
                  เลือกผู้ดูแล
                </option>
                {managers.map((m) => (
                  <option key={m} value={m}>
                    {m}
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

          <Field label="พนักงานขาย:">
            <div className="select">
              <select value={sales} onChange={(e) => setSales(e.target.value)}>
                <option value="" disabled hidden>
                  เลือกพนักงานขาย
                </option>
                {salesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="card-title">สถานที่ตั้ง:</h2>
          <Field label="รหัสไปรษณีย์:">
            <input
              className="input"
              placeholder="กรอกรหัสไปรษณีย์"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </Field>
          <div className="grid2">
            <Field label="ตำแหน่งละติจูด">
              <input
                className="input"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="เช่น 13.7563"
              />
            </Field>
            <Field label="ตำแหน่งลองจิจูด">
              <input
                className="input"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="เช่น 100.5018"
              />
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2 className="card-title">สถานที่ตั้ง(ต่อ):</h2>

          <Field label="ที่อยู่:">
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรอกที่อยู่ของสาขา"
            />
          </Field>

          <Field label="รหัสไปรษณีย์:">
            <input
              className="input"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="กรอกรหัสไปรษณีย์"
            />
          </Field>

          <Field label="จังหวัด:">
            <div className="select">
              <select
                value={provinceId}
                onChange={(e) => {
                  setProvinceId(e.target.value);
                  setDistrictId("");
                  setTambonId("");
                }}
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_th}
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
                value={districtId}
                onChange={(e) => {
                  setDistrictId(e.target.value);
                  setTambonId("");
                }}
                disabled={!provinceId}
              >
                <option value="">เลือกอำเภอ</option>
                {districtList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_th}
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
                value={tambonId}
                onChange={(e) => setTambonId(e.target.value)}
                disabled={!districtId}
              >
                <option value="">เลือกตำบล</option>
                {tambonList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name_th}
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

          <div className="grid2">
            <Field label="ตำแหน่งละติจูด :">
              <input
                className="input"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </Field>

            <Field label="ตำแหน่งลองจิจูด :">
              <input
                className="input"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Call to action */}
      <div className="cta">
        <button className="btn-primary" onClick={next} disabled={loading}>
          {loading ? "กำลังประมวลผล..." : step < 3 ? "ถัดไป" : "ยืนยันการสร้าง"}
        </button>
        <button className="btn-link" onClick={back} disabled={loading}>
          ย้อนกลับ
        </button>
      </div>

      {/* Modal ยืนยัน + เบลอพื้นหลัง */}
      {openModal && (
        <div
          className="modal-overlay"
          onClick={() => setOpenModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <CircleAlert size={61} className="icon-alert" strokeWidth={2.5} />
            </div>
            <h3 id="confirm-title" className="modal-title">
              ยืนยันการสร้างสาขาใหม่
            </h3>
            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setOpenModal(false)}
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                className="btn-aceept"
                onClick={confirmAndClose}
                disabled={loading}
              >
                {loading ? "กำลังสร้าง..." : "ตกลง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div
          className="modal-overlay"
          role="alert"
          aria-live="polite"
          onClick={() => setShowSuccess(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {/* ไอคอน*/}
            <div className="modal-icon">
              <CircleCheck size={61} className="icon-alert" strokeWidth={2.5} />
            </div>

            {/* หัวข้อ */}
            <h3 id="confirm-title" className="modal-title">
              สร้างสาขาเสร็จสิ้น
            </h3>

            {/* ปุ่ม */}
            <div className="modal-actions">
              <button className="btn-success" onClick={() => nav("/branches")}>
                รับทราบ
              </button>
            </div>
          </div>
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
    <ol className="stepper" aria-label={`ขั้นตอน ${current} จาก ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = n == current;
        return (
          <li key={n} className={`step ${active ? "is-active" : ""}`}>
            <span className="dot">{n}</span>
            {n < total && <span className="bar" />}
          </li>
        );
      })}
    </ol>
  );
}
