import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PoiCreatePage.css";
import { DatePicker } from "@heroui/date-picker";
import { DateValue, TimeInput } from "@heroui/react";
import { Time } from "@internationalized/date";

//components import
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
import { LuX } from "react-icons/lu";
import { AiFillInfoCircle } from "react-icons/ai";
import { HiCheckCircle, HiQuestionMarkCircle } from "react-icons/hi";
//query import
import { useQuery, useMutation } from "@tanstack/react-query";

import { InteractiveMapInput } from "@/components/features/map";
import { Input as PictureInput } from "@/components/ui/input";
import useUploadImage from "@/queryOption/upload/uploadImageQueryOption";
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
  const [createdById, setCreatedById] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [tambonId, setTambonId] = useState<string>("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

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

  // * Fetching current user
  const { data: currentUserData, error: currentUserError } =
    useQuery(getCurrentUser());

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
  const uploadImage = useUploadImage();

  function send(): void {
    const province = provinces.find((p) => p.id === provinceId);
    const district = districtList.find((d) => d.id === districtId);
    const tambon = tambonList.find((t) => t.id === tambonId);
    let createData = {
      name: poiName,
      createById: Number(createdById),
      province: province?.name_th || "",
      district: district?.name_th || "",
      subDistrict: tambon?.name_th || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      visitDate: selectedDate?.toString(),
      time: selectedTime
        ? `1970-01-01T${selectedTime.hour.toString().padStart(2, "0")}:${selectedTime.minute.toString().padStart(2, "0")}:00.000Z`
        : null,
      review: description,
    };

    if (file) {
      uploadImage.mutate(file, {
        onSuccess: (data) => {
          // assume data.url
          (createData as any).images = [{ url: data.url }];
          createPoi(createData);
        },
        onError: (error) => {
          ErrorModal(error.message || "Upload failed");
        },
      });
    } else {
      createPoi(createData);
    }
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
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
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
      <div className="grid-rows w-full">
        {/* ตัวนับขั้นตอน */}
        <div className="content-area">
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
                />
              </Field>

              <Field label="จังหวัด:">
                <Select
                  aria-label="เลือกจังหวัด"
                  placeholder="เลือกจังหวัด"
                  selectedKeys={provinceId ? [provinceId] : []}
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
                  aria-label="เลือกอำเภอ"
                  disabled={provinceId == ""}
                  placeholder="เลือกอำเภอ"
                  selectedKeys={districtId ? [districtId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    setDistrictId(selected);
                    setTambonId("");
                  }}
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
                  aria-label="เลือกตำบล"
                  disabled={districtId == ""}
                  placeholder="เลือกตำบล"
                  selectedKeys={tambonId ? [tambonId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    setTambonId(selected);
                  }}
                >
                  {tambonList.map((t) => (
                    <SelectItem key={t.id} textValue={t.name_th}>
                      {t.name_th}
                    </SelectItem>
                  ))}
                </Select>
              </Field>

              <div className="grid2 mt-2">
                <Field label="ตำแหน่งละติจูด">
                  <Input
                    aria-label="ตำแหน่งละติจูด"
                    id="lat"
                    placeholder="เช่น 13.7563"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                </Field>
                <Field label="ตำแหน่งลองจิจูด">
                  <Input
                    aria-label="ตำแหน่งลองจิจูด"
                    id="long"
                    placeholder="เช่น 100.5018"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                  />
                </Field>
              </div>
              {/* Interactive Map - Full width below inputs */}
              <div
                style={{ width: "100%", height: "350px", marginTop: "12px" }}
              >
                <InteractiveMapInput
                  height="100%"
                  lat={lat ? parseFloat(lat) : 13.7563}
                  lng={lng ? parseFloat(lng) : 100.5018}
                  onLocationChange={handleLocationChange}
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="card grid">
              <h2 className="card-title">รายละเอียดของสถานที่ (ต่อ):</h2>
              <Field label="ปฏิทิน:">
                <DatePicker
                  key="outside"
                  labelPlacement="outside"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e)}
                />
              </Field>
              <Field label="เวลา:">
                <TimeInput
                  defaultValue={new Time(11, 45)}
                  hourCycle={24}
                  labelPlacement="outside"
                  value={selectedTime}
                  onChange={(time) => setSelectedTime(time)}
                />
              </Field>
              <Field label="เพิ่มรูปภาพ:">
                <PictureInput
                  id="picture"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Field>
              <Field label="หมายเหตุ:">
                <textarea
                  className="remarks-textarea"
                  id="description-box"
                  placeholder="คำอธิบาย"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
        {/* Call to action (placed at bottom of page in normal flow) */}
        <div className="text-center mt-5">
          <Button color="primary" fullWidth={true} onClick={next}>
            {step < 2 ? "ถัดไป" : "ยืนยันการสร้าง"}
          </Button>
          <Button className="btn-link" onClick={back}>
            ย้อนกลับ
          </Button>
        </div>{" "}
      </div>

      {/* Error Modal*/}
      <Modal
        backdrop="blur"
        hideCloseButton={true}
        isOpen={showErrorModal}
        placement="center"
        onClose={() => setShowErrorModal(false)}
      >
        <ModalContent className="text-center m-5 ">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <AiFillInfoCircle color="#F31260" size={64} />
                <h1 className="mt-3">{error}</h1>
              </ModalHeader>
              <ModalBody />
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
        hideCloseButton={true}
        isOpen={confirm}
        placement="center"
        onOpenChange={(isOpen) => !isOpen && setConfirm(false)}
      >
        <ModalContent className="text-center m-5 ">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <HiQuestionMarkCircle color="#C6005C" size={64} />
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
        hideCloseButton={true}
        isOpen={showSuccess}
        placement="center"
        onClose={() => {
          setShowSuccess(false);
          nav("/poi");
        }}
      >
        <ModalContent className="text-center m-5 ">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <HiCheckCircle color="#C6005C" size={64} />
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
    <label aria-label={label} className="field">
      <div className="field-label">{label}</div>
      {children}
    </label>
  );
}

function Stepper({ current = 1, total = 3 }: StepperProps): JSX.Element {
  return (
    <ol aria-label={`ขั้นตอน ${current} จาก ${total}`} className="stepper">
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
