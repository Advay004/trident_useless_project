import React, { useEffect } from 'react';

interface UpdateSeatingProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (mode: string, pairs?: [string, string][]) => void; // Include pairs parameter for pair mode
}

const UpdateSeating: React.FC<UpdateSeatingProps> = ({ isOpen, onClose, onUpdate }) => {
  const [selectedMode, setSelectedMode] = React.useState<string>('DEFAULT');
  const modes = ['DEFAULT', 'MIXED', 'AGGRESSIVE'];

  useEffect(()=>{
  },[selectedMode])

  

  const handleSubmit = () => {
      onUpdate(selectedMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Update Seating</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select a mode</option>
            {modes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>


        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'}`}
          >
            Update Seating
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSeating;
