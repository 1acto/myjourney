import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PoiCreatePage.css";
import { DatePicker } from "@heroui/date-picker";
import {
  parseZonedDateTime,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { TimeInput } from "@heroui/react";
import { Time } from "@internationalized/date";
//components import
import { InteractiveMapInput } from "@/components/features/map";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
//icons import
import { LuLock, LuX } from "react-icons/lu";
import { AiFillInfoCircle } from "react-icons/ai";
import { HiCheckCircle, HiQuestionMarkCircle } from "react-icons/hi";
//query import
import { useQuery, useMutation } from "@tanstack/react-query";
// import getStaffQueryOption from "@/queryOption/users/getStaffQueryOption";
import getCurrentUser from "@/queryOption/users/getCurrentUserQueryOption";

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

export default function PoiCreatePage() {
  const nav = useNavigate();

  // const [staffLists, setStaffLists] = useState<any[]>([]);
  // step
  const [step, setStep] = useState<number>(1);

  // * form state (step 1)
  const [poiName, setPoiName] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [createdById, setCreatedById] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [postcode, setPostcode] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [tambonId, setTambonId] = useState<string>("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  // * รายการจังหวัดทั้งหมด
  const [provinces, setProvinces] = useState<Province[]>([]);

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
      `${r.tambon.name_th} / ${r.district.name_th} / ${r.province.name_th} (${r.tambon.zip_code})`
    );
    setThaiResults([]);
    setIsSelectedFromSearch(true);
  };
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

  // * Fetching current user
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { data: currentUserData, error: currentUserError } =
    useQuery(getCurrentUser());
  useEffect(() => {
    if (currentUserError) {
      console.error("Failed to fetch current user:", currentUserError);
    }
    if (currentUserData) {
      setCurrentUser(currentUserData);
      setCreatedById(currentUserData.id);
    }
  }, [currentUserData, currentUserError]);

  // * Fetching tags
  const [tags, setTags] = useState<any[]>([]);
  const { data: tagLists, error: tagError } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/poi/tag`
      );
      return response.data;
    },
  });
  useEffect(() => {
    if (tagError) {
      console.error("Failed to fetch tags:", tagError);
    }
    if (tagLists) {
      setTags(tagLists);
    }
  }, [tagLists, tagError]);

  // * อำเภอ/ตำบลตามที่เลือก
  const districtList: District[] = useMemo(() => {
    const p = provinces.find((x) => x.id === provinceId);
    return p ? p.districts : [];
  }, [provinces, provinceId]);
  const tambonList: Tambon[] = useMemo(() => {
    const d = districtList.find((x) => x.id === districtId);
    return d ? d.tambons : [];
  }, [districtList, districtId]);
  // Fetch provinces data on mount
  useEffect(() => {
    // Fetch provinces
    (async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json"
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
  // Auto-select province, district, tambon based on postcode
  useEffect(() => {
    if (postcode && provinces.length > 0) {
      for (const prov of provinces) {
        for (const dist of prov.districts) {
          const tambon = dist.tambons.find(
            (t) => String(t.zip_code) === postcode
          );
          if (tambon) {
            setProvinceId(prov.id);
            setDistrictId(dist.id);
            setTambonId(tambon.id);
            return;
          }
        }
      }
    }
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

  // * Create poi mutation
  const { mutate: createPoi } = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/poi`, data);
      return res.data;
    },
    onError: (error: any) => {
      ErrorModal(error.message || "เกิดข้อผิดพลาดในการสร้างสถานที่");
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
      name: poiName,
      tagId: selectedTag,
      address: address,
      createById: Number(createdById),
      zipCode: postcode,
      province: province?.name_th || "",
      district: district?.name_th || "",
      subDistrict: tambon?.name_th || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    };
    createPoi(createData);
  }

  // * Next step with validation
  const next = (): void => {
    // Validation for step 1
    if (step === 1) {
      if (!poiName.trim()) {
        ErrorModal("กรุณากรอกชื่อสถานที่");
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
      // if (!selectedTag) {
      //   ErrorModal("กรุณาเลือกประเภทของสถานที่");
      //   return;
      // }
    }

    // Validation for step 2
    if (step === 2) {
      if (!selectedDate) {
        ErrorModal("กรุณาเลือกวันที่");
        return;
      }

      if (!selectedTime) {
        ErrorModal("กรุณาเลือกเวลา");
        return;
      }

      if (!description.trim()) {
        ErrorModal("กรุณากรอกหมายเหตุ");
        return;
      }
    }

    if (step < 2) setStep((s) => s + 1);
    else setConfirm(true); // เปิดโมดัลตอนกดบันทึก
  };

  // Back
  const back = (): void => (step > 1 ? setStep((s) => s - 1) : nav(-1));

  // Handle location change from interactive map
  const handleLocationChange = (newLat: number, newLng: number): void => {
    setLat(newLat.toString());
    setLng(newLng.toString());
  };

  // Add these states near the top of the component
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Time | null>(null);
  const [description, setDescription] = useState<string>("");

  return (
    <section className="create">
      {/* ปุ่มปิด (ขวาบน) */}
      <div className="header-bar">
        {/* หัวเรื่อง */}
        <h1 className="create-title">เพิ่มสถานที่ใหม่</h1>
        <Button
          isIconOnly
          aria-label="Like"
          variant="flat"
          onPress={() => nav("/poi")}
        >
          <LuX />
        </Button>
      </div>
      <div className="grid-rows content-between w-full">
        {/* ตัวนับขั้นตอน */}
        <Stepper current={step} total={2} />
        {/* ฟอร์ม */}
        {step === 1 && (
          <div className="card grid gap-0.5">
            <h2 className="card-title">รายละเอียดของสถานที่ :</h2>
            <Field label="ชื่อของสถานที่:">
              <Input
                placeholder="เช่น พิพิธภัณฑ์ป๋าแฟรงค์"
                type="text"
                value={poiName}
                onInput={(e) => setPoiName(e.currentTarget.value)}
              ></Input>
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

        {step === 2 && (
          <div className="card grid ">
            <h2 className="card-title">รายละเอียดของสถานที่ (ต่อ):</h2>
            <Field label="ปฏิทิน:">
              <DatePicker
                key="outside"
                labelPlacement="outside"
                onChange={(date) => setSelectedDate(date)}
                value={selectedDate}
              />
            </Field>
            <Field label="เวลา:">
              <TimeInput
                defaultValue={new Time(11, 45)}
                labelPlacement="outside"
                onChange={(time) => setSelectedTime(time)}
                value={selectedTime}
                hourCycle={24}
              />
            </Field>
            {/* เพิ่มรูปภาพ */}
            {/* <Field label="เพิ่มรูปภาพ:">

            </Field> */}
            <Field label="หมายเหตุ:">
              <textarea
                id="description-box"
                className="remarks-textarea"
                placeholder="คำอธิบาย"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* Call to action (placed at bottom of page in normal flow) */}
        <div className="cta">
          <Button fullWidth={true} color="primary" onClick={next}>
            {step < 2 ? "ถัดไป" : "ยืนยันการสร้าง"}
          </Button>
          <Button className="btn-link" onClick={back}>
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
              <ModalBody></ModalBody>
              <ModalFooter className="justify-center">
                <Button color="danger" variant="solid" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Confirm Modal*/}
      <Modal
        backdrop="blur"
        isOpen={confirm}
        placement="center"
        hideCloseButton={true}
        onOpenChange={(isOpen) => !isOpen && setConfirm(false)}
      >
        <ModalContent className="text-center m-5 ">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <HiQuestionMarkCircle size={64} color="#4D55A0" />
                <h1 className="mt-3">ยืนยันการสร้างสถานที่ ?</h1>
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
                  ยืนยัน
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Success Modal*/}
      <Modal
        backdrop="blur"
        isOpen={showSuccess}
        placement="center"
        hideCloseButton={true}
        onClose={() => {
          setShowSuccess(false);
          nav("/poi");
        }}
      >
        <ModalContent className="text-center m-5 ">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <HiCheckCircle size={64} color="#4D55A0" />
                <h1 className="mt-3">สร้างสถานที่เสร็จสิ้น</h1>
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
    <label className="field" aria-label={label}>
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
