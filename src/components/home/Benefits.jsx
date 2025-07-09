import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Loading from '../loading/Loading'

const Benefits = () => {
  const [benefitsContent, setBenefitsContent] = useState([])

  const [loading, setLoading] = useState(true)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchBenefitsContent = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${baseURL}/benefits`, {
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

        setBenefitsContent(data?.data || [])
      } catch {
        toast.error('There was an issue retrieving services data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBenefitsContent()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <section className="space-xl benefits-container">
      <div className="secondary-container">
        <div className="flex justify-around items-center gap-24 tab-l:gap-12 tab:flex-col mb:items-stretch">
          <img src="/laundry-benefits.png" alt="Laundry-benefits" className="laundry-benefits-img" />
          <div className="px-20 laptop-l:px-14 laptop-md:px-12 laptop:px-10 tab-l:px-12 tab-s:px-0 mb:px-4">
            <p className="section-title">Why Should You Believe Us?</p>
            <h2>Our Laundry Benefits</h2>
            <Link to="/contact" className="btn my-20 laptop-l:my-16 laptop-md:my-12 laptop-s:my-12 tab-l:my-8">
              Contact Us
            </Link>
            <div className="grid grid-cols-2 gap-x-44 gap-y-36 justify-center laptop-l:gap-x-36 laptop-l:gap-y-28 laptop-m:gap-y-28 laptop-m:gap-x-20 laptop:gap-y-24 laptop:gap-x-[5.5rem] laptop-s:gap-20 tab-l:gap-16 mb-l:gap-12 mb:justify-between">
              {benefitsContent?.map((benefit, index) => (
                <figure key={benefit.benefit_id || index}>
                  <img src={benefit.image} alt={benefit.title} />
                  <figcaption className="caption">{benefit.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Benefits
