import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../loading/Loading'

const Banner = () => {
  const [bannerData, setbBannerData] = useState()
  const [loading, setLoading] = useState(true)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchBannerData = async () => {
      setLoading(true)

      try {
        const response = await fetch(`${baseURL}/our-price`, {
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
        setbBannerData(data?.data || null)
      } catch {
        toast.error('There was an issue retrieving banner data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBannerData()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <section className="section-space">
      <div className="secondary-container">
        <div className="flex items-center justify-start relative tab:flex-col tab:gap-10 mb-l:gap-8 tab:items-stretch star-psudo">
          <div className="basis-1/2 flex flex-col items-start gap-20 laptop-l:gap-16 laptop-md:gap-10 laptop:gap-8 tab:flex-row tab:justify-between">
            <h2 className="banner-title">
              {bannerData?.title?.split(' ')[0] || 'Our'}
              <br className="tab:hidden" />
              <span className="tab:pl-4">{bannerData?.title?.split(' ')[1] || 'Prices'}</span>
            </h2>
            <Link to="/contact" className="primary-button">
              Contact Us
            </Link>
          </div>
          <div className="basis-[45%] laptop-m:basis-1/2">
            <p className="para2">
              {bannerData?.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
