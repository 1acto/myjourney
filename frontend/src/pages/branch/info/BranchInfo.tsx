/*
* BranchInfo
* Component Modal Delete
* @author : Saowalak 66160380
* @Create Date : 2025-10-23
*/
import { useState, useMemo } from "react";
import "./BranchInfo.css";
import { Line } from "react-chartjs-2";
import { LuTrendingUp, LuTrendingDown } from "react-icons/lu";

// ไอคอนเมนู/ปิด + นำทาง
import { FiMoreHorizontal, FiX, FiEdit2, FiTrash2 } from "react-icons/fi"; 
import { useNavigate } from "react-router-dom"; 

// โมดัลลบแบบคอมโพเเนนท์ (ใช้ชุดเดียวกับ LocationInfo)
import ConfirmModal from "@/components/modals/delete/ConfirmDeleteModal"; 
import SuccessModal from "@/components/modals/delete/SuccessDeleteModal"; 


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
  ChartDataLabels as any, // cast เป็น any เพื่อ TypeScript ไม่ error
);

type TabType = "income" | "branch";
type HistoryTabType = "3months" | "6months" | "12months" | "3years" | "custom";

// 🎯 ฐานข้อมูลยอดพัสดุทั้งหมด 3 ปี (36 เดือน) เรียงจากใหม่ไปเก่า (ก.ย. 25 -> ต.ค. 22)
// ใช้ค่าเฉลี่ย 100 ชิ้นต่อ 1,000 บาทของยอดขายเดิม
const ALL_PARCEL_HISTORY = [
  // 2025 (9 เดือน)
  { month: "ก.ย. 2025", parcels: 900 }, // 🎯 เดือนล่าสุด
  { month: "ส.ค. 2025", parcels: 793 },
  { month: "ก.ค. 2025", parcels: 593 },
  { month: "มิ.ย. 2025", parcels: 450 },
  { month: "พ.ค. 2025", parcels: 480 },
  { month: "เม.ย. 2025", parcels: 400 },
  { month: "มี.ค. 2025", parcels: 320 },
  { month: "ก.พ. 2025", parcels: 500 },
  { month: "ม.ค. 2025", parcels: 420 },
  // 2024 (12 เดือน)
  { month: "ธ.ค. 2024", parcels: 340 },
  { month: "พ.ย. 2024", parcels: 250 },
  { month: "ต.ค. 2024", parcels: 200 },
  { month: "ก.ย. 2024", parcels: 120 },
  { month: "ส.ค. 2024", parcels: 300 },
  { month: "ก.ค. 2024", parcels: 380 },
  { month: "มิ.ย. 2024", parcels: 450 },
  { month: "พ.ค. 2024", parcels: 520 },
  { month: "เม.ย. 2024", parcels: 600 },
  { month: "มี.ค. 2024", parcels: 640 },
  { month: "ก.พ. 2024", parcels: 700 },
  { month: "ม.ค. 2024", parcels: 620 },
  // 2023 (12 เดือน)
  { month: "ธ.ค. 2023", parcels: 550 },
  { month: "พ.ย. 2023", parcels: 480 },
  { month: "ต.ค. 2023", parcels: 410 },
  { month: "ก.ย. 2023", parcels: 350 },
  { month: "ส.ค. 2023", parcels: 290 },
  { month: "ก.ค. 2023", parcels: 220 },
  { month: "มิ.ย. 2023", parcels: 180 },
  { month: "พ.ค. 2023", parcels: 150 },
  { month: "เม.ย. 2023", parcels: 130 },
  { month: "มี.ค. 2023", parcels: 110 },
  { month: "ก.พ. 2023", parcels: 90 },
  { month: "ม.ค. 2023", parcels: 100 },
  // 2022 (3 เดือน)
  { month: "ธ.ค. 2022", parcels: 120 },
  { month: "พ.ย. 2022", parcels: 115 },
  { month: "ต.ค. 2022", parcels: 110 },
];

const YEAR_LABELS_3 = ["2023", "2024", "2025"];

function BranchInfo(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("income");
  const [historyTab, setHistoryTab] = useState<HistoryTabType>("3months");

  // state/handler ของเมนู + โมดัล
  const [menuOpen, setMenuOpen] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const navigate = useNavigate(); 

  const toggleMenu = () => setMenuOpen((v) => !v); 
  const closeMenu = () => setMenuOpen(false); 
  const handleEdit = () => {
    closeMenu();
    // TODO: ไปหน้าแก้ไขถ้าต้องการ
  }; 
  const openDeleteConfirm = () => {
    closeMenu();
    setShowConfirm(true);
  }; 
  const handleConfirmDelete = (reason: string) => {
    // TODO: ลบสาขาจริง พร้อมส่ง reason
    setShowConfirm(false);
    setShowSuccess(true);
  }; 
  const handleAcknowledge = () => {
    setShowSuccess(false);
    navigate("/branches"); // กลับหน้ารายการสาขา
  }; 

  const selected = useMemo(() => {
    let data: number[] = [];
    let labels: string[] = [];
    let monthsToSlice = 0;

    switch (historyTab) {
      case "3months":
        monthsToSlice = 3;
        break;
      case "6months":
        monthsToSlice = 6;
        break;
      case "12months":
        monthsToSlice = 12;
        break;
      case "3years":
        monthsToSlice = 36;
        break;
      case "custom":
      default:
        return { data: [], labels: [] };
    }

    // 1. ตัดข้อมูล N เดือนล่าสุด
    const slicedData = ALL_PARCEL_HISTORY.slice(0, monthsToSlice);

    if (historyTab === "3years") {
      // **เคสพิเศษ 3 ปี: คำนวณยอดรวมรายปีจาก 36 เดือนล่าสุด**
      const data36 = slicedData;

      // ปี 2025 (12 เดือนล่าสุด: ต.ค. 24 - ก.ย. 25)
      const parcelsYear3 = data36
        .slice(0, 12)
        .reduce((sum, item) => sum + item.parcels, 0);
      // ปี 2024 (12 เดือนก่อนหน้า: ต.ค. 23 - ก.ย. 24)
      const parcelsYear2 = data36
        .slice(12, 24)
        .reduce((sum, item) => sum + item.parcels, 0);
      // ปี 2023 (12 เดือนก่อนหน้า: ต.ค. 22 - ก.ย. 23)
      const parcelsYear1 = data36
        .slice(24, 36)
        .reduce((sum, item) => sum + item.parcels, 0);
      // เรียงจากเก่าไปใหม่: 2023, 2024, 2025
      data = [parcelsYear1, parcelsYear2, parcelsYear3];
      labels = YEAR_LABELS_3;
    } else {
      // **เคสรายเดือน: 3, 6, 12 เดือน**
      // 2. เรียงลำดับกลับ (จากเก่าไปใหม่) สำหรับแสดงกราฟ
      const reversedData = slicedData.reverse();

      data = reversedData.map((item) => item.parcels);
      labels = reversedData.map((item) => item.month);
    }

    return { data, labels };
  }, [historyTab]);

  // ส่วนการคำนวณสถิติสำหรับ Stat Cards (ใช้ข้อมูล 3 เดือนล่าสุด)
  const latestParcel = ALL_PARCEL_HISTORY[0];
  const current3MonthsDataObj = ALL_PARCEL_HISTORY.slice(0, 3);
  const current3MonthsData = current3MonthsDataObj.map((item) => item.parcels);

  const minVal = Math.min(...current3MonthsData);
  const maxVal = Math.max(...current3MonthsData);
  const avgVal =
    current3MonthsData.reduce((a, b) => a + b, 0) / current3MonthsData.length;

  const variance =
    current3MonthsData
      .map((v) => Math.pow(v - avgVal, 2))
      .reduce((a, b) => a + b, 0) / current3MonthsData.length;
  const stdDev = Math.sqrt(variance);

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
      chartArea.bottom,
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
  const previousParcel = ALL_PARCEL_HISTORY[1]; // ดึงยอดพัสดุเดือนก่อนหน้า
  const change = latestParcel.parcels - previousParcel.parcels;
  // ป้องกันการหารด้วยศูนย์ (ถ้าเดือนก่อนมี 0 ชิ้น)
  const changePercent =
    previousParcel.parcels === 0
      ? change > 0
        ? 100
        : 0
      : (change / previousParcel.parcels) * 100;

  const isPositiveChange = change > 0;
  const changeSign = isPositiveChange ? "↑" : change < 0 ? "↓" : "";

  // กำหนดสี: เขียวสำหรับบวก, แดงสำหรับลบ, เทาสำหรับไม่มีการเปลี่ยนแปลง
  const changeTextColor = isPositiveChange
    ? "text-[#15B100]"
    : change < 0
      ? "text-red-500"
      : "text-gray-500";

  const changeDisplay = `${Math.abs(changePercent).toFixed(2)}%`;

  const parcelStatus = getParcelStatus(latestParcel.parcels);

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="relative">
        {/* Title Container */}
        <div className="bg-[#C8CAE0] flex flex-col p-5">
           {/* ปุ่มสามจุด + กากบาท (มุมขวาบน) */}
          <div className="ml-auto flex items-center gap-2 absolute right-4 top-4">
            <button
              className="w-9 h-9 rounded-xl bg-white border border-[#EEEEEF] flex items-center justify-center"
              onClick={toggleMenu}
              aria-label="more"
            >
              <FiMoreHorizontal size={22} />
            </button>

            <button
              className="w-9 h-9 rounded-xl bg-white border border-[#EEEEEF] flex items-center justify-center"
              onClick={() => {
                // TODO: ปิด/ย้อนกลับ
                navigate("/branches");
              }}
              aria-label="close"
            >
              <FiX size={22} />
            </button>

            {menuOpen && (
              <div
                className="absolute top-11 right-0 w-44 bg-white border border-[#EEEEEF] rounded-2xl shadow-xl p-2"
                onMouseLeave={closeMenu}
              >
                <div
                  className="flex items-center gap-2 font-semibold text-sm px-2 py-2 rounded-lg cursor-pointer hover:bg-[#F4F4F5]"
                  onClick={handleEdit}
                >
                  <FiEdit2 className="text-black" />
                  แก้ไข
                </div>
                <div
                  className="flex items-center gap-2 font-semibold text-sm px-2 py-2 rounded-lg cursor-pointer text-[#F31260] hover:bg-[#F4F4F5]"
                  onClick={openDeleteConfirm}
                >
                  <FiTrash2 />
                  ลบ
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="BranchID">MXP-001</span>
            <div
              className={`flex rounded-[5px] border-transparent ${parcelStatus.cardBgClass} ${parcelStatus.textClass} font-bold mt-4 pl-[7px] pr-[7px] pt-[3px] pb-[3px]`}
            >
              <span
                className="dot w-10"
                style={{ backgroundColor: parcelStatus.darkColorHex }}
              ></span>
              <span
                className={`${parcelStatus.textClass} font-bold text-[10px]`}
              >
                {parcelStatus.text}
              </span>
            </div>
          </div>
          <div className="BranchName">
            My Express 1 <br />
            สาขา ม.บูรพา
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
            <div className="font-bold text-lg mb-2">สถิติเดือนล่าสุด</div>
            <div className="flex gap-4 mb-6">
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    ยอดพัสดุ{" "}
                    <span className="text-gray-500 text-[10px] font-normal">
                      (ชิ้น)
                    </span>
                  </div>
                  <div className="text-black text-xs font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    {latestParcel.month} {/* 🎯 ใช้ latestParcel.month */}
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {latestParcel.parcels.toLocaleString()}
                </div>
                <div className="flex justify-center gap-2 text-[8px] mt-3">
                  <div
                    className={`flex rounded border-2 border-transparent ${parcelStatus.cardBgClass} ${parcelStatus.textClass} font-bold`}
                  >
                    {/* 🎯 ใช้ Inline Style เพื่อกำหนดสีพื้นหลังจุด */}
                    <span
                      className="dot mt-0.75 ml-1"
                      style={{ backgroundColor: parcelStatus.darkColorHex }}
                    ></span>
                    <span className="px-1">{parcelStatus.text}</span>
                  </div>
                  <div
                    className={`flex mt-0 font-bold ${changeTextColor} border-2 rounded pr-1 pl-1
                                    ${isPositiveChange ? "border-[#D1F4E0] bg-[#D1F4E0]" : change < 0 ? "border-red-300 bg-red-300" : "border-gray-300 bg-gray-3000"}`}
                  >
                    {changeDisplay}
                    {isPositiveChange && (
                      <LuTrendingUp className="size-[12px]" />
                    )}
                    {change < 0 && <LuTrendingDown className="size-[8px]" />}
                  </div>
                </div>
              </div>
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    รายได้{" "}
                    <span className="text-gray-500 text-[10px] font-normal">
                      (บาท)
                    </span>
                  </div>
                  <div className="text-black text-xs font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    {latestParcel.month}
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
                    <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {minVal.toLocaleString()}
                </div>
                <div className="flex justify-center">
                  <div className="bg-[#FDD0DF] text-[#F41E68] text-[10px] px-2 py-[2px] font-bold rounded">
                    {
                      current3MonthsDataObj.find(
                        (item) => item.parcels === minVal,
                      )?.month
                    }
                  </div>
                </div>
              </div>

              {/* สูงสุด */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    ยอดสูงสุด{" "}
                    <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {maxVal.toLocaleString()}
                </div>
                <div className="flex justify-center">
                  <div className="bg-[#D1F4E0] text-[#2ECE74] text-[10px] px-2 py-[2px] font-bold rounded">
                    {
                      current3MonthsDataObj.find(
                        (item) => item.parcels === maxVal,
                      )?.month
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
                    <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {Math.round(avgVal).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 font-bold text-center mt-2">
                  ชิ้น
                </div>
              </div>

              {/* Std.Dev */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    Std. Dev.{" "}
                    <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full mt-[-14px]">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">
                  {stdDev.toFixed(2).toLocaleString()}
                </div>
                <div className="flex justify-center items-center gap-3">
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
     {/* ใช้งานคอมโพเเนนท์โมดัล */}
      <ConfirmModal
        open={showConfirm}
        title="ยืนยันการลบสาขา"
        placeholder="กรุณาใส่หมายเหตุ . . ."
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
      />
      <SuccessModal
        open={showSuccess}
        title="ลบสาขาเสร็จสิ้น"
        buttonText="รับทราบ"
        onClose={handleAcknowledge}
      />
    </div>
  );
}

export default BranchInfo;
