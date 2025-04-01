import React, { useState } from "react";
import Header from "../../layout/Header";
import { Listbox } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
const trainers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    specialty: "CrossFit",
    description: "Chuyên gia CrossFit với hơn 5 năm kinh nghiệm huấn luyện.",
    image: "./images/burn.JPG",
  },
  {
    id: 2,
    name: "Trần Thị B",
    specialty: "Yoga",
    description: "Giảng viên Yoga, chuyên về sức khỏe tâm trí và cơ thể.",
    image: "./images/burn.JPG",
  },
  {
    id: 3,
    name: "Lê Hoàng C",
    specialty: "Cardio",
    description: "Chuyên viên cardio, giúp bạn đạt hiệu quả nhanh chóng trong việc giảm cân.",
    image: "./images/burn.JPG",
  },
];

const options = [
  { id: 1, name: "Tất cả thể loại" },
  { id: 2, name: "Thể loại 1" },
  { id: 3, name: "Thể loại 2" },
  { id: 4, name: "Thể loại 3" },
];
export default function TrainerList() {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 xl:max-w-[1067px] py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Danh sách Huấn Luyện Viên
        </h1>
        <p className="text-gray-700 mb-6">
          Khám phá đội ngũ huấn luyện viên chuyên nghiệp của chúng tôi, những
          người sẽ giúp bạn đạt được mục tiêu thể hình của mình. Chọn một huấn
          luyện viên với chuyên môn phù hợp để bắt đầu hành trình sức khỏe và
          thể hình của bạn!
        </p>
        <div className="flex items-center mb-6">
          <Listbox value={selectedOption} onChange={setSelectedOption}>
            <div className="relative w-44">
              {/* Button for selecting option */}
              <Listbox.Button className="bg-white w-full border-2 border-gray-100 text-gray-700 px-4 py-2 rounded flex items-center justify-between">
                {selectedOption.name}
                <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
              </Listbox.Button>

              {/* Dropdown options */}
              <Listbox.Options className="absolute mt-1 w-full bg-white border-2 border-gray-100 rounded-md shadow-lg z-10">
                {options.map((option) => (
                  <Listbox.Option key={option.id} value={option}>
                    {({ active, selected }) => (
                      <li
                        className={`${
                          active
                            ? "bg-[#ffd26a] text-white"
                            : "bg-white text-black"
                        } px-4 py-2 cursor-pointer flex items-center`}
                      >
                        {selected && (
                          <span className="mr-2 text-text">&#10003;</span>
                        )}
                        {option.name}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="p-4 flex flex-col items-center text-center bg-[#f5f5f5] border border-transparent hover:border-primary-500 hover:bg-[#fff3d8] rounded-[5px] shadow-lg group"
            >
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-full h-72 mb-4 relative"
              />
              <div className="flex items-start flex-col w-full text-left">
              <p className="text-white font-medium px-2 text-sm rounded-full bg-slate-400">{trainer.specialty}</p>
              <h2 className="text-xl font-semibold mt-2">{trainer.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{trainer.description}</p>
              <p className="text-gray-600 text-xs mt-2">Kinh nghiệm: {trainer.experience} năm</p>
              </div>
              <div className="gap-2 flex-row hidden group-hover:flex absolute -bottom-8">
                <button className="w-32 mt-4 px-6 py-1 bg-[#f3f3f3] text-gray-600 hover:bg-gray-200 transition font-semibold">
                  Xem trước
                </button>
                <button className="w-32 mt-4 px-6 py-1 bg-primary-500 text-white hover:bg-[#ffbc74] transition font-semibold">
                  Liên hệ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
