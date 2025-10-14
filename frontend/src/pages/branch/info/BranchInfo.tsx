import { useState, useMemo } from "react";
import "./BranchInfo.css";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, ChartData } from "chart.js";
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

type TabType = "income" | "branch";
type HistoryTabType = "3months" | "6months" | "12months" | "3years" | "custom";

// 🎯 ฐานข้อมูลยอดพัสดุทั้งหมด 3 ปี (36 เดือน) เรียงจากใหม่ไปเก่า (ก.ย. 25 -> ต.ค. 22)
// ใช้ค่าเฉลี่ย 100 ชิ้นต่อ 1,000 บาทของยอดขายเดิม
const ALL_PARCEL_HISTORY = [
    // 2025 (9 เดือน)
    { month: "ก.ย. 2025", parcels: 700 },  // 🎯 เดือนล่าสุด
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

  const selected = useMemo(() => {
    let data: number[] = [];
    let labels: string[] = [];
    let monthsToSlice = 0;

    switch (historyTab) {
      case "3months": monthsToSlice = 3; break;
      case "6months": monthsToSlice = 6; break;
      case "12months": monthsToSlice = 12; break;
      case "3years": monthsToSlice = 36; break; 
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
      const parcelsYear3 = data36.slice(0, 12).reduce((sum, item) => sum + item.parcels, 0); 
      // ปี 2024 (12 เดือนก่อนหน้า: ต.ค. 23 - ก.ย. 24)
      const parcelsYear2 = data36.slice(12, 24).reduce((sum, item) => sum + item.parcels, 0); 
      // ปี 2023 (12 เดือนก่อนหน้า: ต.ค. 22 - ก.ย. 23)
      const parcelsYear1 = data36.slice(24, 36).reduce((sum, item) => sum + item.parcels, 0); 
      // เรียงจากเก่าไปใหม่: 2023, 2024, 2025
      data = [parcelsYear1, parcelsYear2, parcelsYear3];
      labels = YEAR_LABELS_3;

    } else {
      // **เคสรายเดือน: 3, 6, 12 เดือน**
      // 2. เรียงลำดับกลับ (จากเก่าไปใหม่) สำหรับแสดงกราฟ
      const reversedData = slicedData.reverse(); 

      data = reversedData.map(item => item.parcels);
      labels = reversedData.map(item => item.month);
    }

    return { data, labels };
  }, [historyTab]);

  // ส่วนการคำนวณสถิติสำหรับ Stat Cards (ใช้ข้อมูล 3 เดือนล่าสุด)
  const latestParcel = ALL_PARCEL_HISTORY[0]; 
  const current3MonthsDataObj = ALL_PARCEL_HISTORY.slice(0, 3);
  const current3MonthsData = current3MonthsDataObj.map(item => item.parcels);
    
  const minVal = Math.min(...current3MonthsData);
  const maxVal = Math.max(...current3MonthsData);
  const avgVal = current3MonthsData.reduce((a, b) => a + b, 0) / current3MonthsData.length;
    
  const variance = current3MonthsData.map(v => Math.pow(v - avgVal, 2)).reduce((a, b) => a + b, 0) / current3MonthsData.length;
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
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(99,102,241,0.3)'); // สีเริ่มต้น (จางลงเล็กน้อยจาก borderColor)
    gradient.addColorStop(0.8, 'rgba(98, 100, 240, 0.1)'); // สีกลาง (จางลงอีก)
    gradient.addColorStop(1, 'rgba(36, 39, 239, 0)'); // สีสุดท้าย (โปร่งใส)
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
        bounds: 'ticks',
        grid: { display: false },
        ticks: {
          autoSkip: false,
          maxRotation: rotationAngle,
          minRotation: rotationAngle,
        }
      },
      y: { 
        beginAtZero: true,
        // 💡 การเพิ่ม suggestedMax เพื่อเผื่อพื้นที่ด้านบน
        // คำนวณจากค่าสูงสุดของข้อมูล * 1.20 (เผื่อพื้นที่ 20%)
        suggestedMax: Math.max(...selected.data) * 1.20 || 1000,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="relative">
        {/* Title Container */}
        <div className="bg-[#C8CAE0] flex flex-col p-5">
          <div className="flex items-center gap-2">
            <span className="BranchID">MXP-001</span>
            <div className="BranchExpress">
              <span className="dot"></span> ยอดพัสดุดีมาก
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
                    ยอดพัสดุ <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-xs font-bold bg-gray-200 px-2 rounded-full">
                    {latestParcel.month} {/* 🎯 ใช้ latestParcel.month */}
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">{latestParcel.parcels.toLocaleString()}</div>
                <div className="flex justify-center gap-2 text-xs">
                  <div className="stat-tag flex rounded">
                    <span className="dot"></span> ยอดพัสดุดีมาก
                  </div>
                  <div className="stat-percent">33.73% ↑</div>
                </div>
              </div>
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    รายได้ <span className="text-gray-500 text-xs">(บาท)</span>
                  </div>
                  <div className="text-black text-xs font-bold bg-gray-200 px-2 rounded-full">
                    {latestParcel.month}
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">{(latestParcel.parcels * 5).toLocaleString()}{/* 10 คือราคาต่อหน่วย */}</div>
                <div className="text-xs text-gray-500 font-bold mt-2">ค่าประมาณการจากยอดพัสดุ</div>
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
                    ยอดต่ำสุด <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">{minVal.toLocaleString()}</div>
                <div className="flex justify-center">
                  <div className="bg-[#FDD0DF] text-[#F41E68] text-[10px] px-2 py-[2px] font-bold rounded">
                    {current3MonthsDataObj.find(item => item.parcels === minVal)?.month} 
                  </div>
                </div>
              </div>

              {/* สูงสุด */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    ยอดสูงสุด <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">{maxVal.toLocaleString()}</div>
                <div className="flex justify-center">
                  <div className="bg-[#D1F4E0] text-[#2ECE74] text-[10px] px-2 py-[2px] font-bold rounded">
                    {current3MonthsDataObj.find(item => item.parcels === maxVal)?.month}
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
                    ค่าเฉลี่ย <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">{Math.round(avgVal).toLocaleString()}</div>
                <div className="text-xs text-gray-500 font-bold text-center mt-2">
                  ชิ้น
                </div>
              </div>

              {/* Std.Dev */}
              <div className="stat-card shadow-md border-2 border-[#F4F4F5]">
                <div className="stat-header flex justify-between items-center">
                  <div className="font-bold text-sm flex flex-col">
                    Std. Dev. <span className="text-gray-500 text-xs">(ชิ้น)</span>
                  </div>
                  <div className="text-black text-[10px] font-bold bg-gray-200 px-2 rounded-full">
                    3 เดือนล่าสุด
                  </div>
                </div>
                <div className="text-3xl font-bold text-center my-2">{stdDev.toFixed(2).toLocaleString()}</div>
                <div className="flex flex-col justify-center items-center">
                  <div className="bg-[#FDD0DF] text-[#F41E68] text-[10px] px-2 py-[2px] font-bold rounded mt-1 ${stdDev > (avgVal * 0.2) ? 'bg-[#FDD0DF] text-[#F41E68]' : 'bg-[#D1F4E0] text-[#2ECE74]'}`}">
                    ค่า{stdDev > (avgVal * 0.2) ? 'สูง' : 'ต่ำ'}
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
            <h3 className="font-bold text-lg mb-2">ข้อมูลสาขา</h3>
            <p>สาขา ม.บูรพา, My Express 1</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BranchInfo;