import { useRef, useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {Button} from "@heroui/react";
import { LuEllipsis } from "react-icons/lu";
import "./BranchInfo.css";
import { Line } from "react-chartjs-2";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ChartData,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// register ChartJS element และ plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels as any // cast เป็น any เพื่อ TypeScript ไม่ error
);

type ParcelHistoryItem = { date: string; parcels: number }; // 🎯 ใช้ 'date' DD/MM/YYYY
interface ChartDataResult {
    data: number[];
    labels: string[];
}

type DateFormatType = "FULL_MONTH_YEAR" | "FULL_MONTH" | "SHORT_MONTH_YEAR" | "YEAR_ONLY";

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};
const getLabelFromDate = (dateStr: string, formatType: DateFormatType = "FULL_MONTH_YEAR"): string => {
  const date = parseDate(dateStr);
  const year = date.getFullYear();

  if (formatType === "YEAR_ONLY") {
    return String(year);
  }

  // กำหนดรูปแบบการแสดงเดือน
  const monthFormat: 'short' | 'long' = (formatType === "SHORT_MONTH_YEAR") ? 'short' : 'long';
  const monthName = new Intl.DateTimeFormat('th-TH', { month: monthFormat }).format(date);
  
  if (formatType === "FULL_MONTH") {
    // 2. แสดงเดือนเต็ม (ใช้สำหรับหัวข้อที่ไม่มีปี)
    return monthName; 
  }
  
  // 3. & 1. แสดงเดือน + ปี (แบบย่อหรือแบบเต็ม)
  let formattedMonthName;
  if (monthFormat === 'short') {
    // กำหนดรูปแบบย่อที่ถูกต้อง (Hardcode เฉพาะส่วนย่อ)
    // เนื่องจาก cleanMonthName จะเป็น 'มค', 'กพ', 'มีค', 'เมย', 'พค', 'มิย', ฯลฯ
    const monthIndex = date.getMonth(); // 0 = ม.ค., 5 = มิ.ย.
    const thaiShortMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 
      'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 
      'พ.ย.', 'ธ.ค.'
    ];
    
    formattedMonthName = thaiShortMonths[monthIndex];

  } else {
    // เดือนเต็ม
    formattedMonthName = monthName; 
  }

  return `${formattedMonthName} ${year}`;
};

type TabType = "income" | "branch";
type HistoryTabType = "3months" | "6months" | "12months" | "3years" | "custom";


// 🎯 ฐานข้อมูลยอดพัสดุทั้งหมด 3 ปี (36 เดือน) เรียงจากใหม่ไปเก่า (ก.ย. 25 -> ต.ค. 22)
// ใช้ค่าเฉลี่ย 100 ชิ้นต่อ 1,000 บาทของยอดขายเดิม
const ALL_PARCEL_HISTORY: ParcelHistoryItem[] = [
  // 2025 (9 เดือน)
  { date: "24/09/2025", parcels: 1000 },// เดือนล่าสุด
  { date: "24/08/2025", parcels: 793 },
  { date: "24/07/2025", parcels: 593 },
  { date: "24/06/2025", parcels: 450 },
  { date: "24/01/2025", parcels: 420 },
  // 2024 (12 เดือน)
  { date: "24/12/2024", parcels: 340 },
  // ...
  { date: "24/01/2024", parcels: 620 },
  // 2023 (12 เดือน)
  { date: "24/12/2023", parcels: 550 },
  // ...
  { date: "24/01/2023", parcels: 100 },
  // 2022 (3 เดือน)
  { date: "24/12/2022", parcels: 120 },
  { date: "24/11/2022", parcels: 115 },
  { date: "24/10/2022", parcels: 110 },
];

function BranchInfo(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("income");
  const [historyTab, setHistoryTab] = useState<HistoryTabType>("3months");
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate()
  const [open, setOpen] = useState<boolean>(false);
  const { branchId } = useParams<"branchId">();
  const [branch, setBranch] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/branches/info/${branchId}`)
      .then(res => res.json())
      .then(data => setBranch(data));
  }, [branchId]);

  useEffect(() => {

    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (
        popRef.current &&
        !popRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = useMemo<ChartDataResult>(() => {
  let data: number[] = [];
  let labels: string[] = [];
  let monthsToSlice = 0;

  const isShortFormat = historyTab !== "3months" && historyTab !== "custom";
  const dateFormatType: DateFormatType = isShortFormat ? "SHORT_MONTH_YEAR" : "FULL_MONTH_YEAR";
  const yearFormatType: DateFormatType = "YEAR_ONLY";

  switch (historyTab) {
    case "3months":
    // ... (3months, 6months, 12months โค้ดเดิม)
      monthsToSlice = 3;
      break;
    case "6months":
      monthsToSlice = 6;
      break;
    case "12months":
      monthsToSlice = 12;
      break;
    case "3years":
      const dataToGroup = ALL_PARCEL_HISTORY; // ใช้ทั้งหมดเพื่อความยืดหยุ่น

      const yearlyParcelsMap = dataToGroup.reduce((acc, item) => {
          // ... (โค้ด grouping เดิม)
          const year = getLabelFromDate(item.date, yearFormatType); 
          if (!acc[year]) {
              acc[year] = 0;
          }
          acc[year] += item.parcels;
          return acc;
      }, {} as Record<string, number>);

      // เรียงปีจากเก่าไปใหม่: ["2022", "2023", "2024", "2025"]
      const allYears = Object.keys(yearlyParcelsMap).sort(); 
      
      // แก้ไข: ตัดเหลือเฉพาะ 3 ปีล่าสุดเท่านั้น
      const finalYears = allYears.slice(Math.max(0, allYears.length - 3));

      labels = finalYears;
      data = finalYears.map(year => yearlyParcelsMap[year]);
      
      return { data, labels };
  }

  // **เคสรายเดือน: 3, 6, 12 เดือน**
  // 1. ตัดข้อมูล N เดือนล่าสุด (ใช้ slice ได้)
  const slicedData = ALL_PARCEL_HISTORY.slice(0, monthsToSlice);

  // 2. เรียงลำดับกลับ (จากเก่าไปใหม่) สำหรับแสดงกราฟ
  const reversedData = slicedData.reverse();

  data = reversedData.map((item) => item.parcels);
  // 💡 ใช้ Helper function เพื่อสร้าง Label "เดือน ปี"
  labels = reversedData.map((item) => getLabelFromDate(item.date, dateFormatType));

  return { data, labels };
  }, [historyTab]);

  // ส่วนการคำนวณสถิติสำหรับ Stat Cards (ใช้ข้อมูล 3 เดือนล่าสุด)
  const { 
    minVal, 
    maxVal, 
    avgVal, 
    stdDev, 
    latestParcel, 
    previousParcel,
    current3MonthsDataObj, // 💡 ใช้สำหรับค้นหาเดือน
  } = useMemo(() => {
  
    if (ALL_PARCEL_HISTORY.length === 0) {
        return { 
            minVal: 0, maxVal: 0, avgVal: 0, stdDev: 0, 
            latestParcel: { date: "", parcels: 0 }, 
            previousParcel: { date: "", parcels: 0 },
            latestMonthLabel: "N/A",
            current3MonthsDataObj: [],
        };
    }
  
    const latestParcel = ALL_PARCEL_HISTORY[0];
    // ป้องกัน Array Index Out of Bounds ถ้ามีข้อมูลแค่เดือนเดียว
    const previousParcel = ALL_PARCEL_HISTORY[1] || { date: "", parcels: 0 }; 
    const current3MonthsDataObj = ALL_PARCEL_HISTORY.slice(0, 3);
    const current3MonthsData = current3MonthsDataObj.map((item) => item.parcels);

    // (โค้ด minVal, maxVal, avgVal, variance, stdDev เดิม)
    const minVal = Math.min(...current3MonthsData);
    const maxVal = Math.max(...current3MonthsData);
    const sum = current3MonthsData.reduce((a, b) => a + b, 0);
    const avgVal = sum / current3MonthsData.length;
    const variance = current3MonthsData
      .map((v) => Math.pow(v - avgVal, 2))
      .reduce((a, b) => a + b, 0) / current3MonthsData.length;
    const stdDev = Math.sqrt(variance);

    return { minVal, maxVal, avgVal, stdDev, latestParcel, previousParcel, current3MonthsDataObj };
  }, []);

  // 🎯 แก้ไขเงื่อนไขการหมุน: หมุน 45 องศาเมื่อมีป้ายกำกับมากกว่า 3 อัน
  const shouldRotate = selected.labels.length > 3;
  const rotationAngle = shouldRotate ? 45 : 0;

  // 🎯 ฟังก์ชันสำหรับสร้าง Gradient
  const createGradient = (context: any) => {
    if (!context.chart.chartArea) {
      return null;
    }
    const ctx = context.chart.ctx;
    const chartArea = context.chart.chartArea;
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );
    gradient.addColorStop(0, "rgba(99,102,241,0.3)"); // สีเริ่มต้น (จางลงเล็กน้อยจาก borderColor)
    gradient.addColorStop(0.8, "rgba(98, 100, 240, 0.1)"); // สีกลาง (จางลงอีก)
    gradient.addColorStop(1, "rgba(36, 39, 239, 0)"); // สีสุดท้าย (โปร่งใส)
    return gradient;
  };

  const chartData: ChartData<"line", number[], string> = {
    labels: selected.labels,
    datasets: [
      {
        label: "ยอดพัสดุ",
        data: selected.data,
        borderWidth: 1,
        borderColor: "rgba(99,102,241,1)",
        backgroundColor: (context) => createGradient(context),
        fill: true,
        tension: 0.4,
        // 🎯 การตั้งค่าจุดให้เป็นวงกลมเล็กด้านใน
        pointRadius: 4, // ขนาดของจุดด้านใน
        pointBackgroundColor: "rgba(99,102,241,1)", // สีของจุดด้านใน

        // 🎯 การตั้งค่าวงแหวนด้านนอก (สีจะไม่จางกว่าจุดด้านใน)
        pointBorderColor: "rgba(99,102,241,0.4)", // สีขอบนอกที่ 'จางลง' โดยใช้ค่า alpha (opacity) ต่ำกว่า
        pointBorderWidth: 8, // ความหนาของเส้นขอบ ทำให้ดูเป็นวงแหวน
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#000000ff",
        anchor: "end",
        align: "top",
        offset: -1,
        font: { weight: "bold", size: 10 },
        formatter: (value: number) => value, // แสดงตัวเลขค่า
      },
    },
    scales: {
      x: {
        offset: true,
        bounds: "ticks",
        grid: { display: false },
        ticks: {
          autoSkip: false,
          maxRotation: rotationAngle,
          minRotation: rotationAngle,
        },
      },
      y: {
        beginAtZero: true,
        // 💡 การเพิ่ม suggestedMax เพื่อเผื่อพื้นที่ด้านบน
        // คำนวณจากค่าสูงสุดของข้อมูล * 1.20 (เผื่อพื้นที่ 20%)
        suggestedMax: Math.max(...selected.data) * 1.2 || 1000,
      },
    },
  };

  // ฟังก์ชันสำหรับกำหนดสถานะและสีตามยอดพัสดุ
  const getParcelStatus = (parcels: number) => {
    if (parcels >= 500) {
      return {
        text: "ยอดพัสดุดีมาก",
        cardBgClass: "bg-[#DCCCEC]", 
        textClass: "text-[#7828C8]", 
        // เพิ่ม Hex Code ของสีเข้ม
        darkColorHex: "#7828C8", // ม่วงเข้ม
      };
    } else if (parcels >= 150) {
      return {
        text: "ยอดพัสดุดี",
        cardBgClass: "bg-[#FEEFC4]", 
        textClass: "text-[#F5A524]", 
        // เพิ่ม Hex Code ของสีเข้ม
        darkColorHex: "#F5A524", // ส้มเข้ม
      };
    } else if (parcels >= 100) {
      return {
        text: "ยอดพัสดุพอใช้",
        cardBgClass: "bg-[#C4E0FE]", 
        textClass: "text-[#006FEE]", 
        // เพิ่ม Hex Code ของสีเข้ม
        darkColorHex: "#006FEE", // น้ำเงินเข้ม
      };
    } else {
      // 0 - 99
      return {
        text: "ยอดพัสดุต่ำ",
        cardBgClass: "bg-[#FDD0DF]", 
        textClass: "text-[#F31260]", 
        // เพิ่ม Hex Code ของสีเข้ม
        darkColorHex: "#F31260", // แดงเข้ม
      };
    }
  };

  // ส่วนที่เพิ่ม: คำนวณเปอร์เซ็นต์การเปลี่ยนแปลงและสี
  const change = latestParcel.parcels - previousParcel.parcels;
  // ป้องกันการหารด้วยศูนย์ (ถ้าเดือนก่อนมี 0 ชิ้น)
  const changePercent = previousParcel.parcels === 0
    ? change > 0 ? 100 : 0
    : (change / previousParcel.parcels) * 100;
    
  const isPositiveChange = change > 0;

  
  // กำหนดสี: เขียวสำหรับบวก, แดงสำหรับลบ, เทาสำหรับไม่มีการเปลี่ยนแปลง
  const changeTextColor = isPositiveChange 
    ? "text-[#15B100]" 
    : change < 0 
      ? "text-red-500" 
      : "text-gray-500";
      
  const changeDisplay = `${Math.abs(changePercent).toFixed(2)}%`;
  const parcelStatus = getParcelStatus(latestParcel.parcels);

  // ใช้ทำรหัสสาขา
  function formatId(id: string | undefined) {
    const prefix = "MXP";
    const number = String(id ?? "").padStart(3, "0");
    return `${prefix} - ${number}`;
  }

  const formattedId = formatId(branchId);

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="relative">
        {/* Title Container */}
        <div className="bg-[#C8CAE0] flex flex-col p-5">
          <div className="flex items-center gap-2">
            <span className="BranchID">{formattedId}</span>
            <div className={`flex items-center gap-1 rounded-[5px] border-transparent ${parcelStatus.cardBgClass} ${parcelStatus.textClass} font-bold mt-4 pl-[7px] pr-[7px] pt-[3px] pb-[3px]`}>
              <span 
                  className="dot" 
                  style={{ backgroundColor: parcelStatus.darkColorHex }} 
              ></span> 
              <span className={`${parcelStatus.textClass} font-bold text-[10px]`}>
                {parcelStatus.text}
              </span>
              
            </div>
              <Button
                className="buttonMenu right-[65px]"
                size="lg"
                isIconOnly
                aria-label="more"
                color="secondary"
                onClick={() => setOpen((v) => !v)}
                ref={btnRef}
              >
                <LuEllipsis />
              </Button>
              {open && (
                <div className="menuPop" ref={popRef} role="menu">
                  <button
                    className="menuPopInfo"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      navigate(`/branches/edit/${branchId}`);
                    }}
                  >
                    <PencilSquareIcon className="size-[23px]" />
                    <span className="font">แก้ไข</span>
                  </button>

                  <button
                    className="menuPopInfo"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <TrashIcon className="text-red-600 size-[22px]"/>
                    <span>ลบ</span>
                  </button>
                </div>
              )}
              <Button
                className="buttonClose right-[16px]"
                aria-label="ปิด"
                isIconOnly
                onClick={() => navigate("/branches")}
              >✕</Button>
          </div>
          <div className="BranchName">
            {branch?.name}
          </div>

          {/* Container ปุ่ม - ใช้ CSS */}
          <div className="tab-container">
            <button
              onClick={() => setActiveTab("income")}
              className={`custom-tab-button ${activeTab === "income" ? "active" : ""}`}
            >
              สถิติรายได้
            </button>
            <button
              onClick={() => setActiveTab("branch")}
              className={`custom-tab-button ${activeTab === "branch" ? "active" : ""}`}
            >
              ข้อมูลสาขา
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-15 mx-5">
        {activeTab === "income" && (
          <div>
            {/* สถิติเดือนล่าสุด */}
            <div className="font-bold text-lg mb-2 mt-[-20px]">สถิติเดือนล่าสุด</div>
            <div className="flex gap-4 mb-6">
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    ยอดพัสดุ{" "}
                    <span className="text-gray-500 text-[10px] font-normal">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    {getLabelFromDate(latestParcel.date, "SHORT_MONTH_YEAR")}
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {latestParcel.parcels.toLocaleString()}
                </div>
                <div className="flex justify-center gap-2 text-[8px] mt-3">
                  <div className={`flex items-center pl-1 rounded border-2 border-transparent ${parcelStatus.cardBgClass} ${parcelStatus.textClass} font-bold`}>
                    {/* 🎯 ใช้ Inline Style เพื่อกำหนดสีพื้นหลังจุด */}
                    <span 
                        className="dot"
                        style={{ backgroundColor: parcelStatus.darkColorHex }}
                    ></span> 
                    <span className="px-1">{parcelStatus.text}</span>
                  </div>
                  <div className={`flex mt-0 font-bold ${changeTextColor} border-2 rounded pr-1 pl-1
                                    ${isPositiveChange ? 'border-[#D1F4E0] bg-[#D1F4E0]' : change < 0 ? 'border-red-300 bg-red-300' : 'border-gray-300 bg-gray-3000'}`}>
                                      {changeDisplay}{isPositiveChange && <ArrowTrendingUpIcon className="size-[12px]" />}
                                      {change < 0 && <ArrowTrendingDownIcon className="size-[12px]" />}</div>
                </div>
              </div>
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    รายได้ <span className="text-gray-500 text-[10px] font-normal">(บาท)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    {getLabelFromDate(latestParcel.date, "SHORT_MONTH_YEAR")}
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {(latestParcel.parcels * 5).toLocaleString()}
                  {/* 10 คือราคาต่อหน่วย */}
                </div>
                <div className="text-[9px] text-center bg-gray-200 text-gray-500 font-bold mt-3 rounded pr-1 pl-1 ml-4 mr-4">
                  ค่าประมาณการจากยอดพัสดุ
                </div>
              </div>
            </div>

            {/* Section: สถิติย้อนหลัง */}
            <div className="text-[16px] font-bold mb-2">สถิติย้อนหลัง</div>
            <div className="bg-white rounded-xl shadow-md border-2 border-[#F4F4F5] p-3 flex flex-col mb-4">
              <div className="text-[16px] font-bold ml-3 mt-2 mb-1">
                ยอดพัสดุย้อนหลัง
              </div>
              <div className="flex gap-[2px] border-2 border-[#F4F4F5] bg-[#F4F4F5] rounded whitespace-nowrap ">
                {[
                  ["3months", "3 เดือน"],
                  ["6months", "6 เดือน"],
                  ["12months", "12 เดือน"],
                  ["3years", "3 ปี"],
                  ["custom", "ตั้งเอง"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setHistoryTab(key as HistoryTabType)}
                    className={`w-20 px-3 py-1 text-[12px] font-bold rounded transition-all ${
                      historyTab === key
                        ? "bg-[#D4D4D8] text-black"
                        : "bg-[#F4F4F5] text-[#797981] hover:bg-[#797981] hover:text-black"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-5 ml-3">
                {historyTab !== "custom" ? (
                  <Line data={chartData} options={options} />
                ) : (
                  <p>ตั้งค่าปี</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mb-6">
              {/* ต่ำสุด */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    ยอดต่ำสุด{" "}
                    <span className="text-gray-500 text-[10px] font-normal">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {minVal.toLocaleString()}
                </div>
                <div className="flex justify-center">
                  <div className="bg-[#FDD0DF] text-[#F41E68] text-[10px] px-2 py-[2px] font-bold rounded mt-2">
                    {
                      current3MonthsDataObj.find(
                        (item) => item.parcels === minVal
                      ) && getLabelFromDate(current3MonthsDataObj.find((item) => item.parcels === minVal)!.date) 
                    }
                  </div>
                </div>
              </div>

              {/* สูงสุด */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    ยอดสูงสุด{" "}
                    <span className="text-gray-500 text-[10px] font-normal">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {maxVal.toLocaleString()}
                </div>
                <div className="flex justify-center">
                  <div className="bg-[#D1F4E0] text-[#2ECE74] text-[10px] px-2 py-[2px] font-bold rounded mt-2">
                    {
                      current3MonthsDataObj.find(
                        (item) => item.parcels === minVal
                      ) && getLabelFromDate(current3MonthsDataObj.find((item) => item.parcels === maxVal)!.date) 
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* ค่าเฉลี่ย & Std.Dev */}
            <div className="flex gap-4 mb-6">
              {/* ค่าเฉลี่ย */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    ค่าเฉลี่ย{" "}
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2 mt-[22px]">
                  {Math.round(avgVal).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 font-bold text-center mt-3">
                  ชิ้น
                </div>
              </div>

              {/* Std.Dev */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    Std. Dev.{" "}
                    <span className="text-gray-500 text-[10px] font-normal">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {stdDev.toFixed(2).toLocaleString()}
                </div>
                <div className="flex justify-center items-center gap-3 mt-1">
                  <div className="bg-[#FDD0DF] text-[#F41E68] text-[10px] px-2 py-[2px] font-bold rounded mt-1 ${stdDev > (avgVal * 0.2) ? 'bg-[#FDD0DF] text-[#F41E68]' : 'bg-[#D1F4E0] text-[#2ECE74]'}`}">
                    ค่า{stdDev > avgVal * 0.2 ? "สูง" : "ต่ำ"}
                  </div>
                  <div className="bg-[#EEEEEF] text-[#797981] text-[10px] px-2 py-[2px] font-bold rounded mt-1">
                    {((stdDev / avgVal) * 100).toFixed(0)}% ของค่าเฉลี่ย
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ส่วนของข้อมูลสาขา */}
        {activeTab === "branch" && (
          <div>
            <div className="Stat-Name">ข้อมูลเบื้องต้น</div>
            <div className="info-section">
              <div className="info-row">
                <div className="icon-wrapper">
                  <span className="icon-symbol">#</span>
                </div>
                <div className="text-content">
                  <p className="label">รหัสสาขา:</p>
                  <span className="value">MXP-001</span>
                </div>
              </div>

              <div className="info-row">
                <div className="icon-wrapper">
                  <span className="icon-symbol">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 6h.008v.008H6V6Z"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-content">
                  <p className="label">ชื่อสาขา:</p>
                  <span className="value">My Express 1 สาขา ม.บูรพา</span>
                </div>
              </div>

              <div className="info-row">
                <div className="icon-wrapper">
                  <span className="icon-symbol">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-content full-width">
                  <p className="label">สร้างเมื่อ:</p>
                  <div className="value-with-link">
                    <span className="value">03/08/2025 @ 15:20 น.</span>
                    <span className="link-tag">โดย นายฮาร์ลีน นิวอิง</span>
                  </div>
                </div>
              </div>

              <div className="info-row">
                <div className="icon-wrapper">
                  <span className="icon-symbol">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-content full-width">
                  <p className="label">แก้ไขล่าสุด:</p>
                  <div className="value-with-link">
                    <span className="value">04/08/2025 @ 15:26 น.</span>
                    <span className="link-tag">โดย นายฮาร์ลีน นิวอิง</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border-2 border-[#F4F4F5] p-3 flex flex-col mb-4">
              <div className="text-[16px] font-bold ml-3 mt-2 mb-1">
                ยอดพัสดุย้อนหลัง
              </div>
              <div className="flex gap-[2px] border-2 border-[#F4F4F5] bg-[#F4F4F5] rounded whitespace-nowrap ">
                {[
                  ["3months", "3 เดือน"],
                  ["6months", "6 เดือน"],
                  ["12months", "12 เดือน"],
                  ["3years", "3 ปี"],
                  ["custom", "ตั้งเอง"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setHistoryTab(key as HistoryTabType)}
                    className={`w-20 px-3 py-1 text-[12px] font-bold rounded transition-all ${
                      historyTab === key
                        ? "bg-[#D4D4D8] text-black"
                        : "bg-[#F4F4F5] text-[#797981] hover:bg-[#797981] hover:text-black"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-5 ml-3">
                {historyTab !== "custom" ? (
                  <Line data={chartData} options={options} />
                ) : (
                  <p>ตั้งค่าปี</p>
                )}
              </div>
            </div>

            {/* ที่อยู่ */}
            <div className="info-row">
              <div className="icon-wrapper">
                <span className="icon-symbol">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                    />
                  </svg>
                </span>
              </div>
              <div className="text-content">
                <p className="label">ที่อยู่:</p>
                <span className="InfoValue">
                  16/119 ถนนลงหาดบางแสน 3
                  <div className="tag-container">
                    <span className="tag">แสนสุข</span>
                    <span className="tag">เมืองชลบุรี</span>
                    <span className="tag">ชลบุรี</span>
                  </div>
                </span>
              </div>
            </div>

            {/* รหัสไปรษณีย์ */}
            <div className="info-row">
              <div className="icon-wrapper">
                <span className="icon-symbol">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 6h.008v.008H6V6Z"
                    />
                  </svg>
                </span>
              </div>
              <div className="text-content">
                <p className="label">รหัสไปรษณีย์:</p>
                <span className="value">20130</span>
              </div>
            </div>

            {/* ตำแหน่ง */}
            <div className="info-row">
              <div className="icon-wrapper">
                <span className="icon-symbol">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                </span>
              </div>
              <div className="text-content">
                <p className="label">ตำแหน่ง:</p>
                <span className="InfoValue">
                  ละติจูด:
                  <span className="line">13.284613191857556</span>
                </span>
                <span className="InfoValue">
                  ลองจิจูด:
                  <span className="line">100.92369574570326</span>
                </span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default BranchInfo;
