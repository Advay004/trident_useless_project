import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import UpdateSeating from "../components/UpdateSeating";
import AllotClass from "../components/AllotClass";
import AddBenchForm from "../components/AddBenchForm";

type Student = {
  student_name: string;
  roll_no: string;
  bench_no: string;
  position: number;
};

type SeatingData = {
  room_no: string;
  benches: {
    [key: string]: [string, number][];
  };
};

function BenchLayout() {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [seatingData, setSeatingData] = useState<SeatingData>({
    room_no: "",
    benches: {},
  });
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [notAllotted, setNotAllotted] = useState<boolean>(false);
  const [isBenchFormOpen, setIsBenchFormOpen] = useState<boolean>(false);
  const [totalStudents,setTotalStudents] = useState<string>('0');

  useEffect(() => {
    // Fetch student data
    const fetchStudentData = async () => {
      try {
        const response = await axiosInstance.get(`/api/get-seating/?date=${selectedDate}`);
        setStudentData(response.data.seating_arrangement);
        setTotalStudents(response.data.total_students_seated);
      } catch (err) {
        console.error('Failed to fetch student data', err);
        setStudentData([])
        setTotalStudents('0');
      }
    };

    // Fetch seating data
    const fetchSeatingData = async () => {
      try {
        const response = await axiosInstance.get(`/api/class-and-benches/?date=${selectedDate}`);
        setSeatingData(response.data);
        setNotAllotted(false)
      } catch (err: any) {
        console.error('Failed to fetch seating data', err);
        setSeatingData({
          room_no: "",
          benches: {},
        })
        if (err.response && err.response.data && !err.response.data.allotted) {
          setNotAllotted(true);
        }
      }
    };
    if (selectedDate === '') {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // Formats the date as YYYY-MM-DD
      setSelectedDate(formattedDate);
    }
    fetchStudentData();
    fetchSeatingData();

  }, [isPopupOpen, selectedDate, notAllotted, isBenchFormOpen]);

  const handleUpdateSeating = async (mode: string, pairs?: [string, string][]) => {
    try {
      await axiosInstance.post(`/api/seating/?date=${selectedDate}`, {
        mode,
        date: selectedDate,
        pairs
      });
      console.log('Seating updated successfully');
      setIsPopupOpen(false);
    } catch (error) {
      console.error('Failed to update seating', error);
    }
  };

  const handleClassAllotment = async (classroom: string) => {
    try {
      await axiosInstance.post(`/api/class-and-benches/`, {
        classroom,
        date: selectedDate
      });
      setNotAllotted(false);
    } catch (error) {
      console.error('Failed to allot classroom')
    }
  }

  const getGridColsClass = (count: number): string => {
    switch (count) {
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      default:
        return "grid-cols-3";
    }
  };

  const modifyDate = (modifier: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + modifier);
    setSelectedDate(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD if needed
  };

  // Group students by bench_no
  const groupedStudents = studentData.reduce<{ [key: string]: Student[] }>((acc, student) => {
    if (!acc[student.bench_no]) {
      acc[student.bench_no] = [];
    }
    acc[student.bench_no].push(student);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h2 className="text-2xl uppercase font-semibold mb-4 text-center">Seating Arrangement Settings</h2>
      <div className="flex justify-between items-center">

        <div className="mb-4 flex justify-center gap-4">

          <button
            className="cursor-pointer bg-gray-800 px-3 py-2 rounded-md text-white tracking-wider shadow-xl hover:animate-none"
            onClick={() => modifyDate(-1)}
          >
            <svg
              className="w-5 h-5 rotate-90"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                stroke-linejoin="round"
                stroke-linecap="round"
              ></path>
            </svg>
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-32 border border-gray-300 rounded-md p-2"
          />
          <button
            className="cursor-pointer bg-gray-800 px-3 py-2 rounded-md text-white tracking-wider shadow-xl hover:animate-none"
            onClick={() => modifyDate(+1)}
          >
            <svg
              className="w-5 h-5 -rotate-90"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                stroke-linejoin="round"
                stroke-linecap="round"
              ></path>
            </svg>
          </button>
        </div>

        {!isBenchFormOpen && (
          <button
            className="relative inline-block p-px font-semibold leading-6 text-white h-fit bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-300 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
            onClick={() => { setIsBenchFormOpen(true) }}>
            <span
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            ></span>

            <span className="relative z-10 block px-6 py-3 rounded-xl bg-gray-950">
              <div className="relative z-10 flex items-center space-x-2">
                <span className="transition-all duration-500 group-hover:translate-x-1"
                >Add Bench</span>
              </div>
            </span>
          </button>
        )}

        {!notAllotted && (<button
          className="relative inline-block p-px font-semibold leading-6 text-white h-fit bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-300 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
          onClick={() => { setIsPopupOpen(true) }}>
          <span
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          ></span>

          <span className="relative z-10 block px-6 py-3 rounded-xl bg-gray-950">
            <div className="relative z-10 flex items-center space-x-2">
              <span className="transition-all duration-500 group-hover:translate-x-1"
              >Update Seating</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-1"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </span>
        </button>)}
      </div>
      <div className="w-2/3 mx-auto rounded-lg h-3 mt-8 mb-4 bg-gray-500"></div>
      <h6 className="w-full text-center mb-3">{seatingData.room_no} ({totalStudents}/72)</h6>
      <div className="grid grid-cols-3 gap-6">
        {['A', 'B', 'C'].map((column) => (
          <div key={column}>
            {seatingData.benches[column]?.map(([benchNo, capacity], index) => (
              <div key={index} className="flex items-center gap-4 mb-2 bg-gray-100 rounded-md p-2">
                {/* Vertical Bench No */}
                <div className="text-sm font-bold w-2" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  {benchNo}
                </div>
                {/* Students in Bench */}
                <div className={`grid ${getGridColsClass(capacity)} gap-1 flex-grow h-10`}>
                  {groupedStudents[benchNo]?.map((student) => (
                    <div key={student.roll_no} className="p-2 bg-gray-200 text-center">
                      {student.roll_no}
                    </div>
                  ))}
                  {/* Empty seats for unseated positions */}
                  {Array.from({ length: capacity - (groupedStudents[benchNo]?.length || 0) }).map((_, i) => (
                    <div key={i} className="p-2 bg-gray-200 text-center">
                      {/* Empty Seat */}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <AllotClass
        notAllotted={notAllotted}
        handleAllotment={handleClassAllotment}
      />

      <UpdateSeating
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onUpdate={handleUpdateSeating}
      />

      <AddBenchForm
        isOpen={isBenchFormOpen}
        onClose={() => setIsBenchFormOpen(false)}
      />

    </div>
  );
}

export default BenchLayout;
