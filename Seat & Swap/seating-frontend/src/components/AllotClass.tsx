import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance';

interface AllotClassProps {
    notAllotted:boolean;
    handleAllotment: (classroom:string) => void;
}

const AllotClass:React.FC<AllotClassProps> = ({notAllotted,handleAllotment}) => {
    const [classrooms, setClassrooms] = useState<string[]>([]);
    const [selectedClassroom, setSelectedClassroom] = React.useState<string>('');
    
    useEffect(() => {
        // Fetch classrooms for the dropdown
        axiosInstance.get("api/classrooms/")
        .then(response => {
            setClassrooms(response.data);
        })
        .catch(error => console.error("Error fetching classrooms:", error));
    }, []);


    if (!notAllotted) return null;
    return (
    <>
    <div className='flex gap-2 justify-center my-6'>

    <div className="mb-4">
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            >
            <option value="">Select a classroom</option>
            {classrooms.map((classroom) => (
                <option key={classroom} value={classroom}>
                {classroom}
              </option>
            ))}
          </select>
        </div>
        <button
            onClick={() => handleAllotment(selectedClassroom)}
            className="px-4 py-2 h-fit bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
            Allot Classroom
          </button>
              </div>
    </>
  )
}

export default AllotClass