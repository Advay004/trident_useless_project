import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from 'react-router-dom';

type Student = {
  id?: string; // Optional since we don't need to send it when adding a student
  roll_no: string;
  name: string;
  gender: "Male" | "Female"; // You are using gender locally, even though the API doesn't expect it
  groups: string[];
};

type Group = {
  id:string;
  name: string;
};

function AddStudent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [newStudent, setNewStudent] = useState<Student>({
    roll_no: "",
    name: "",
    gender: "Male", // The API doesn't require gender, but we're managing it locally
    groups: [],
  });

  const [newGroup, setNewGroup] = useState<string>("");
  const navigate = useNavigate();

  const handleRowClick = (id?: string) => {
    navigate(`/student-profile/${id}`);
  };


  // Fetch the list of students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get("/api/students/");
        setStudents(response.data); // Assuming response.data contains the list of students
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    const fetchGroups = async () => {
      try {
        const response = await axiosInstance.get("/api/groups/");
        setGroups(response.data);
        
      } catch (error) {
        console.log("Error fetching groups:",error);
      }
    }

    fetchStudents();
    fetchGroups();
  }, []);

  
  // Handle adding a new student
  const handleAddStudent = async () => {
    try {
      // Create the student payload without the `gender` field as the API doesn't require it
      const studentPayload = {
        name: newStudent.name,
        roll_no: newStudent.roll_no,
        groups: newStudent.groups,
        gender: newStudent.gender
      };

      // Post the new student to the API
      const response = await axiosInstance.post("/api/students/", studentPayload);

      // Add the newly added student to the local state
      setStudents([...students, response.data]);

      // Reset the new student form
      setNewStudent({ roll_no: "", name: "", gender: "Male", groups: [] });
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  // Handle adding a new group
  const handleAddGroup = async () => {
    try {
      // Post the new group to the API
      await axiosInstance.post("/api/groups/", { name: newGroup });
  
      // Fetch the updated group list from the API
      const response = await axiosInstance.get("/api/groups/");
  
      // Update the local state with the latest group data from the server
      setGroups(response.data);
  
      // Reset the new group input field
      setNewGroup("");
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  const toggleGroupSelection = (group: string) => {
    if (newStudent.groups.includes(group)) {
      setNewStudent({
        ...newStudent,
        groups: newStudent.groups.filter((g) => g !== group),
      });
    } else {
      setNewStudent({
        ...newStudent,
        groups: [...newStudent.groups, group],
      });
    }
  };

  return (
    <div className="p-6 flex space-x-6">
      {/* Left Half - Student List */}
      <div className="w-2/3">
        <h2 className="text-xl font-semibold mb-4 text-center">Student List</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Roll No</th>
              <th className="py-2 px-4 border">Name</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} onClick={()=>handleRowClick(student.id)}>
                <td className="py-2 px-4 border text-center">{student.roll_no}</td>
                <td className="py-2 px-4 border text-center">{student.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Half - Add Student and Add Group */}
      <div className="w-1/3 space-y-6">
        {/* Card for Adding New Student */}
        <div className="p-4 border border-gray-300 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Roll No</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={newStudent.roll_no}
              onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Name</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            />
          </div>
          <div className="mb-4 flex gap-4">
           <label className="text-sm ">Gender </label>
            <div>
              <label className="mr-4">
                <input
                  type="radio"
                  value="Male"
                  checked={newStudent.gender === "Male"}
                  onChange={(e) => setNewStudent({...newStudent,gender:e.target.value as "Male"|"Female"})}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  value="Female"
                  checked={newStudent.gender === "Female"}
                  onChange={(e) => setNewStudent({...newStudent,gender:e.target.value as "Male"|"Female"})}
                />
                Female
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Groups</label>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`px-3 py-1 border rounded-full cursor-pointer ${
                    newStudent.groups.includes(group.id) ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                  onClick={() => toggleGroupSelection(group.id)}
                >
                  {group.name}
                </div>
              ))}
            </div>
          </div>
          <button
            className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
            onClick={handleAddStudent}
          >
            Add Student
          </button>
        </div>

        {/* Card for Adding New Group */}
        <div className="p-4 border border-gray-300 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Group</h3>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Group Name</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-green-500 text-white rounded-md p-2 hover:bg-green-600"
            onClick={handleAddGroup}
          >
            Add Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
