import React from "react";
import Header from "../../layout/Header";

const sharedPlan = {
  plan_id: 1,
  plan_name: "Giảm cân cấp tốc",
  Description: "Chương trình giảm mỡ toàn thân trong 30 ngày",
  total_duration: 1200,
  planSlots: [
    {
      no: 1,
      duration: 40,
      note: "Khởi động nhẹ nhàng",
      exercisepost: { title: "Jumping Jacks" },
    },
    {
      no: 2,
      duration: 60,
      note: "Cardio tăng nhịp tim",
      exercisepost: { title: "High Knees" },
    },
    {
      no: 3,
      duration: 40,
      note: "Giãn cơ kết thúc buổi",
      exercisepost: { title: "Stretching" },
    },
  ],
};

const PlanDetail = () => {
  const { plan_name, Description, total_duration, planSlots } = sharedPlan;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              📋 {plan_name}
            </h1>
            <p className="text-lg text-gray-600">{Description}</p>
          </div>

          {/* Info Box */}
          <div className="flex justify-center gap-6 text-center mb-10">
            <div className="bg-white px-4 py-3 rounded-lg shadow text-gray-800">
              <div className="text-sm text-gray-500">🗓 Số buổi</div>
              <div className="text-lg font-bold">{planSlots.length}</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow text-gray-800">
              <div className="text-sm text-gray-500">⏱ Tổng thời gian</div>
              <div className="text-lg font-bold">{total_duration} phút</div>
            </div>
          </div>

          {/* Danh sách buổi tập */}
          <div className="grid gap-6">
            {planSlots.map((slot) => (
              <div
                key={slot.no}
                className="bg-white p-5 rounded-xl border-l-4 border-orange-400 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    🔸 Buổi {slot.no}: {slot.exercisepost.title}
                  </h3>
                  <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    {slot.duration} phút
                  </span>
                </div>
                <p className="text-gray-600 italic">📝 {slot.note}</p>
              </div>
            ))}
          </div>

          {/* CTA + Chia sẻ */}
          <div className="mt-12 text-center">
            <p className="text-gray-700 italic mb-3">
              Bạn đã sẵn sàng bắt đầu hành trình luyện tập chưa? 💪
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-all">
              Bắt đầu ngay
            </button>

            {/* Nút chia sẻ */}
            <div className="mt-8">
              <p className="text-gray-600 mb-2">Chia sẻ kế hoạch này:</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all">
                  <img
                    src="/images/fb.png"
                    className="w-5 h-5"
                    alt="Facebook"
                  />
                  Facebook
                </button>

                <button className="flex items-center gap-2 bg-white hover:bg-sky-50 border border-sky-500 text-sky-400 px-4 py-2 rounded-md transition-all">
                  <img src="/images/zalo.png" className="w-5 h-5" alt="Zalo" />
                  Zalo
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Đã sao chép liên kết!");
                  }}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800 transition-all"
                >
                  Sao chép link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
