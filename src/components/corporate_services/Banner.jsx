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
        const response = await fetch(`${baseURL}/our-service`, {
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
        <div className="flex items-start justify-start relative tab-s:items-stretch tab:flex-col tab:gap-12 mb-l:gap-8 star-psudo">
          <div className="basis-[50%] tab:flex tab:justify-between tab:items-center">
          <h2 className="banner-title mb-20 laptop-l:mb-16 laptop-md:mb-12 laptop-s:mb-8 tab-s:mb-12 tab:mb-0 tab:flex-wrap">
            {bannerData?.title?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Laundry Services'}
          </h2>
            <Link to="/contact" className="primary-button" aria-label="contact us" title="contact us">
              Contact Us
            </Link>
          </div>
          <div className="basis-[45%] space-y-16 laptop-md:space-y-12 laptop-m:space-y-10 laptop-m:basis-[50%] laptop-s:space-y-8 tab-m:space-y-6">
            <p className="para2">
            {bannerData?.description}
            </p>
            {bannerData?.note && (
            <div role="note" aria-label="Note" className="para2 mt-4 text-[1.6rem] text-gray-700 dark:text-gray-300 italic">
              <strong className="not-italic font-semibold text-red-500">Note:</strong>
              &nbsp;{bannerData.note}
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
