import React from 'react';
import Modal from 'react-modal';

// Gắn appElement cho react-modal (rất quan trọng để accessibility)
Modal.setAppElement('#root');

const PlanModal = ({ isOpen, onRequestClose, plan }) => {
  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Chi tiết kế hoạch"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
      className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-2xl font-bold text-orange-500">{plan.plan_name}</h2>
      <p className="text-gray-600 mt-2">{plan.Description}</p>
      <p className="text-sm text-gray-500 mt-1">
        Tổng thời gian: {plan.total_duration} phút
      </p>

      <div className="mt-6 space-y-4">
        {plan.planSlots.map((slot) => (
          <div key={slot.no} className="bg-gray-100 p-4 rounded-xl shadow-sm">
            <p className="font-semibold text-gray-700">Slot {slot.no}</p>
            <p className="text-sm text-gray-600">
              Thời lượng: {slot.duration} phút
            </p>
            <p className="text-sm text-gray-600">
              Ghi chú: {slot.note || <em>Không có</em>}
            </p>
            {slot.exercisepost && (
              <p className="text-sm text-gray-700">
                Bài tập:{' '}
                <span className="font-medium">
                  {slot.exercisepost.title}
                </span>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Thêm vào plan
        </button>
      </div>
    </Modal>
  );
};

export default PlanModal;
