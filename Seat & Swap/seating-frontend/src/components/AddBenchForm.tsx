import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import axiosInstance from "../api/axiosInstance";


interface FormData {
  classroom: string;
  bench_no: string;
  capacity: number;
}

interface AddBenchFormProps {
  onClose: () => void;
  isOpen: boolean;
}

function AddBenchForm({ onClose,isOpen }: AddBenchFormProps) {
  const [classrooms, setClassrooms] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    classroom: "",
    bench_no: "",
    capacity: 0,
  });

  useEffect(() => {
    // Fetch classrooms for the dropdown
    axiosInstance.get("api/classrooms/")
      .then(response => {
            console.log(response.data)
          setClassrooms(response.data)
        }
        )
      .catch(error => console.error("Error fetching classrooms:", error));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axiosInstance.post("api/add_benches/", formData);
      // You might want to refresh the benches data here or close the form
      onClose();
    } catch (error) {
      console.error("Error adding bench:", error);
    }
  };

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-semibold mb-4">Add New Bench</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Classroom</label>
            <select
              name="classroom"
              value={formData.classroom}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select Classroom</option>
              {classrooms.map((classroom) => (
                <option key={classroom} value={classroom}>
                  {classroom}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Bench Number</label>
            <input
              type="text"
              name="bench_no"
              value={formData.bench_no}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
          >
            Add Bench
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-500 text-white rounded-md p-2 hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default AddBenchForm;
