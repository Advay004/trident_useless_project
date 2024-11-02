import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

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

function Home() {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [myRollNo,setMyRollNo] = useState<string>('');
  const [seatingData, setSeatingData] = useState<SeatingData>({
    room_no: "",
    benches: {},
  });
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const storedRollNo = localStorage.getItem('my-roll-no');
    if (storedRollNo){setMyRollNo(storedRollNo)}
    // Fetch student data
    const fetchStudentData = async () => {
      try {
        const response = await axiosInstance.get(`/api/get-seating/?date=${selectedDate}`);
        setStudentData(response.data.seating_arrangement);
      } catch (err) {
        console.error('Failed to fetch student data', err);
        setStudentData([])
      }
    };

    // Fetch seating data
    const fetchSeatingData = async () => {
      try {
        const response = await axiosInstance.get(`/api/class-and-benches/?date=${selectedDate}`);
        setSeatingData(response.data);
      } catch (err) {
        console.error('Failed to fetch seating data', err);
        setSeatingData({
          room_no: "",
          benches: {},
        })
      }
    };

    if (selectedDate === '') {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // Formats the date as YYYY-MM-DD
      setSelectedDate(formattedDate);
    }

    fetchStudentData();
    fetchSeatingData();
  }, [selectedDate]);

  const modifyDate = (modifier:number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + modifier);
    setSelectedDate(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD if needed
  };

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

  // Group students by bench_no
  const groupedStudents = studentData.reduce<{ [key: string]: Student[] }>((acc, student) => {
    if (!acc[student.bench_no]) {
      acc[student.bench_no] = [];
    }
    acc[student.bench_no].push(student);
    return acc;
  }, {});

  return (
    <div className="p-6 rotate-90 fixed overflow-hidden h-fit w-[200%] top-52 -right-48 
    md:rotate-0 md:relative md:overflow-auto md:h-auto md:w-auto md:top-auto md:right-auto">
      <h2 className="md:text-2xl uppercase font-semibold mb-4 text-center">Seating Arrangement</h2>

      <div className="mb-4 flex justify-center gap-4">
    
<button
  className="cursor-pointer w-6 h-6 md:w-auto md:h-auto bg-gray-800 md:px-3 md:py-2 px-1.5 py-1 rounded-md text-white tracking-wider shadow-xl hover:animate-none"
  onClick={()=>modifyDate(-1)}
>
  <svg
    className="md:w-5 md:h-5 h-3 w-3 rotate-90"
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
            className="w-32 h-6 md:h-auto border border-gray-300 rounded-md md:p-2 p-1"
          />
<button
  className="cursor-pointer w-6 h-6 md:w-auto md:h-auto bg-gray-800 md:py-2 px-1.5 py-1 rounded-md text-white tracking-wider shadow-xl hover:animate-none"
  onClick={()=>modifyDate(1)}
>
  <svg
    className="md:w-5 md:h-5 h-3 w-3 -rotate-90"
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

      <div className="w-2/3 hidden md:block mx-auto rounded-lg h-3 mt-8 mb-4 bg-gray-500"></div>
      <h4 className="text-center md:text-xl font-bold mb-4">{seatingData.room_no}</h4>
      <div className="grid grid-cols-3 gap-6">
        {['A', 'B', 'C'].map((column) => (
          <div key={column}>
            {seatingData.benches[column]?.map(([benchNo, capacity], index) => (
              <div key={index} className="flex items-center gap-4 mb-2 bg-gray-100 rounded-md md:p-2 px-1">
                {/* Vertical Bench No */}
                <div className="text-xs md:text-sm font-bold w-2" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  {benchNo}
                </div>
                {/* Students in Bench */}
                <div className={`grid ${getGridColsClass(capacity)} gap-1 flex-grow md:h-10 text-center items-center`}>
                  {groupedStudents[benchNo]?.map((student) => (
                    <div key={student.roll_no} className={`text-xs md:p-2 rounded-sm md:text-base h-full ${myRollNo==student.roll_no ? 'bg-green-500':' bg-gray-200'} text-center`}>
                      {student.roll_no}
                    </div>
                  ))}
                  {/* Empty seats for unseated positions */}
                  {Array.from({ length: capacity - (groupedStudents[benchNo]?.length || 0) }).map((_, i) => (
                    <div key={i} className="p-2 bg-gray-200 h-full rounded-sm text-center">
                      {/* Empty Seat */}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
