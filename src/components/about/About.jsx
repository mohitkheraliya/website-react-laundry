import Banner from './Banner'
import StatsDisplay from './StatsDisplay'
import Details from './Details'
import Video from './Video'
import History from './History'
import './about.css'
import { useEffect, useState } from 'react'
import Loading from '../loading/Loading'

const About = () => {
  const [aboutContect, setAboutContent] = useState([])
  const [loading, setLoading] = useState(false)
  const baseURL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchAboutContent = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${baseURL}/about-us`, {
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
        setAboutContent(data?.data || [])
      } catch {
        toast.error('There was an issue retrieving about data. Please check your connection.', {
          className: 'toast-error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAboutContent()
  }, [])

  const { description1, description2, description3, description4, youtube_link, image } = aboutContect;

  if (loading) {
    return <Loading />
  }
  
  return (
    <div>
      <Banner description1={description1} description2={description2}/>
      <StatsDisplay />
      <Details description3={description3} description4={description4} image={image}/>
      <Video youtube_link={youtube_link}/>
      <History />
    </div>
  )
}

export default About
