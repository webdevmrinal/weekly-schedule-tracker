import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    axios
      .get("https://schedule-api-ecru.vercel.app/api/schedule")
      .then((response) => setScheduleData(response.data))
      .catch((error) => console.error("Error fetching schedule data", error));

    const calculateTimeRemaining = () => {
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
      const timeDiff = endOfDay - now;

      const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDiff / 1000) % 60);

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentDateString = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentDateISO = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString("en-CA");
  };

  const getCurrentDateSchedule = () => {
    if (!scheduleData) return null;

    const currentDateISO = getCurrentDateISO();
    return scheduleData.subjects
      .map((subject) => {
        const scheduleForToday = subject.schedule.find((schedule) => {
          const scheduleDateISO = new Date(schedule.date).toLocaleDateString(
            "en-CA"
          );
          return scheduleDateISO === currentDateISO;
        });
        return {
          subject: subject.name,
          schedule: scheduleForToday,
        };
      })
      .filter((entry) => entry.schedule);
  };

  const currentDateSchedule = getCurrentDateSchedule();
  console.log("data", scheduleData);

  return (
    <>
      <button
        className="m-2 md:mx-8 md:my-6 md:static relative left-1/2 -translate-x-1/2 md:translate-x-0 opacity-0"
        onClick={() => {
          setShowPopup(true);
        }}
        disabled
      >
        Update Schedule
      </button>
      {showPopup && (
        <Popup setShowPopup={setShowPopup} setScheduleData={setScheduleData} />
      )}
      <div className="m-auto max-w-5xl">
        <div className="flex items-center justify-center">
          <button className="">
            <svg
              width="35px"
              height="35px"
              viewBox="0 0 24.00 24.00"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth={0} />
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#CCCCCC"
                strokeWidth="0.048"
              />
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                  stroke="#ffffff"
                  strokeWidth="1.512"
                  strokeLinecap="round"
                />{" "}
              </g>
            </svg>
          </button>
        </div>
        <div className="">
          <div className="py-6 font-semibold text-4xl md:text-8xl text-transparent bg-clip-text bg-text-gradient text-center">
            {getCurrentDateString()}
          </div>
          {currentDateSchedule ? (
            <div className="md:w-[64rem] flex justify-between flex-col text-center md:flex-row items-center absolute top-[60%] md:top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
              {currentDateSchedule.map((entry, index) => (
                <div key={index} className="flex flex-col items-center my-2">
                  <div className="text-base md:text-xl font-medium md:py-6">
                    Subject {index + 1}
                  </div>
                  <div className="py-2 text-xl md:text-4xl uppercase font-bold tracking-widest">
                    {entry.subject}
                  </div>
                  <div className="font-thin md:text-2xl">
                    {entry.schedule.lecture}
                  </div>
                  <div className="italic text-sm">
                    ({entry.schedule.duration})
                  </div>
                  <button
                    className="my-4"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                  >
                    set complete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">No Schedule for Today</div>
          )}
        </div>
        <div className="absolute bottom-2 md:bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div>Time Remaining</div>
          <div className="font-thin text-6xl">{timeRemaining}</div>
        </div>
      </div>
    </>
  );
}

function Popup({ setShowPopup, setScheduleData }) {
  const [jsonInput, setJsonInput] = useState("");

  const handleSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      localStorage.setItem("scheduleData", JSON.stringify(parsedData));
      setScheduleData(parsedData);
      setShowPopup(false);
    } catch (error) {
      alert("Invalid JSON format. Please correct it and try again.");
    }
  };

  return (
    <div
      className="w-screen h-screen absolute top-0 left-0 z-10 bg-[rgba(0,0,0,0.5)] flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="w-1/2 h-1/2 bg-gray-900 py-4 px-8">
        <div className="text-center">Enter JSON:</div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="block m-auto w-full h-3/4 text-black"
        ></textarea>
        <div className="text-center my-4 flex items-center justify-center">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default App;
