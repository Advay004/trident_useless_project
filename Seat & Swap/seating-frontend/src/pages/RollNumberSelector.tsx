import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ScrollingSelector = () => {
  const rollNumbers = Array.from({ length: 72 }, (_, i) => (i + 1).toString());
  const [selectedRollNo, setSelectedRollNo] = useState('1');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const touchStartRef = useRef(0);

  useEffect(() => {
    const storedRollNo = localStorage.getItem('my-roll-no');
    if (storedRollNo) {
      setSelectedRollNo(storedRollNo);
    }
  }, []);

  useEffect(() => {
    if (selectedRollNo) {
      localStorage.setItem('my-roll-no', selectedRollNo);
      scrollToSelected();
    }
  }, [selectedRollNo]);

  const scrollToSelected = () => {
    const index = rollNumbers.indexOf(selectedRollNo);
    const itemElement = containerRef.current?.children[index];
    if (itemElement) {
      itemElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleSelect = () => {
    navigate('/'); // Navigate only when user clicks to save selection
  };

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const currentIndex = rollNumbers.indexOf(selectedRollNo);
    if (event.deltaY > 0 && currentIndex < rollNumbers.length - 1) {
      setSelectedRollNo(rollNumbers[currentIndex + 1]);
    } else if (event.deltaY < 0 && currentIndex > 0) {
      setSelectedRollNo(rollNumbers[currentIndex - 1]);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchCurrent = event.touches[0].clientY;
    const deltaY = touchStartRef.current - touchCurrent;

    if (deltaY > 20) {
      handleScroll({ deltaY: 1 } as any); // Simulate scroll down
      touchStartRef.current = touchCurrent; // Update starting point
    } else if (deltaY < -20) {
      handleScroll({ deltaY: -1 } as any); // Simulate scroll up
      touchStartRef.current = touchCurrent; // Update starting point
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative w-64 h-48 overflow-hidden">
        <div
          ref={containerRef}
          className="flex flex-col items-center justify-center h-full"
          onWheel={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {rollNumbers.map((rollNo, index) => {
            const currentIndex = rollNumbers.indexOf(selectedRollNo);
            const position = index - currentIndex;

            return (
              <div
                key={rollNo}
                className={`transition-all duration-300 ease-in-out text-center
                  ${position === 0 ? 'text-4xl font-bold' : position >= -3 && position <= 3 ? 'text-2xl opacity-80' : 'text-lg opacity-50'}`}
                onClick={handleSelect}
                style={{ margin: '5px 0', height: '50px' }}
              >
                {rollNo}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollingSelector;
