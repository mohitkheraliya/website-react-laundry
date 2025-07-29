const Video = ({ youtube_link }) => {
  const getEmbedUrl = (url) => {
    if (!url) return ''
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  const embedUrl = getEmbedUrl(youtube_link)

  return (
    <section className="section-space">
      <div className="secondary-container">
        <div className="video-container">
          <iframe
            width="100%"
            height="100%"
            className="rounded-3xl laptop-m:rounded-2xl laptop-s:rounded-xl tab-m:rounded-lg mb-l:rounded"
            src={embedUrl}
            title="Customer review on sikka cleaners"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"></iframe>
        </div>
      </div>
    </section>
  )
}

export default Video
