import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useBranches } from "../../../hooks/useBranches";
import "./BranchCreatePage.css";
import axios from "axios";
import { InteractiveMapInput } from "@/components/features/map";
import { Input } from "@heroui/input";
import { Autocomplete, AutocompleteItem, Select, SelectItem } from "@heroui/react";
import { Button, Modal, ModalContent, ModalHeader, ModalFooter,} from "@heroui/react";


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

  // ค้นหาจังหวัด/อำเภอ/ตำบล
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    { province: Province; district?: District; tambon?: Tambon }[]
  >([]);

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
        zipCode: postcode.trim() || undefined,
        province: selectedProvince?.name_th || undefined,
        district: selectedDistrict?.name_th || undefined,
        subDistrict: selectedTambon?.name_th || undefined,
        salesId: salesId ? parseInt(salesId) : undefined,
        supervisorId: supervisorId ? parseInt(supervisorId) : undefined,
        location: {                                             // สร้าง object location
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],      //ตามรูปแบบ GeoJSON
        },
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
        //fotmat as MPX-0000
        const formattedId = `MPX-${String((response.data.br_id ?? 0) + 1).padStart(4, "0")}`;
        setBranchCode(formattedId);
      } catch (error) {
        console.error("Failed to fetch branch code:", error);
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
        // Assuming the API returns an array of user names
        // Update managers state with the fetched supervisor data
        const supervisorData = supervisorRes.data.map((u: any) => ({
          id: u.usr_id,
          name: `${u.usr_firstName} ${u.usr_lastName}`,
          avatar: u.usr_avatar || null,
        }));
        setSupervisorList(supervisorData);
        setSupervisorId(
          supervisorData.length > 0 ? supervisorData[0].id.toString() : ""
        );

        // Update sales state with the fetched sales data
        const salesData = salesRes.data.map((u: any) => ({
          id: u.usr_id,
          name: `${u.usr_firstName} ${u.usr_lastName}`,
          avatar: u.usr_avatar || null,
        }));
        setSalesList(salesData);
        setSalesId(salesData.length > 0 ? salesData[0].id.toString() : "");
      } catch (error) {
        console.error("Failed to fetch users:", error);
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

  const next = (): void => {
    // Validation for step 1
    // if (step === 1) {
    //   if (!branchName.trim()) {
    //     alert("กรุณากรอกชื่อสาขา");
    //     return;
    //   }
    //   if (!supervisorId.trim()) {
    //     alert("กรุณาเลือกผู้ดูแลสาขา");
    //     return;
    //   }
    //   if (!salesId.trim()) {
    //     alert("กรุณาเลือกพนักงานขาย");
    //     return;
    //   }
    // }

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
    // if (step === 3) {
    //   if (!address.trim()) {
    //     alert("กรุณากรอกที่อยู่");
    //     return;
    //   }
    //   if (!provinceId) {
    //     alert("กรุณาเลือกจังหวัด");
    //     return;
    //   }
    //   if (!districtId) {
    //     alert("กรุณาเลือกอำเภอ");
    //     return;
    //   }
    //   if (!tambonId) {
    //     alert("กรุณาเลือกตำบล");
    //     return;
    //   }
    // }

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

          <Field label="รหัสสาขา:">
            <div className="input input--withIcon">
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

          <Field label="ชื่อของสาขา:">
            <Input
              required
              placeholder="กรอกชื่อสาขา"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)} /* บันทึกเวลา อัปเดตที่ branchName */
            />
          </Field>

          <Field label="ผู้ดูแล:">
            <Select 
              required
              placeholder="เลือกผู้ดูแล"
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
            >
              {supervisorList.map((m) => (
                <SelectItem key={m.id}>{m.name}</SelectItem>
              ))}
            </Select>
          </Field>

          <Field label="พนักงานขาย:">
            <Select 
              required
              placeholder="เลือกพนักงานขาย"
              value={salesId}
              onChange={(e) => setSalesId(e.target.value)}
            >
              {salesList.map((s) => (
                <SelectItem key={s.id}>{s.name}</SelectItem>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="card-title">สถานที่ตั้ง:</h2>
          <Field label="ค้นหาสถานที่:">
            <Input
              required
              placeholder="ค้นหา"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <ul className="bg-white shadow rounded-lg mt-2 max-h-48 overflow-auto border">
                {searchResults.map((r, i) => (
                  <li
                    key={i}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setProvinceId(r.province.id);
                      if (r.district) setDistrictId(r.district.id);
                      if (r.tambon) {
                        setTambonId(r.tambon.id);
                        setPostcode(r.tambon.zip_code);
                      }
                      setSearchQuery(
                        `${r.tambon?.name_th || ""} ${r.district?.name_th || ""} ${r.province.name_th}`
                      );
                      setSearchResults([]);
                    }}
                  >
                    {r.tambon?.name_th
                      ? `${r.tambon.name_th} → ${r.district?.name_th} → ${r.province.name_th}`
                      : r.district?.name_th
                      ? `${r.district.name_th} → ${r.province.name_th}`
                      : r.province.name_th}
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <div className="grid2">
            <Field label="ตำแหน่งละติจูด">
              <Input
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="เช่น 13.7563"
              />
            </Field>
            <Field label="ตำแหน่งลองจิจูด">
              <Input
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="เช่น 100.5018"
              />
            </Field>
          </div>

          {/* Interactive Map - Full width below inputs */}
          <div style={{ width: "100%", height: "260px", marginTop: "16px" }}>
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
            <Input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรอกที่อยู่ของสาขา"
            />
          </Field>
          <Field label="รหัสไปรษณีย์:">
            <Input
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="กรอกรหัสไปรษณีย์"
            />
          </Field>
          <Field label="จังหวัด:">
            <Autocomplete
              isRequired
              placeholder="เลือกจังหวัด"
              selectedKey={provinceId ? String(provinceId) : undefined}
              onSelectionChange={(key) => setProvinceId(key ? String(key) : "")}
            >
              {provinces.map((p) => (
                <AutocompleteItem key={p.id}>{p.name_th}</AutocompleteItem>
              ))}
            </Autocomplete>
          </Field>
          <Field label="อำเภอ:">
            <Autocomplete
              placeholder="เลือกอำเภอ"
              disabled={!provinceId}
              selectedKey={districtId ? String(districtId) : undefined}
              onSelectionChange={(key) => setDistrictId(key ? String(key) : "")}
            >
              {districtList.map((d) => (
                  <AutocompleteItem key={d.id}>{d.name_th}</AutocompleteItem>
                ))}
            </Autocomplete>
          </Field>
          <Field label="ตำบล:">
            <Autocomplete
              placeholder="เลือกตำบล"
              disabled={!districtId}
              selectedKey={tambonId ? String(tambonId) : undefined}
              onSelectionChange={(key) => setTambonId(key ? String(key) : "")}
              >
                {tambonList.map((t) => (
                <AutocompleteItem key={t.id}>{t.name_th}</AutocompleteItem>
                ))}
            </Autocomplete>
          </Field>
        </div>
      )}

      {/* Call to action */}
      <div className="cta">
        <Button
          className="btn-primary"
          onPress={next}
          isDisabled={loading}
          radius="lg"
        >
          {step < 3 ? "ถัดไป" : "ยืนยันการสร้าง"}
        </Button>
        <Button
          className="btn-link"
          onPress={back}
          isDisabled={loading}
          variant="light"
        >
          ย้อนกลับ
        </Button>
      </div>

      {/* Modal ยืนยัน */}
      <Modal
        isOpen={openModal}
        onOpenChange={setOpenModal}
        backdrop="blur"
        placement="center"
        hideCloseButton
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col items-center justify-center">
                <div className="modal-icon">
                  <CircleAlert size={61} className="icon-alert" strokeWidth={2.5} />
                </div>
                <h3 className="modal-title">ยืนยันการสร้างสาขาใหม่</h3>
              </ModalHeader>

              <ModalFooter className="modal-actions">
                <Button
                  className="btn-outline"
                  onPress={() => setOpenModal(false)}
                  isDisabled={loading}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="btn-accept"
                  onPress={confirmAndClose}
                  isDisabled={loading}
                >
                  ตกลง
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal สำเร็จ */}
      <Modal
        isOpen={showSuccess}
        onOpenChange={setShowSuccess}
        backdrop="blur"
        placement="center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col items-center justify-center">
                <div className="modal-icon">
                  <CircleCheck size={61} className="icon-alert" strokeWidth={2.5} />
                </div>
                <h3 className="modal-title">สร้างสาขาเสร็จสิ้น</h3>
              </ModalHeader>
              <ModalFooter className="modal-actions">
                <Button
                  className="btn-success"
                  onPress={() => nav("/branches")}
                >
                  รับทราบ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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
