import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@/lib/utils";

import "./PoiEditPage.css";
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
import { LuX } from "react-icons/lu";
import { AiFillInfoCircle } from "react-icons/ai";
import { HiCheckCircle, HiQuestionMarkCircle } from "react-icons/hi";
import { useQuery, useMutation } from "@tanstack/react-query";

import { InteractiveMapInput } from "@/components/features/map";
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

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  const { data: currentUserData, error: currentUserError } =
    useQuery(getCurrentUser());

  useEffect(() => {
    if (currentUserError)
      console.error("fetch current user failed:", currentUserError);
    if (currentUserData) {
      setCreatedById(currentUserData.id);
    }
  }, [currentUserData, currentUserError]);

  // โหลดจังหวัด
  useEffect(() => {
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
      const res = await apiClient.get(`/poi/get/${id}`);

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
      //  ตั้งค่าทั่วไป
      setPoiName(poiData.name);
      setSelectedTag(poiData.tag.name || "");
      setAddress(poiData.location.address || "");
      setPostcode(poiData.location.zipCode || "");
      setLat(poiData.location.latitude?.toString() || "");
      setLng(poiData.location.longitude?.toString() || "  ");
      setThaiSearch(
        poiData.location.subDistrict +
          " / " +
          poiData.location.district +
          " / " +
          poiData.location.province +
          " (" +
          poiData.location.zipCode +
          ")"
      );

      //  หา province จากชื่อ
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
  //console.log("tag", poiData.tag.name);
  //console.log("province", poiData.location.province);
  //console.log("district", poiData.location.district);
  //console.log("subDistrict", poiData.location.subDistrict);
  // ฟังก์ชัน update POI
  const { mutate: updatePoi } = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.put(`/poi/${id}`, data);

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
    if (step < 2) setStep((s) => s + 1);
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
      {/* ปุ่มปิด (ขวาบน) */}
      <div className="header-bar">
        {/* หัวเรื่อง */}
        <h1 className="create-title">แก้ไขสถานที่</h1>
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
                aria-label="ชื่อของสถานที่:"
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
          </div>
        )}

        {step === 2 && (
          <div className="card grid ">
            <h2 className="card-title">สถานที่ตั้ง:</h2>
            <Field label="ค้นหาสถานที่">
              <Input
                placeholder="ค้นหาตำบล/อำเภอ/จังหวัด/รหัสไปรษณีย์"
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
                      aria-selected="false"
                      className="
                          px-3 py-2 cursor-pointer
                          hover:bg-gray-100 transition-colors
                        "
                      role="option"
                      onClick={() => selectThaiResult(r)}
                    >
                      {r.tambon.name_th} / {r.district.name_th} /{" "}
                      {r.province.name_th} ({r.tambon.zip_code})
                    </li>
                  ))}
                </ul>
              )}
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
            <div style={{ width: "100%", height: "350px", marginTop: "12px" }}>
              <InteractiveMapInput
                height="100%"
                lat={lat ? parseFloat(lat) : 13.7563}
                lng={lng ? parseFloat(lng) : 100.5018}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>
        )}

        {/* Call to action (placed at bottom of page in normal flow) */}
        <div className="cta">
          <Button
            className="btn-font"
            color="primary"
            fullWidth={true}
            onPress={next}
          >
            {step < 2 ? "ถัดไป" : "ยืนยันการแก้ไข"}
          </Button>
          <Button className="btn-link" onPress={back}>
            ย้อนกลับ
          </Button>
        </div>
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

              <ModalFooter className="justify-center">
                <Button color="danger" variant="solid" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal ยืนยันการแก้ไข */}
      <Modal
        backdrop="blur"
        hideCloseButton={true}
        isOpen={confirm}
        placement="center"
        onOpenChange={(isOpen) => !isOpen && setConfirm(false)}
      >
        <ModalContent className="text-center m-5">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center text-lg font-semibold text-center">
                <HiQuestionMarkCircle color="#F5A524" size={64} />
                <h1 className="mt-3">ยืนยันการแก้ไขข้อมูล</h1>
              </ModalHeader>

              <ModalFooter className="๋justify-center">
                <Button
                  color="primary"
                  fullWidth={true}
                  variant="bordered"
                  onPress={onClose}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="btn-modal-solid"
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

      {/* Success Modal */}
      <Modal
        backdrop="blur"
        hideCloseButton={true}
        isOpen={showSuccess}
        placement="center"
        onClose={() => {
          setShowSuccess(false);
          nav("/branches");
        }}
      >
        <ModalContent className="text-center m-5">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <HiCheckCircle color="#F5A524" size={64} />
                <h1 className="mt-3">ส่งคำร้องการแก้ไขสาขาเรียบร้อย</h1>
              </ModalHeader>
              <ModalBody
                className="text-center text-gray-600"
                style={{ marginTop: "0px", paddingBottom: "16px" }}
              >
                โปรดรอผู้ดูแลอนุมัติคำขอของคุณ
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button
                  className="btn-modal-solid"
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

function Stepper({ current = 1, total = 2 }: StepperProps): JSX.Element {
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
