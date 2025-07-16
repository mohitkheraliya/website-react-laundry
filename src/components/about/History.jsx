import { useEffect, useRef, useState } from 'react'
import Loading from '../loading/Loading'

const History = () => {
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const baseURL = import.meta.env.VITE_BASE_URL

  const [currentIndex, setCurrentIndex] = useState(0)
  const cardRef = useRef(null)
  const [cardWidth, setCardWidth] = useState(1)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)

      try {
        const response = await fetch(`${baseURL}/laundry-history`, {
          method: 'GET',
        })
                  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          toast.error(errorData?.message || 'Something went wrong!', {
            position: 'top-center',
            className: 'toast-error',
          })
          setLoading(false)
          return
        }

        const data = await response.json()

        setHistoryData(data?.data || [])
      } catch {
        toast.error('There was an issue retrieving history data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const handleDotClick = (cardNumber) => {
    setCurrentIndex(cardNumber)
  }

  useEffect(() => {
    if (historyData.length === 0) return;
  
    const handleResize = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      }
    };
  
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [historyData]); 
  

  useEffect(() => {
    if (historyData.length === 0) return;
  
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === historyData.length - 1 ? 0 : prev + 1
      );
    }, 3000);
  
    return () => clearInterval(interval);
  }, [historyData, currentIndex]);
  

  if (loading) {
    return <Loading />
  }

  return (
    <section className="section-space bg-history">
      <div className="secondary-container">
        <div>
          <h2>Our History</h2>

          <div className="flex items-center overflow-hidden pt-32 laptop-l:pt-24 laptop-md:pt-20 laptop-m:pt-16  tab-s:pt-12 tab:pt-12 mb-l:pt-10">
            <div
              className="flex transition-transform duration-500 ease-in-out w-full overflow-y-auto:"
              style={{
                transform: `translateX(-${currentIndex * cardWidth}px)`,
              }}>
              {historyData?.map((data) => {
                const { year, description, image } = data

                return (
                  <div key={year} ref={cardRef} className="flex justify-center items-center min-w-full">
                    <div className="bg-[#F7F8FD] mx-12 my-8 laptop-s:mx-8 rounded-3xl py-20 px-28 flex items-center gap-40 relative laptop-l:py-16 laptop-l:px-20 laptop-l:gap-32 laptop-md:py-14 laptop-md:px-16 laptop-md:gap-24 laptop:p-12 laptop:gap-20 laptop:rounded-2xl laptop-s:p-10 laptop-s:rounded-xl tab-m:p-9 tab-m:gap-14 tab-m:basis-[86%] tab-s:gap-12 tab:basis-full tab:p-8 tab:rounded-lg tab:gap-8 mb-l:p-8 mb-l:py-10 mb-l:gap-6 mb-l:flex-wrap mb-l:justify-center carousel-shadow tab:m-6 mb-l:m-4">
                      <span className="year-psudo">{year}</span>
                      <img
                        src={image}
                        alt="Washing Machine"
                        className="rounded-3xl laptop-l:max-h-[32.5rem] laptop-md:max-h-[30rem] laptop:max-h-[25rem] laptop:rounded-2xl laptop-s:max-h-[22.5rem] laptop-s:rounded-xl tab-m:max-h-[17.5rem] tab:rounded-lg tab:max-w-60"
                      />
                      <div className="max-w-[62rem] laptop-l:max-w-[55rem] laptop-s:max-w-[50rem] tab-m:max-w-auto">
                        <p className="history-text">{description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-center items-center flex-wrap gap-16 pt-28 laptop-l:pt-20 laptop-md:pt-16 laptop:gap-12 tab-m:pt-12 tab-m:gap-10 tab-s:pt-10 tab:pt-8 tab:gap-6 mb:pt-4">
            {historyData?.map((data, index) => {
              const { year } = data
              return (
                <span
                  key={year}
                  className={`timeline-text ${currentIndex === index ? 'active-time' : ''}`}
                  role="button"
                  onClick={() => handleDotClick(index)}>
                  {year}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default History
