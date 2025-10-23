import React, { ReactNode } from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./BranchCreatePage.css";
import axios from "axios";
import { InteractiveMapInput } from "@/components/features/map";
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import getCurrentUser from "@/queryOption/users/getCurrentUserQueryOption";

//icons import
import { LuLock, LuX } from "react-icons/lu";
import { AiFillInfoCircle } from "react-icons/ai";
import { HiCheckCircle, HiQuestionMarkCircle } from "react-icons/hi";

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

export default function BranchCreatePage() {
  const nav = useNavigate();

  // step
  const [step, setStep] = useState<number>(1);

  // form state (step 1)
  const [branchName, setBranchName] = useState<string>("");
  const [branchCode, setBranchCode] = useState<string>("");
  const [displayCode, setDisplayCode] = useState<string>("");
  const [branchEmail, setBranchEmail] = useState<string>("");
  const [createdById, setCreatedById] = useState<string>("");
  const [supervisorId, setSupervisorId] = useState<string>("");
  const [salesId, setSalesId] = useState<string>("");
  const [salesList, setSalesList] = useState<
    {
      lastName: ReactNode;
      firstName: ReactNode;
      id: number;
      name: string;
      avatar: string | null;
    }[]
  >([]);
  const [supervisorList, setSupervisorList] = useState<
    {
      lastName: ReactNode;
      firstName: ReactNode;
      id: number;
      name: string;
      avatar: string | null;
    }[]
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

  // * state modal
  const [confirm, setConfirm] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  // * modal function
  function ErrorModal(error: string): void {
    setShowErrorModal(true);
    setError(error);
  }

  // * Fetching current user
  const { data: currentUserData, error: currentUserError } = useQuery(getCurrentUser());
  useEffect(() => {
    if (currentUserError) {
      console.error("Failed to fetch current user:", currentUserError);
    }
    if (currentUserData) {
      setCreatedById(currentUserData.id);
    }
  }, [currentUserData, currentUserError]);

  // * อำเภอ/ตำบลตามที่เลือก
  const districtList: District[] = useMemo(() => {
    const p = provinces.find((x) => x.id === provinceId);
    return p ? p.districts : [];
  }, [provinces, provinceId]);
  const tambonList: Tambon[] = useMemo(() => {
    const d = districtList.find((x) => x.id === districtId);
    return d ? d.tambons : [];
  }, [districtList, districtId]);

  // Find latest branch code and return next code
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/branches/get/latest-id`,
        );
        const code = res.data.nextCode;
        setBranchCode(code);
        setDisplayCode(`MPX-${code}`);
      } catch (err) {
        console.error("ไม่สามารถดึงรหัสสาขาได้", err);
      }
    })();
  }, []);

  // ดึงรายชื่อผู้ดูแล
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/get/supervisor`,
        );
        setSupervisorList(res.data);
      } catch (err) {
        console.error("ไม่สามารถดึงผู้ดูแลได้", err);
      }
    })();
  }, []);

  // ดึงรายชื่อพนักงานขาย
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/get/sales`,
        );
        setSalesList(res.data);
      } catch (err) {
        console.error("ไม่สามารถดึงพนักงานขายได้", err);
      }
    })();
  }, []);

  // ค้นหาสถานที่ จังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์
  const [thaiSearch, setThaiSearch] = useState("");
  const [thaiResults, setThaiResults] = useState<any[]>([]);
  // State สำหรับ autocomplete ไทย
  const handleThaiSearch = (value: string) => {
    setThaiSearch(value);
    if (value.length < 2) {
      setThaiResults([]);
      return;
    }

    let results: any[] = [];
    provinces.forEach((p) => {
      p.districts.forEach((d) => {
        d.tambons.forEach((t) => {
          if (
            t.name_th.includes(value) ||
            d.name_th.includes(value) ||
            p.name_th.includes(value) ||
            t.zip_code.includes(value)
          ) {
            results.push({
              province: p,
              district: d,
              tambon: t,
            });
          }
        });
      });
    });
    setThaiResults(results.slice(0, 5));
  };

  // ค่าปัจจุบันของ state ใช้เก็บว่า ผู้ใช้เลือกตำบล/อำเภอจากช่องค้นหาสถานที่หรือยัง
  const [isSelectedFromSearch, setIsSelectedFromSearch] = useState(false);
  // ค้นหาสถานที่
  const selectThaiResult = (r: any) => {
    setProvinceId(r.province.id);
    setDistrictId(r.district.id);
    setTambonId(r.tambon.id);
    setPostcode(r.tambon.zip_code);

    const fullAddress = `${r.tambon.name_th} ${r.district.name_th} ${r.province.name_th}`;
    fetchCoordinatesByAddress(fullAddress);

    // แสดงผลรวมในช่องเดียว
    setThaiSearch(
      `${r.tambon.name_th} / ${r.district.name_th} / ${r.province.name_th} (${r.tambon.zip_code})`,
    );
    setThaiResults([]);
    setIsSelectedFromSearch(true);
  };

  // Fetch provinces data on mount
  useEffect(() => {
    // Fetch provinces
    (async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json",
        );
        const data = await res.json();
        const provs: Province[] = (Array.isArray(data) ? data : []).map(
          (p: any) => ({
            id: String(p.id),
            name_th: p.name_th || p.name || "",
            districts: (p.districts || []).map((a: any) => ({
              id: String(a.id),
              name_th: a.name_th || a.name || "",
              tambons: (a.sub_districts || []).map((t: any) => ({
                id: String(t.id),
                name_th: t.name_th || t.name || "",
                zip_code: String(t.zip_code || t.zip || ""),
              })),
            })),
          }),
        );

        provs.sort((a, b) => a.name_th.localeCompare(b.name_th, "th"));
        provs.forEach((p) =>
          p.districts.sort((a, b) => a.name_th.localeCompare(b.name_th, "th")),
        );
        provs.forEach((p) =>
          p.districts.forEach((d) =>
            d.tambons.sort((a, b) => a.name_th.localeCompare(b.name_th, "th")),
          ),
        );

        setProvinces(provs);
      } catch (e) {
        console.error("โหลดข้อมูลจังหวัดล้มเหลว:", e);
      }
    })();
  }, []);

  // ---------- ดึงพิกัดจากชื่อจังหวัด/อำเภอ/ตำบล ----------
  async function fetchCoordinatesByAddress(fullAddress: string) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fullAddress
        )}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLat(lat);
        setLng(lon);
      } else {
        console.warn("ไม่พบพิกัดจากที่อยู่:", fullAddress);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะค้นหาพิกัด:", error);
    }
  }
  

  // Auto-select province, district, tambon based on postcode
  useEffect(() => {
    if (!postcode || provinces.length === 0) return;
    // ถ้าเลือกจาก search แล้วจะไม่เปลี่ยนอำเภอ/ตำบล
    if (isSelectedFromSearch) {
      const prov = provinces.find((p) => 
        p.districts.some((d) => d.tambons.some((t) => t.zip_code === postcode))
      );
      if (prov) setProvinceId(prov.id);
      return;
    }

    // ถ้ายังไม่เลือกจาก search เปลี่ยนจะเปลี่ยนจังหวัด/อำเภอ/ตำบลตามรหัสไปรษณีย์
    let found = false;
    for (const prov of provinces) {
      for (const dist of prov.districts) {
        const tambon = dist.tambons.find((t) => t.zip_code === postcode);
        if (tambon) {
          setProvinceId(prov.id);
          setDistrictId(dist.id);
          setTambonId(tambon.id);
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // ถ้าไม่เจอรหัสใหม่จะล้างค่า
    if (!found) {
      setProvinceId("");
      setDistrictId("");
      setTambonId("");
    }
  }, [postcode, provinces, isSelectedFromSearch]);



  // * Create branches mutation
  const { mutate: createBranch } = useMutation({
    mutationFn: async (data: any) => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/branches`,
          data,
        );
        return res.data;
      } catch (err: any) {
        console.error(
          "Error creating branch:",
          err.response?.data || err.message,
        );
        throw err; // important: ต้อง throw ออกไปให้ onError ทำงาน
      }
    },
    onError: (error: any) => {
      ErrorModal(
        error.response?.data?.message ||
          error.message ||
          "เกิดข้อผิดพลาดในการสร้างสาขา",
      );
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
  });
  function send(): void {
    const province = provinces.find((p) => p.id === provinceId);
    const district = districtList.find((d) => d.id === districtId);
    const tambon = tambonList.find((t) => t.id === tambonId);

    const createData = {
      branchID: branchCode,
      name: branchName,
      email: branchEmail || null,
      salesId: salesId || null,
      supervisorId: supervisorId || null,
      createById: Number(createdById),
      address: address,
      zipCode: postcode,
      province: province?.name_th || "",
      district: district?.name_th || "",
      subDistrict: tambon?.name_th || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    };
    createBranch(createData);
  }

  const next = (): void => {
    // Validation for step 1
    if (step === 1) {
      if (!branchName.trim()) {
        ErrorModal("กรุณากรอกชื่อสาขา");
        return;
      }
      if (!supervisorId.trim()) {
        ErrorModal("กรุณาเลือกผู้ดูแลสาขา");
        return;
      }
      if (!salesId.trim()) {
        ErrorModal("กรุณาเลือกพนักงานขาย");
        return;
      }
    }

    // Validation for step 2
    if (step === 2) {
      if (!lat.trim()) {
        ErrorModal("กรุณากรอกตำแหน่งละติจูด");
        return;
      }
      if (!lng.trim()) {
        ErrorModal("กรุณากรอกตำแหน่งลองจิจูด");
        return;
      }
      // Validate that lat/lng are valid numbers
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (isNaN(latNum) || isNaN(lngNum)) {
        ErrorModal("กรุณากรอกตำแหน่งละติจูดและลองจิจูดเป็นตัวเลข");
        return;
      }
      if (latNum < -90 || latNum > 90) {
        ErrorModal("ละติจูดต้องอยู่ระหว่าง -90 ถึง 90");
        return;
      }
      if (lngNum < -180 || lngNum > 180) {
        ErrorModal("ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180");
        return;
      }
    }

    // Validation for step 3
    if (step === 3) {
      if (!address.trim()) {
        ErrorModal("กรุณากรอกที่อยู่");
        return;
      }
      if (!postcode.trim()) {
        ErrorModal("กรุณากรอกรหัสไปรษณีย์");
        return;
      }
      if (!provinceId) {
        ErrorModal("กรุณาเลือกจังหวัด");
        return;
      }
      if (!districtId) {
        ErrorModal("กรุณาเลือกอำเภอ");
        return;
      }
      if (!tambonId) {
        ErrorModal("กรุณาเลือกตำบล");
        return;
      }
    }

    if (step < 3) setStep((s) => s + 1);
    else setConfirm(true); // เปิดโมดัลตอนกดบันทึก
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
        <Button
          isIconOnly
          aria-label="Like"
          variant="flat"
          onPress={() => nav("/branches")}
        >
          <LuX/>
        </Button>
      </div>

      <div className="grid-rows content-between w-full">
        {/* ตัวนับขั้นตอน */}
        <Stepper current={step} total={3} />
        {/* ฟอร์ม */}
        {step === 1 && (
          <div className="card">
            <h2 className="card-title">รายละเอียดของสาขา :</h2>

            <Field label="รหัสสาขา:">
              <Input
                id="branchCode"
                value={displayCode}
                endContent={<LuLock />}
                readOnly
              />
            </Field>

            <Field label="ชื่อของสาขา:">
              <Input
                placeholder="กรอกชื่อสาขา"
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              ></Input>
            </Field>

            <Field label="อีเมลของสาขา:">
              <Input
                placeholder="กรอกอีเมลสาขา"
                type="text"
                value={branchEmail}
                onChange={(e) => setBranchEmail(e.target.value)}
              ></Input>
            </Field>

            <Field label="ผู้ดูแล:">
              <Select
                aria-label="เลือกผู้ดูแลสาขา"
                placeholder="เลือกผู้ดูแล"
                selectedKeys={supervisorId ? [supervisorId] : []} // เก็บเป็นชื่อ
                onSelectionChange={(keys) =>
                  setSupervisorId(Array.from(keys)[0] as string)
                }
              >
                {supervisorList.map((s) => {
                  const fullName = `${s.firstName} ${s.lastName}`;
                  return (
                    <SelectItem key={s.id} textValue={fullName}>
                      {fullName}
                    </SelectItem>
                  );
                })}
              </Select>
            </Field>

            <Field label="พนักงานขาย:">
              <Select
                aria-label="เลือกพนักงานขายสาขา"
                placeholder="เลือกพนักงานขาย"
                selectedKeys={salesId ? [salesId] : []} // เก็บเป็นชื่อ
                onSelectionChange={(keys) =>
                  setSalesId(Array.from(keys)[0] as string)
                }
              >
                {salesList.map((s) => {
                  const fullName = `${s.firstName} ${s.lastName}`;
                  return (
                    <SelectItem key={s.id} textValue={fullName}>
                      {fullName}
                    </SelectItem>
                  );
                })}
              </Select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="card-title">สถานที่ตั้ง:</h2>        
            <Field label="ค้นหาสถานที่">
              <Input
                placeholder="ค้นหา"
                value={thaiSearch}
                onChange={(e) => handleThaiSearch(e.target.value)}
              />
              {thaiResults.length > 0 && (
                <ul
                  className="
                    absolute z-10 mt-1 left-5 right-5
                    bg-white border border-gray-300 rounded-xl 
                    shadow-lg max-h-56 overflow-auto
                  "
                >
                  {thaiResults.map((r, i) => (
                    <li
                      key={i}
                      onClick={() => selectThaiResult(r)}
                      className="
                        px-3 py-2 cursor-pointer 
                        hover:bg-gray-100 transition-colors
                      "
                    >
                      {r.tambon.name_th} / {r.district.name_th} / {r.province.name_th} ({r.tambon.zip_code})
                    </li>
                  ))}
                </ul>
              )}
          </Field>

            <div className="grid2">
              <Field label="ตำแหน่งละติจูด">
                <Input
                  id="lat"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="เช่น 13.7563"
                />
              </Field>
              <Field label="ตำแหน่งลองจิจูด">
                <Input
                  id="long"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="เช่น 100.5018"
                />
              </Field>
            </div>

            {/* Interactive Map - Full width below inputs */}
            <div style={{ width: "100%", height: "260px", marginTop: "12px" }}>
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
                aria-label="กรอกที่อยู่ของสาขา"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="กรอกที่อยู่ของสาขา"
              />
            </Field>
            <Field label="รหัสไปรษณีย์:">
              <Input
                placeholder="กรอกรหัสไปรษณีย์"
                aria-label="กรอกรหัสไปรษณีย์"
                value={postcode}
                onChange={(e) => {
                  const zip = e.target.value.trim();
                  setPostcode(zip);
                }}
              />
            </Field>
            <Field label="จังหวัด:">
              <Select
                selectedKeys={provinceId ? [provinceId] : []}
                placeholder="เลือกจังหวัด"
                aria-label="เลือกจังหวัด"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setProvinceId(selected);
                  setDistrictId("");
                  setTambonId("");
                }}
              >
                {provinces.map((p) => (
                  <SelectItem key={p.id} textValue={p.name_th}>
                    {p.name_th}
                  </SelectItem>
                ))}
              </Select>
            </Field>
            <Field label="อำเภอ:">
              <Select
                selectedKeys={districtId ? [districtId] : []}
                aria-label="เลือกอำเภอ"
                placeholder="เลือกอำเภอ"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setDistrictId(selected);
                  setTambonId("");
                }}
                disabled={provinceId == ""}
              >
                {districtList.map((d) => (
                  <SelectItem key={d.id} textValue={d.name_th}>
                    {d.name_th}
                  </SelectItem>
                ))}
              </Select>
            </Field>
            <Field label="ตำบล:">
              <Select
                selectedKeys={tambonId ? [tambonId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setTambonId(selected);
                }}
                placeholder="เลือกตำบล"
                aria-label="เลือกตำบล"
                disabled={districtId == ""}
              >
                {tambonList.map((t) => (
                  <SelectItem key={t.id} textValue={t.name_th}>
                    {t.name_th}
                  </SelectItem>
                ))}
              </Select>
            </Field>
          </div>
        )}

        {/* Call to action */}
        <div className="cta">
          <Button fullWidth={true} color="primary" onPress={next}>
            {step < 3 ? "ถัดไป" : "ยืนยันการสร้าง"}
          </Button>
          <Button className="btn-link" onPress={back}>
            ย้อนกลับ
          </Button>
        </div>
      </div>

      {/* Error Modal*/}
      <Modal
        backdrop="blur"
        isOpen={showErrorModal}
        placement="center"
        hideCloseButton={true}
        onClose={() => setShowErrorModal(false)}
      >
        <ModalContent className="text-center m-5 ">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <AiFillInfoCircle size={64} color="#F31260" />
                <h1 className="mt-3">{error}</h1>
              </ModalHeader>

              <ModalFooter className="justify-center">
                <Button color="danger" variant="solid" onPress={onClose}>
                  ปิด
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal ยืนยัน */}
      <Modal
        backdrop="blur"
        isOpen={confirm}
        placement="center"
        hideCloseButton={true}
        onOpenChange={(isOpen) => !isOpen && setConfirm(false)}
      >
        <ModalContent className="text-center m-5">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <HiQuestionMarkCircle size={64} color="#4D55A0" />
                <h1 className="modal-title">ยืนยันการสร้างสาขาใหม่</h1>
              </ModalHeader>

              <ModalFooter className="justify-center">
                <Button
                  color="primary"
                  fullWidth={true}
                  variant="bordered"
                  onPress={onClose}
                >
                  ยกเลิก
                </Button>
                <Button
                  color="primary"
                  fullWidth={true}
                  variant="solid"
                  onPress={() => {
                    onClose();
                    send();
                  }}
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
        backdrop="blur"
        placement="center"
        hideCloseButton={true}
        onClose={() => {
          setShowSuccess(false);
          nav("/branches");
        }}
      >
        <ModalContent className="text-center m-5 ">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <HiCheckCircle size={64} color="#4D55A0" />
                <h1 className="modal-title">สร้างสาขาเสร็จสิ้น</h1>
              </ModalHeader>
              <ModalFooter className="justify-center">
                <Button
                  color="primary"
                  fullWidth={true}
                  variant="solid"
                  onPress={onClose}
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
