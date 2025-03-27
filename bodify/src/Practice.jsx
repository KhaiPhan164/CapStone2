import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get('http://localhost:3000/exercises'); // Đảm bảo API đúng URL
        setExercises(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Exercise List</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Exercise ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Body Part</th>
            <th className="py-2 px-4 border-b">Equipment</th>
            <th className="py-2 px-4 border-b">Target Muscle</th>
            <th className="py-2 px-4 border-b">Secondary Muscles</th>
            <th className="py-2 px-4 border-b">Instructions</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id}>
              <td className="py-2 px-4 border-b">{exercise.id}</td>
              <td className="py-2 px-4 border-b">{exercise.name}</td>
              <td className="py-2 px-4 border-b">{exercise.bodyPart}</td>
              <td className="py-2 px-4 border-b">{exercise.equipment || 'None'}</td>
              <td className="py-2 px-4 border-b">{exercise.target}</td>
              <td className="py-2 px-4 border-b">
                {exercise.secondaryMuscles.join(', ')}
              </td>
              <td className="py-2 px-4 border-b">
                <ul>
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index}>{`Step ${Object.keys(instruction)[0]}: ${Object.values(instruction)[0]}`}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExerciseList;
