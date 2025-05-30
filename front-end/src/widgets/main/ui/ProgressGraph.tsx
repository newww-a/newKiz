import ReactApexChart from "react-apexcharts"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { Link } from "react-router-dom"
import { GetTodayReadNewsCount } from "../api/MainApi"

export const ProgressGraph: React.FC = () => {

  const { data: todayReadNewsCount, isLoading, isError, error } = GetTodayReadNewsCount();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const [remainingTime, setRemainingTime] = useState<string>("")
  const [startEnterTime, setStartEnterTime] = useState<string>("")

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (isLoading) return <div className="loading">Loading...</div>;
  if (isError) {
    console.error("Error fetching today read news:", error); // 에러 로그 출력
    return <div>Error: {error.message}</div>;
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      height: 300,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "55%",
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -7,
            show: true,
            color: "#202020",
            fontSize: windowWidth < 640 ? "12px" : "18px",
            fontFamily: "Pretendard",
            fontWeight: "bold",
          },
          value: {
            color: "#202020",
            offsetY: windowWidth < 640 ? 2 : 15,
            fontSize: windowWidth < 640 ? "18px" : "30px",
            show: true,
            fontFamily: "Pretendard",
            fontWeight: "bold",
          },
        },
        track: {
          background: "#E0E0E0", // 트랙 색상 설정
        },
      },
    },
    fill: {
      colors: ["#7CBA36"], // 진행 바 색상 변경
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["오늘 읽은 뉴스"],
  }


  const percentage = (todayReadNewsCount.data / 5) * 100; // 퍼센트 계산
  const series = [percentage]

  // 시간 계산해서 버튼 보여주기
  const checkTimeValidity = () => {
    const now = dayjs(); // 현재 시간
    
    // 현재 시각의 분과 초 추출
    const currentMinute = now.minute();
    
    // 5분 주기로 반복되는 패턴에서 현재 위치 계산 (0-4)
    const minuteInCycle = currentMinute % 5;
    
    // 활성화 여부 판단: 
    // 2-4분 구간에 활성화 (3분 동안)
    const isInTimeRange = minuteInCycle >= 2;
    
    setIsEnabled(isInTimeRange);
    
    // 남은 시간 계산
    let nextChangeTime;
    
    if (isInTimeRange) {
      // 현재 활성화 상태일 때 - 비활성화될 때까지 남은 시간 계산
      nextChangeTime = now.startOf('hour').add(Math.floor(currentMinute / 5) * 5 + 5, 'minute');
      
      const diffInSeconds = nextChangeTime.diff(now, 'second');
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      setRemainingTime(formattedTime);
      setStartEnterTime("");
    } else {
      // 현재 비활성화 상태일 때 - 활성화될 때까지 남은 시간 계산
      nextChangeTime = now.startOf('hour').add(Math.floor(currentMinute / 5) * 5 + 2, 'minute');
      
      const diffInSeconds = nextChangeTime.diff(now, 'second');
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      setStartEnterTime(formattedTime);
      setRemainingTime("");
    }
  };
  


  useEffect(() => {
    // 초기 상태 확인
    checkTimeValidity()

    // 1초마다 시간 확인
    const intervalId = setInterval(checkTimeValidity, 1000)

    return () => clearInterval(intervalId)
  }, [])


  return (
    <div className="bg-white/90 shadow-m rounded-[15px] shadow-[4px_4px_3px_rgba(0,0,0,0.13)] w-40 h-40 m-3 sm:w-60 sm:h-60 flex justify-center items-center">
      {series[0] >= 100 ? ( // 오늘 할당량을 다 채웠다면 버튼 활성화
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="font-bold text-md">{isEnabled ? remainingTime : startEnterTime}</p>
          <p className="font-bold text-md">
            {isEnabled ? "후에 게임이 시작해요" : "후에 입장이 가능해요"}
          </p>
          {isEnabled ? (
            <Link
              to="/game"
              state={{ from: "/" }}
              className="rounded-lg px-3 py-2 bg-[#7CBA36] text-white font-semibold"
            >
              게임 입장하기
            </Link>
          ) : (
            <button
              disabled
              className="rounded-lg px-3 py-2 bg-[#d4d4d4] text-white font-semibold"
            >
              게임 입장하기
            </button>
          )}
        </div>
      ) : (
        <ReactApexChart options={options} series={series} type="radialBar" height="100%" />
      )}
    </div>
  )
}
