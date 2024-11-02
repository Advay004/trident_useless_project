import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";



type Group = {
    id: string;
    name: string;
  };

type EditProfileProps = {
  isEditMode: boolean;
  onClose: () => void;
  onUpdate: (name: string, roll_no: number, gender: string, groups: string[]) => void;
  name: string;
  roll_no: number;
  gender: "Male" | "Female";
  groups: Group[];
};


function EditProfile({ isEditMode, onClose, onUpdate, name, roll_no, gender, groups }: EditProfileProps) {
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [editName, setEditName] = useState(name);
  const [editRollNo, setEditRollNo] = useState(roll_no);
  const [editGender, setEditGender] = useState<"Male" | "Female">(gender);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>(groups);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axiosInstance.get("/api/groups/");
        setAllGroups(response.data);
      } catch (error) {
        console.log("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (group: Group) => {
    setSelectedGroups((prevGroups) =>
      prevGroups.some((g) => g.id === group.id)
        ? prevGroups.filter((g) => g.id !== group.id)  // Remove the group if it's already selected
        : [...prevGroups, group]                       // Add the group if it's not selected
    );
  };

  const handleSubmit = () => {
    const groupIds = selectedGroups.map(group => group.id);
    onUpdate(editName, editRollNo, editGender, groupIds);   
  };

  if (!isEditMode) return null

  return (
    <div className="p-4 m-5 border border-gray-300 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-semibold mb-4">Student Profile</h2>
        <div className="grid grid-cols-2 relative">
            <div>
          <div className="mb-2 flex gap-4">
            <label className="text-lg font-medium flex gap-4">Name: </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border focus:border focus:border-gray-300 focus:ring-1 focus:ring-gray-200 outline-none h-8 p-1 rounded-lg "
            />
          </div>

          <div className="mb-2 flex gap-4">
            <label className="text-sm text-gray-600">Roll No: </label>
            <input
              type="number"
              value={editRollNo}
              onChange={(e) => setEditRollNo(parseInt(e.target.value))}
              className="border focus:border focus:border-gray-300 focus:ring-1 focus:ring-gray-200 outline-none h-6 p-1 rounded-lg w-10 "
            />
          </div>

          <div className="mb-2 flex gap-4">
            <label className="text-sm text-gray-600">Gender: </label>
            <div>
              <label className="mr-4">
                <input
                  type="radio"
                  value="Male"
                  checked={editGender === "Male"}
                  onChange={() => setEditGender("Male")}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  value="Female"
                  checked={editGender === "Female"}
                  onChange={() => setEditGender("Female")}
                />
                Female
              </label>
            </div>
          </div>

          <div className="mb-2 flex gap-4">
            <label className="text-sm text-gray-600">Groups: </label>
            <div className="flex flex-wrap gap-2">
              {allGroups.map((group) => (
                <span
                  key={group.id}
                  onClick={() => handleGroupClick(group)}
                  className={`cursor-pointer px-3 py-1 text-sm rounded-full ${
                    selectedGroups.some((g) => g.id === group.id)  // Check if the group is selected by comparing `id`
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {group.name}
                </span>
              ))}
            </div>
          </div>
          </div>

          <div className="flex justify-end absolute bottom-0 right-0 gap-2">
            <button onClick={handleSubmit} className="hover:text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>

            </button>
            <button onClick={onClose} className="hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

            </button>
          </div>
        </div>
    </div>
  );
}

export default EditProfile;
