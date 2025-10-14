import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useBranches } from "../../../hooks/useBranches";
import "./BranchCreatePage.css";
import axios from "axios";
import { InteractiveMapInput } from "@/components/features/map";

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
  const [branchCode, setBranchCode] = useState<string>("");
  const [supervisorId, setSupervisorId] = useState<string>("");
  const [salesId, setSalesId] = useState<string>("");
  const [salesList, setSalesList] = useState<
    { id: number; name: string; avatar: string | null }[]
  >([]);
  const [supervisorList, setSupervisorList] = useState<
    { id: number; name: string; avatar: string | null }[]
  >([]);

  // form state (step 2 & 3)
  const [address, setAddress] = useState<string>("");
  const [postcode, setPostcode] = useState<string>("");

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
        salesId: salesId ? parseInt(salesId) : undefined,
        supervisorId: supervisorId ? parseInt(supervisorId) : undefined,
      };

      const result = await createBranch(branchData);

      if (result) {
        setOpenModal(false);
        setShowSuccess(true);
      } else {
        const errorMessage =
          error || "เกิดข้อผิดพลาดในการสร้างสาขา กรุณาลองใหม่อีกครั้ง";
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Failed to create branch:", err);
      alert("เกิดข้อผิดพลาดในการสร้างสาขา กรุณาลองใหม่อีกครั้ง");
    }
  };

  useEffect(() => {
    // Fetch branch code
    const fetchBranchCode = async () => {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001";
      try {
        const response = await axios.get(
          `${API_BASE_URL}/branches/get/latest-id`
        );
        const rawId = response?.data?.br_id;
        const num = typeof rawId === "number" ? rawId : parseInt(String(rawId || 0), 10);
        const formattedId = `MPX-${String((num || 0) + 1).padStart(4, "0")}`;
        setBranchCode(formattedId);
      } catch (err) {
        console.error("Failed to fetch branch code:", err);
      }
    };

    // fetch sales and supervisors
    const fetchUsers = async () => {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001";
      try {
        const [supervisorRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/user/get/supervisor`),
          axios.get(`${API_BASE_URL}/user/get/sales`),
        ]);

        const supervisorData = supervisorRes.data.map((u: any) => ({
          id: u.usr_id,
          name: `${u.usr_firstname} ${u.usr_lastname}`,
          avatar: u.usr_avatar || null,
        }));
        setSupervisorList(supervisorData);
        setSupervisorId(
          supervisorData.length > 0 ? supervisorData[0].id.toString() : ""
        );

        const salesData = salesRes.data.map((u: any) => ({
          id: u.usr_id,
          name: `${u.usr_firstname} ${u.usr_lastname}`,
          avatar: u.usr_avatar || null,
        }));
        setSalesList(salesData);
        setSalesId(salesData.length > 0 ? salesData[0].id.toString() : "");
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    // Fetch provinces
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

    fetchBranchCode();
    fetchUsers();
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

  const isLatLngValid = (): boolean => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) return false;
    if (latNum < -90 || latNum > 90) return false;
    if (lngNum < -180 || lngNum > 180) return false;
    return true;
  };

  const next = (): void => {
    // Validation for step 1
    if (step === 1) {
      if (!branchName.trim()) {
        alert("กรุณากรอกชื่อสาขา");
        return;
      }
      if (!supervisorId.trim()) {
        alert("กรุณาเลือกผู้ดูแลสาขา");
        return;
      }
      if (!salesId.trim()) {
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
      if (!isLatLngValid()) {
        alert("ละติจูด/ลองจิจูดไม่ถูกต้อง");
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

  // Handle location change from interactive map
  const handleLocationChange = (newLat: number, newLng: number): void => {
    setLat(newLat.toString());
    setLng(newLng.toString());
  };

  return (
    <section className="create">
      {/* ปุ่มปิด/หัวเรื่อง */}
      <div className="header-bar">
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

      {/* ตัวนับขั้นตอน (ดีไซน์ตามภาพ) */}
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
              onChange={(e) => setBranchName(e.target.value)}
            />
          </Field>

          <Field label="รหัสสาขา:">
            <div className="input input--withIcon" aria-live="polite">
              <span className="text-gray-400">{branchCode}</span>
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
                value={supervisorId}
                onChange={(e) => setSupervisorId(e.target.value)}
              >
                <option value="" disabled hidden>
                  เลือกผู้ดูแล
                </option>
                {supervisorList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
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
              <select
                value={salesId}
                onChange={(e) => setSalesId(e.target.value)}
              >
                <option value="" disabled hidden>
                  เลือกพนักงานขาย
                </option>
                {salesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
              placeholder="กรอกรหัสไปรษณีย์ (ถ้ามี)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </Field>

          <div className="grid2">
            <Field label="ตำแหน่งละติจูด">
              <input
                className="input"
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="เช่น 13.7563"
              />
            </Field>
            <Field label="ตำแหน่งลองจิจูด">
              <input
                className="input"
                value={lng}
                id="long"
                onChange={(e) => setLng(e.target.value)}
                placeholder="เช่น 100.5018"
              />
            </Field>
          </div>

          <div style={{ width: "100%", height: "350px", marginTop: "16px" }}>
            <InteractiveMapInput
              lat={lat ? parseFloat(lat) : 13.7563}
              lng={lng ? parseFloat(lng) : 100.5018}
              onLocationChange={handleLocationChange}
              height="100%"
            />
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

          {lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) && (
            <InteractiveMapInput
              lat={parseFloat(lat)}
              lng={parseFloat(lng)}
              onLocationChange={handleLocationChange}
              height="300px"
            />
          )}
        </div>
      )}

      {/* Call to action */}
      <div className="cta">
        <button className="btn-primary" onClick={next} disabled={loading}>
          {loading ? "กำลังประมวลผล..." : step < 3 ? "ถัดไป" : "ยืนยันการสร้าง"}
        </button>
        <br />
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
            <div className="modal-icon">
              <CircleCheck size={61} className="icon-alert" strokeWidth={2.5} />
            </div>
            <h3 id="confirm-title" className="modal-title">
              สร้างสาขาเสร็จสิ้น
            </h3>
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

/** Stepper: ใช้คลาสเนมสเปซ stepper-* เพื่อกันชนกับสไตล์อื่น */
function Stepper({ current = 1, total = 3 }: StepperProps): JSX.Element {
  return (
    <ol className="stepper" aria-label={`ขั้นตอน ${current} จาก ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = n === current;
        const complete = n < current;
        return (
          <React.Fragment key={`s-${n}`}>
            <li className={`stepper-step ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}>
              <span className="stepper-dot">{n}</span>
            </li>
            {n < total && <li className="stepper-bar" />}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
