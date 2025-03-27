import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExerciseItem = ({ exercise }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/exercise/${exercise.id}`);
  };
  
  return (
    <div onClick={handleClick} className="bg-white shadow-md rounded-lg p-6 mb-4 max-w-sm cursor-pointer">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <img 
          src={exercise.gifUrl} 
          alt={exercise.name} 
          className="w-full h-full object-contain rounded-md"
        />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{exercise.name}</h3>
      <p className="text-gray-700 mb-1"><strong>Body Part:</strong> {exercise.bodyPart}</p>
      <p className="text-gray-700 mb-1"><strong>Equipment:</strong> {exercise.equipment}</p>
    </div>
  );
};

export default ExerciseItem;
