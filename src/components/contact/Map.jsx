import { useEffect, useState } from 'react'
import { FiPhoneCall } from 'react-icons/fi'
import { SlLocationPin } from 'react-icons/sl'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import Loading from '../loading/Loading'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const Map = () => {
  const [branchData, setBranchData] = useState([])
  const [loading, setLoading] = useState(true)
  const baseURL = import.meta.env.VITE_BASE_URL

  const [activeBranch, setActiveBranch] = useState(null)
  const [zoom, setZoom] = useState(13)

  const [points, setPoints] = useState([{ branch_id: null, lat: null, lng: null }])

  useEffect(() => {
    const fetchBranchData = async () => {
      setLoading(true)

      try {
        const response = await fetch(`${baseURL}/laundry-branches`, {
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

        setBranchData(data?.data || [])
      } catch {
        toast.error('There was an issue retrieving map data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBranchData()
  }, [])

  useEffect(() => {
    if (branchData) {
      const extractedPoints = branchData.map((branch) => ({
        branch_id: branch.laundry_branch_id,
        lat: parseFloat(branch.lat),
        lng: parseFloat(branch.long),
      }))

      setPoints(extractedPoints)

      const firstBranch = extractedPoints[0]
      setActiveBranch({ lat: firstBranch?.lat, lng: firstBranch?.lng })
    }
  }, [branchData])

  const handleBranchClick = (branchId) => {
    const match = points.find((point) => point.branch_id === branchId)

    return match ? setActiveBranch({ lat: match.lat, lng: match.lng }) : null
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GMAP_API_KEY,
  })


  if (loading) {
    return <Loading />
  }

  return (
    <section className="section-padding">
      <div className="content-container">
        <div className="flex items-start justify-between gap-20 laptop-l:gap-28 laptop-m:gap-24 laptop:gap-20 tab-l:gap-16 tab-s:flex-wrap tab-s:justify-center tab:gap-12 mb-l:gap-8 mb:gap-6">
          <div className="map-wrapper">
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={activeBranch}
                zoom={zoom}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  zoomControl: false,
                  disableDefaultUI: true,
                  clickableIcons: false,
                }}>
                {points.map((point, index) => (
                  <MarkerF key={index} position={point} />
                ))}
              </GoogleMap>
            )}
          </div>

          <div className="basis-[31%] laptop-l:basis-[37.5%] laptop:basis-[40%] laptop-s:basis-[32.5%] tab-l:basis-[30%] tab-s:basis-[54rem]">
            <div className="flex flex-col gap-12 laptop-l:gap-20 laptop-s:gap-16 tab-s:gap-14 tab:gap-12 mb-l:gap-8 mb:gap-6">
              {branchData?.map((data, index) => {
                const { name, address, phone_number1, phone_number2, laundry_branch_id } = data

                return (
                  <div className="flex flex-col gap-12 laptop-l:gap-8 laptop-m:gap-6 laptop-s:gap-4 mb:gap-3">
                    <div className="flex items-center justify-start gap-8 laptop-l:gap-6 laptop-m:gap-4 laptop-s:gap-3">
                      <SlLocationPin className="h-12 w-12 fill-[var(--secondary)] laptop-l:h-10 laptop-l:w-10 laptop-m:h-8 laptop-m:w-8 laptop-s:h-[1.75rem] laptop-s:w-[1.75rem]" />
                      <h4
                        className="text-[2.6rem] leading-[1] font-bold cursor-pointer laptop-l:text-4xl laptop-m:text-3xl laptop-s:text-2xl"
                        role="button"
                        onClick={() => {
                          handleBranchClick(laundry_branch_id)
                          setZoom(16)
                        }}>
                        {name}
                      </h4>
                    </div>
                    <p className="text-[1.8rem] leading-[1.68] font-medium laptop-l:text-[1.6rem] laptop-m:text-[1.4rem] laptop-s:text-[1.2rem]">
                      {address}
                    </p>
                    <div className="flex items-center gap-4 text-[1.8rem] font-medium laptop-l:text-[1.6rem] laptop-m:text-[1.4rem] laptop-m:gap-3 laptop:flex-wrap laptop-s:text-[1.2rem]">
                      {phone_number1 && (<FiPhoneCall className="h-[2.4rem] w-[2.4rem] stroke-[var(--black)] laptop-l:h-[2.2rem] laptop-l:w-[2.2rem] laptop-m:h-[1.75rem] laptop-m:w-[1.75rem] laptop-s:h-6 laptop-s:w-6" />)}
                      <a href={`tel:${phone_number1}`} aria-label={`Call ${phone_number1}`} className="underline">
                        {phone_number1}
                      </a>
                      {phone_number2 && <span>|</span>}
                      <a href={`tel:${phone_number2}`} aria-label={`Call ${phone_number2}`} className="underline">
                        {phone_number2}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Map
