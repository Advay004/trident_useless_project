import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useParams } from 'react-router-dom';
import StudentProfileCard from "../components/StudentProfileCard";
import EditProfile from "../components/EditProfile";

type Group = {id:string,name:string}

type Student = {
  id: string;
  name: string;
  roll_no: number;
  gender: "Male" | "Female";
  groups: Group[];
  adjacent_students: {
    [key: string]: number;
  };
};

const StudentProfile = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditMode,setEditMode] = useState<boolean>(false);

  const { studentId } = useParams<{ studentId: string }>();

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await axiosInstance.get(`/api/student-profile/${studentId}/`);
        setStudent(response.data);
      } catch (error) {
        console.error("Error fetching student profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [studentId,isEditMode]);

  const handleUpdate = (name: string, roll_no: number, gender: string, groups: string[]) => {
    axiosInstance.put('/api/students/',{
      id:studentId,
      name,
      roll_no,
      gender,
      groups
    }).then(response => {
      // Handle success (e.g., notify user, close edit mode)
      console.log("Profile updated successfully:", response.data);
      setEditMode(false)
    })
    .catch(error => {
      // Handle error (e.g., show an error message)
      console.error("Error updating profile:", error);
    });
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!student) {
    return <div>No student profile found.</div>;
  }

  const maxAdjacencyCount = 30;

  return (<div>
    <StudentProfileCard 
    {...student}
    isEditMode={isEditMode}
    onClick={()=>setEditMode(true)}
    />
    <EditProfile 
    {...student}
    isEditMode={isEditMode}
    onClose={()=>setEditMode(false)}
    onUpdate={handleUpdate}
    />

      {/* Adjacent Students List */}
      
      <ul className="space-y-2 mt-16 p-4">
        {Object.entries(student.adjacent_students).map(([name, count]) => (
          <li key={name} className="flex items-center space-x-4">
            <span className="flex-1 text-end">{name}</span>
            <div className="w-1/2 rounded-full">
              <div
                className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                style={{ width: `${(count / maxAdjacencyCount) * 100}%` }}
              >
                {count}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentProfile;
