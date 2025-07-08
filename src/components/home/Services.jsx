import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../loading/Loading'

const Services = () => {
  const [serviceContent, setServiceContent] = useState([])
  const [loading, setLoading] = useState(false)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchServicesContent = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${baseURL}/services-list`, {
          method: 'GET',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          toast.error(errorData?.message, { position: 'top-center' })
          setLoading(false)
          return
        }

        const data = await response.json()
        setServiceContent(data?.data || [])
      } catch (error) {
        toast.error(error || 'There was an issue retrieving services data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchServicesContent()
  }, [])

  console.log('servicesContent', serviceContent)

  // if (loading) {
  //   return <Loading />
  // }

  return (
    <section className="space-xl">
      <div className="secondary-container">
        <div className="flex justify-between items-start mb-16 laptop-m:mb-14 laptop:mb-12 laptop-s:mb-10 tab-l:mb-9 tab-s:mb-8 mb-l:flex-wrap mb-l:gap-6">
          <div className="tab:self-stretch">
            <p className="section-title">Our Services List</p>
            <h2>Services We’re Offering</h2>
          </div>
          <Link to="/order-now" className="btn" role="button" title="Explore More">
            Explore More
          </Link>
        </div>

        <div className="flex flex-wrap gap-y-10 gap-x-10 tab-s:flex-col tab-m:gap-10">
          {serviceContent?.map((service, index) => (
            <div
              key={service.service_list_id || index}
              className="shadow basis-[31%] rounded-3xl py-24 px-20 bg-[#F7F8FD] laptop-l:py-20 laptop-l:px-16 laptop-m:py-16 laptop-m:px-12 laptop:py-14 laptop:px-10 laptop:rounded-2xl laptop-s:py-12 laptop-s:px-8 tab-l:px-6 tab-l:py-10 tab-l:rounded-xl tab-s:p-8 mb:p-6">
              <div className="flex flex-col items-center gap-16 laptop-l:gap-14 laptop-md:gap-12 laptop-m:gap-10 laptop:gap-10 tab-l:gap-8 tab-s:gap-6">
                <div className="h-40 laptop-l:h-32 laptop-m:h-28 laptop:h-24 laptop-s:h-20 tab-s:h-24 tab:h-20 mb-l:h-16">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="inline-block laptop-m:max-h-full laptop:h-28 laptop:w-auto tab-m:h-20 object-contain"
                  />
                </div>
                <div className="flex flex-col items-center gap-6 laptop-m:gap-4 laptop-s:gap-3 tab-m:gap-2">
                  <h3>{service.title}</h3>
                  <p className="content text-center">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
