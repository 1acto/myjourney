import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./PoiEditPage.css";
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
import { LuLock, LuX } from "react-icons/lu";
import { AiFillInfoCircle } from "react-icons/ai";
import { HiCheckCircle, HiQuestionMarkCircle } from "react-icons/hi";
import { useQuery, useMutation } from "@tanstack/react-query";
import getCurrentUser from "@/queryOption/users/getCurrentUserQueryOption";

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

export default function PoiEditPage() {
  const nav = useNavigate();
  const { id } = useParams(); // รับ id จาก URL เช่น /poi/edit/:id
  
  const [step, setStep] = useState<number>(1);
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

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const ErrorModal = (err: string) => {
    setShowErrorModal(true);
    setError(err);
  };

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { data: currentUserData, error: currentUserError } = useQuery(getCurrentUser());
  useEffect(() => {
    if (currentUserError) console.error("fetch current user failed:", currentUserError);
    if (currentUserData) {
      setCurrentUser(currentUserData);
      setCreatedById(currentUserData.id);
    }
  }, [currentUserData, currentUserError]);

  // ดึงรายการ tag
  const [tags, setTags] = useState<any[]>([]);
  const { data: tagLists } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/poi/tag`);
      return res.data;
    },
  });
  useEffect(() => {
    if (tagLists) setTags(tagLists);
  }, [tagLists]);

  // โหลดจังหวัด
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json"
        );
        const data = await res.json();
        const provs: Province[] = (Array.isArray(data) ? data : []).map((p: any) => ({
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
        }));
        setProvinces(provs);
      } catch (e) {
        console.error("โหลดข้อมูลจังหวัดล้มเหลว:", e);
      }
    })();
  }, []);

  // auto find อำเภอ/ตำบล
  const districtList: District[] = useMemo(() => {
    const p = provinces.find((x) => x.id === provinceId);
    return p ? p.districts : [];
  }, [provinces, provinceId]);
  const tambonList: Tambon[] = useMemo(() => {
    const d = districtList.find((x) => x.id === districtId);
    return d ? d.tambons : [];
  }, [districtList, districtId]);

  // ดึงข้อมูล POI เดิมมาแก้ไข
  const { data: poiData, isLoading: poiLoading } = useQuery({
    queryKey: ["poi", id],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/poi/get/${id}`);

      //console.log("แสดง properties:", res.data.properties); //Test การดึงข้อมูล properties
      //console.log("แสดง geometry:", res.data.geometry); //Test การดึงข้อมูล geometry
      //console.log("แสดง type:", res.data.type); //Test การดึงข้อมูล type
      
      return res.data.properties;
    },
    enabled: !!id,
  });

  /**useEffect(() => {
    if (poiData) {
      setPoiName(poiData.name);
      setSelectedTag(poiData.tag.name?.toString() || "");
      setAddress(poiData.location.address || "");
      setPostcode(poiData.location.zipCode || "");
      setProvinceId(poiData.provinceId?.toString() || "");
      setDistrictId(poiData.districtId?.toString() || "");
      setTambonId(poiData.subDistrictId?.toString() || "");
      setLat(poiData.location.latitude || "");
      setLng(poiData.location.longitude || "");
    }
  }, [poiData]);**/

  useEffect(() => {
  if (poiData && provinces.length > 0) {
    // 🏷️ ตั้งค่าทั่วไป
    setPoiName(poiData.name);
    setSelectedTag(poiData.tag.name || "");
    setAddress(poiData.location.address || "");
    setPostcode(poiData.location.zipCode || "");
    setLat(poiData.location.latitude?.toString() || "");
    setLng(poiData.location.longitude?.toString() || "  ");

    // 🌏 หา province จากชื่อ
    const foundProvince = provinces.find(
      (p) => p.name_th.trim() === poiData.location.province.trim()
    );
    if (foundProvince) {
      setProvinceId(foundProvince.id);

      // หา district จากชื่อ
      const foundDistrict = foundProvince.districts.find(
        (d) => d.name_th.trim() === poiData.location.district.trim()
      );
      if (foundDistrict) {
        setDistrictId(foundDistrict.id);

        // หา tambon จากชื่อ
        const foundTambon = foundDistrict.tambons.find(
          (t) => t.name_th.trim() === poiData.location.subDistrict.trim()
        );
        if (foundTambon) {
          setTambonId(foundTambon.id);
          setPostcode(foundTambon.zip_code); // ดึงรหัสไปรษณีย์จาก JSON
        }
      }
    }
  }
}, [poiData, provinces]);
  //console.log("province", poiData.location.province);
  //console.log("district", poiData.location.district);
  //console.log("subDistrict", poiData.location.subDistrict);
  // ฟังก์ชัน update POI
  const { mutate: updatePoi } = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/poi/${id}`, data);
      return res.data;
    },
    onError: (error: any) => {
      ErrorModal(error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานที่");
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
  });

  const send = () => {
    const province = provinces.find((p) => p.id === provinceId);
    const district = districtList.find((d) => d.id === districtId);
    const tambon = tambonList.find((t) => t.id === tambonId);
    const updateData = {
      name: poiName,
      tagId: selectedTag,
      address: address,
      updateById: Number(createdById),
      zipCode: postcode,
      province: province?.name_th || "",
      district: district?.name_th || "",
      subDistrict: tambon?.name_th || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    };
    updatePoi(updateData);
  };

  const next = () => {
    if (step < 3) setStep((s) => s + 1);
    else setConfirm(true);
  };
  const back = () => (step > 1 ? setStep((s) => s - 1) : nav(-1));
  const handleLocationChange = (newLat: number, newLng: number): void => {
    setLat(newLat.toString());
    setLng(newLng.toString());
  };

  if (poiLoading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <section className="create">
      <div className="header-bar">
        <h1 className="create-title">แก้ไขสถานที่</h1>
        <Button isIconOnly aria-label="Close" variant="flat" onPress={() => nav("/poi")}>
          <LuX />
        </Button>
      </div>

      <Stepper current={step} total={3} />

      {step === 1 && (
        <div className="card grid gap-0.5">
          <h2 className="card-title">รายละเอียดของสถานที่ :</h2>
          <Field label="ชื่อของสถานที่:">
            <Input aria-label="ชื่อของสถานที่:"  value={poiName} onInput={(e) => setPoiName(e.currentTarget.value)} />
          </Field>
          <Field label="ประเภทของสถานที่:">
            <Select
              selectedKeys={selectedTag ? [selectedTag] : []}
              onSelectionChange={(key) => {
                setSelectedTag((Array.from(key)[0] as string) || "");
              }}
            >
              {tags.map((tag) => (
                <SelectItem key={tag.name} textValue={tag.name}>
                  {tag.name}
                </SelectItem>
              ))}
            </Select>
          </Field>
          <Field label="ผู้แก้ไข:">
            <Input
              disabled
              endContent={<LuLock />}
              value={
                currentUser
                  ? currentUser.firstName + " " + currentUser.lastName
                  : "ไม่พบข้อมูลผู้ใช้"
              }
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="card grid">
          <h2 className="card-title">สถานที่ตั้ง:</h2>
          <Field label="รหัสไปรษณีย์:">
            <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
          </Field>
          <div className="grid2 mt-2">
            <Field label="ละติจูด">
              <Input value={lat} onChange={(e) => setLat(e.target.value)} />
            </Field>
            <Field label="ลองจิจูด">
              <Input value={lng} onChange={(e) => setLng(e.target.value)} />
            </Field>
          </div>
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
          <h2 className="card-title">ที่อยู่เพิ่มเติม:</h2>
          <Field label="ที่อยู่:">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="จังหวัด:">
            <Select
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
              selectedKeys={districtId ? [districtId] : []}
              disabled={!provinceId}
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
              selectedKeys={tambonId ? [tambonId] : []}
              disabled={!districtId}
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
        </div>
      )}

      <div className="cta">
        <Button fullWidth color="primary" onClick={next}>
          {step < 3 ? "ถัดไป" : "ยืนยันการแก้ไข"}
        </Button>
        <Button className="btn-link" onClick={back}>
          ย้อนกลับ
        </Button>
      </div>

      {/* Confirm Modal */}
      <Modal isOpen={confirm} onOpenChange={(o) => !o && setConfirm(false)} hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-center flex flex-col items-center gap-2">
                <HiQuestionMarkCircle size={64} color="#4D55A0" />
                <h1>ยืนยันการแก้ไขสถานที่ ?</h1>
              </ModalHeader>
              <ModalFooter className="justify-center">
                <Button variant="bordered" onPress={onClose}>
                  ยกเลิก
                </Button>
                <Button
                  color="primary"
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

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => nav("/poi")} hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-center flex flex-col items-center gap-2">
                <HiCheckCircle size={64} color="#4D55A0" />
                <h1>อัปเดตข้อมูลเสร็จสิ้น</h1>
              </ModalHeader>
              <ModalFooter className="justify-center">
                <Button color="primary" onPress={onClose}>
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

function Field({ label, children }: FieldProps) {
  return (
    <label className="field" aria-label={label}>
      <div className="field-label">{label}</div>
      {children}
    </label>
  );
}
function Stepper({ current = 1, total = 3 }: StepperProps) {
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
