import { useEffect, useState } from 'react'
import Loading from '../loading/Loading'

const Services = () => {
  const [laundryServices, setLaundryServices] = useState([])
  const [loading, setLoading] = useState(true)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchLaundryServices = async () => {
      setLoading(true)

      try {
        const response = await fetch(`${baseURL}/laundry-services`, {
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

        setLaundryServices(data?.data || [])
      } catch {
        toast.error('There was an issue retrieving laundry services data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLaundryServices()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <section className="py-[5rem] px-[10rem] laptop-md:px-[2rem] laptop-l:px-[4rem]">
      <div className="grid grid-cols-1 tab-x:grid-cols-1 laptop:grid-cols-3 tab-m:grid-cols-2 lg:grid-cols-4 gap-10 px-4 md:px-10">
        {laundryServices?.map((service) => (
          <div key={service.laundry_service_id} className="service shadow rounded-3xl laptop:rounded-2xl tab-l:rounded-xl">
            <div className="mb-6 h-[100px] w-[100px]">
              <img src={service.image} alt={service.title} className="w-full h-full object-contain" />
            </div>

            <h3 className="mb-5">{service.title}</h3>
            <div className="content text-center">
              {service.description} &nbsp;
              <br />
              {service.note !== '' && (
                <span className="text-[1.7rem] text-blue-600 font-bold laptop-m:text-[1.5rem] laptop:text-[1.3rem] mb-x:text-[1.2rem]">
                  ({service.note})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Services
