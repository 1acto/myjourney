import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PoiCreatePage.css";
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
  NumberInput,
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
  const [point, setPoint] = useState<number | "">("");
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

  // // * Fetching sales + supervisor
  // const { data: staffData, error: staffError } = useQuery(
  //   getStaffQueryOption()
  // );
  // useEffect(() => {
  //   if (staffError) {
  //     console.error("Failed to fetch staff:", staffError);
  //   }
  //   if (staffData) {
  //     const allStaff = [
  //       ...(staffData.sales || []),
  //       ...(staffData.supervisor || []),
  //     ];
  //     setStaffLists(allStaff);
  //     console.log(allStaff);
  //   }
  // }, [staffData, staffError]);

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
  }, [postcode, provinces]);

  // * Create poi mutation
  const {
    mutate: createPoi,
    isError,
    isSuccess,
  } = useMutation({
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
      // point: point,
      createById: Number(createdById),
      zipCode: postcode,
      province: province?.name_th,
      district: district?.name_th,
      subDistrict: tambon?.name_th,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    };
    createPoi(createData);
    if (isError) {
      ErrorModal("เกิดข้อผิดพลาดในการสร้างสถานที่");
      return;
    }
    if (isSuccess) {
      setShowSuccess(true);
      return;
    }
  }

  // * Next step with validation
  const next = (): void => {
    // Validation for step 1
    if (step === 1) {
      if (!poiName.trim()) {
        ErrorModal("กรุณากรอกชื่อสาขา");
        return;
      }
      if (!selectedTag) {
        ErrorModal("กรุณาเลือกประเภทของสถานที่");
        return;
      }
      if (point === "" || point < 1) {
        console.log(point);
        ErrorModal("กรุณากรอกคะแนนของสถานที่");
        return;
      }
    }

    // Validation for step 2
    if (step === 2) {
      if (!postcode.trim()) {
        ErrorModal("กรุณากรอกรหัสไปรษณีย์");
        return;
      }
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
        ErrorModal("กรุณากรอกที่อยู่");
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

  // Back
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
        <Stepper current={step} total={3} />
        {/* ฟอร์ม */}
        {step === 1 && (
          <div className="card grid gap-0.5">
            <h2 className="card-title">รายละเอียดของสถานที่ :</h2>
            <Field label="ชื่อของสถานที่:">
              <Input
                placeholder="เช่น ร้านกาแฟ XYZ"
                type="text"
                value={poiName}
                onInput={(e) => setPoiName(e.currentTarget.value)}
              ></Input>
            </Field>

            <Field label="ประเภทของสถานที่:">
              <Select
                variant="flat"
                selectedKeys={selectedTag}
                aria-label="ประเภทของสถานที่"
                placeholder="เลือกประเภทของสถานที่"
                onSelectionChange={(key) => {
                  setSelectedTag(Array.from(key)[0] as string);
                }}
              >
                {tags.map((tag) => (
                  <SelectItem key={tag.id} textValue={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </Select>
            </Field>

            <Field label="คะแนนของสถานที่:">
              <NumberInput
                size="sm"
                minValue={0}
                defaultValue={point == 0 ? undefined : Number(point)}
                aria-label="คะแนนของสถานที่"
                classNames={{
                  inputWrapper: "shadow-none",
                }}
                radius="md"
                onChange={(e) => {
                  setPoint(Number(e));
                }}
                placeholder="ex. 5"
              />
            </Field>

            <Field label="ผู้เพิ่ม:">
              <Input
                disabled
                aria-label="ผู้เพิ่ม"
                endContent={<LuLock />}
                onLoad={() => setCreatedById(currentUser.id)}
                type="text"
                value={
                  currentUser
                    ? currentUser.firstName + " " + currentUser.lastName
                    : "Error: Can't get current user"
                }
              ></Input>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="card grid gap-0.5">
            <h2 className="card-title">สถานที่ตั้ง:</h2>
            <Field label="รหัสไปรษณีย์:">
              <Input
                placeholder="กรอกรหัสไปรษณีย์"
                value={postcode}
                aria-label="กรอกรหัสไปรษณีย์"
                onChange={(e) => setPostcode(e.target.value)}
              />
            </Field>
            <div className="grid2 mt-2">
              <Field label="ตำแหน่งละติจูด">
                <Input
                  id="lat"
                  value={lat}
                  aria-label="ตำแหน่งละติจูด"
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="เช่น 13.7563"
                />
              </Field>
              <Field label="ตำแหน่งลองจิจูด">
                <Input
                  value={lng}
                  id="long"
                  aria-label="ตำแหน่งลองจิจูด"
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="เช่น 100.5018"
                />
              </Field>
            </div>
            {/* Interactive Map - Full width below inputs */}
            <div style={{ width: "100%", height: "350px", marginTop: "12px" }}>
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
                value={address}
                aria-label="ที่อยู่"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="กรอกที่อยู่ของสาขา"
              />
            </Field>

            <Field label="รหัสไปรษณีย์:">
              <Input
                value={postcode}
                aria-label="รหัสไปรษณีย์"
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="กรอกรหัสไปรษณีย์"
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

        {/* Call to action (placed at bottom of page in normal flow) */}
        <div className="cta">
          <Button fullWidth={true} color="primary" onClick={next}>
            {step < 3 ? "ถัดไป" : "ยืนยันการสร้าง"}
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
        onClose={() => {
          setConfirm(false);
          send();
        }}
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
                  onPress={onClose}
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
          nav("/map");
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
    <label className="field mt-2" aria-label={label}>
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
