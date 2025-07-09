import { useEffect, useState } from 'react'
// import data from '../../utils/home/chooseus.json'
import Loading from '../loading/Loading'
import toast from 'react-hot-toast'

const ChooseUs = () => {
  const [whyChooseUsContent, setWhyChooseUsContent] = useState([])
  const [loading, setLoading] = useState(false)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchWhyChooseUsContent = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${baseURL}/why-choose-us`, {
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
        setWhyChooseUsContent(data?.data || [])
      } catch {
        toast.error( 'There was an issue retrieving why choose us data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWhyChooseUsContent()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <>
      {whyChooseUsContent?.length > 0 && (
        <section className="space-xl choose-us-container text-white">
          <div className="secondary-container">
            <p className="section-title">WHY CHOOSE US</p>
            <h2 className="text-white mb-20 laptop-l:mb-16 laptop:mb-12 laptop-s:mb-10 tab-l:mb-8">Sikka Cleaners is best in Town</h2>

            <div className="grid grid-cols-3 justify-between gap-20 laptop-l:gap-16 laptop-md:gap-14 tab-l:gap-10 tab-s:grid-cols-2 tab-s:gap-8 mb-l:grid-cols-1">
              {whyChooseUsContent?.map((data, index) => {
                return (
                  <div className="card" key={index}>
                    <h3 className="card-title text-white">{data?.title}</h3>
                    <p className="card-description">{data?.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default ChooseUs
