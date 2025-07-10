import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loading from '../loading/Loading'

const ServiceList = () => {
  const [corporateServices, setCorporateServices] = useState([])
  const [loading, setLoading] = useState(true)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchCorporateServices = async () => {
      setLoading(true)

      try {
        const response = await fetch(`${baseURL}/corporate-service`, {
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

        setCorporateServices(data?.data || [])
      } catch {
        toast.error('There was an issue retrieving corporate services data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCorporateServices()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <section className="section-space">
      <div className="full-width relative pb-[30rem] laptop-l:pb-[27rem] laptop-m:pb-[25rem] laptop-s:pb-[20rem] tab-m:pb-[22rem] tab-s:pb-0 tab:pb-0 tab:px-10 tab:space-y-0 mb-l:px-8 mb:px-6">
        <img src="/clothes-collection.png" alt="Clothes Collection Image" className="tab:rounded-t-lg" />
        <div className="sm-services px-20 py-24 laptop-l:px-24 laptop-l:py-28 laptop-m:px-16 laptop-m:py-20 laptop-s:px-12 laptop-s:py-16 tab-l:px-10 tab-l:py-14 tab-s:px-8 tab-s:py-12 tab:py-8 mb:p-6">
          <div className="floated-container">
            <h2 className="pb-16 laptop-l:pb-16 laptop-m:pb-12 laptop-s:pb-10 tab-m:pb-8 tab-s:pb-8 mb-l:pb-6">Corporate & Special Item Services</h2>
            <h3 className="mb-16">We also provide customized laundry and care services for businesses, events, and bulk orders:</h3>

            <div className="grid grid-cols-2 gap-y-10 gap-x-5 tab:grid-cols-1 tab:gap-y-8 px-0">
              {corporateServices?.map((service) => (
                <ul className="sr-list" key={service.corporate_service_id}>
                  <li>{service?.title}</li>
                </ul>
              ))}
            </div>

            <div className="mt-10 pt-12 px-30 text-center space-y-6 laptop-m:mt-16 laptop:mt-6 laptop-s:mt-6 tab-s:mt-1">
              <h3 className="font-semibold px-6">Experience the difference in quality and care.</h3>
              <p className="max-w-3xl mx-auto laptop:text-[1.2rem] text-gray-700 px-6">
                Whether it’s a single garment or a large corporate order, we’re here to make laundry day effortless for you.
              </p>
            </div>
            <div className="text-center mt-20 laptop-m:mt-10 tab-m:mt-8 tab:mt-6">
              {' '}
              <a href="/terms-condition" target="__blank" className="corporate-tc-link">
                Term & conditions for corporate laundry service
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceList
