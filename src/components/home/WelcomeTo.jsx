import { useEffect, useState } from "react"
import Loading from "../loading/Loading"


const WelcomeTo = () => {
  const [welcomeData, setWelcomeData] = useState([])
  const [loading, setLoading] = useState(false)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchWelcomeData = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${baseURL}/welcome`, {
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
        setWelcomeData(data?.data || [])
      } catch {
        toast.error('There was an issue retrieving welcome data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false);
      }
    }

    fetchWelcomeData()
  }, [])

  if (loading) {
    return <Loading />
  }

  const { title, description1, description2, image } = welcomeData

  return (
    <section className="space-xl">
      <div className="secondary-container">
        <h2 className="mb-16 laptop-m:mb-14 laptop-s:mb-10 tab-l:mb-8">{title}</h2>

        <div className="flex flex-wrap items-center justify-between tab-s:flex-col tab-s:gap-8">
          <div className="self-stretch basis-[47.5%] laptop-l:basis-[48%] tab-m:basis-[40%] tab-s:text-center">
            <img src={image} alt="Shirt Collection Image" className="inline-block h-full w-auto tab-s:max-w-[41rem] tab:w-full" />
          </div>
          <div className="text-[2rem] font-normal basis-[47.5%] laptop-l:basis-[48%] tab-m:basis-[57%] text-[var(--grey)] leading-[3.2rem] laptop-l:text-[1.8rem] laptop-l:leading-[2.8rem] laptop-md:text-[1.6rem] laptop-md:leading-[2.4rem] laptop:text-[1.4rem] laptop-s:text-[1.4rem] laptop-s:leading-[2.2rem] tab-m:leading-normal tab-s:leading-[2.2rem] mb:text-[1.2rem]">
            <p className="pb-10 laptop-l:pb-8 laptop-s:pb-6 tab-m:pb-4">
              {description1}
            </p>
            <p>
              {description2}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeTo
