const Details = ({ image, description3, description4 }) => {
  return (
    <section className="section-space">
      <div className="secondary-container">
        <div className="flex items-center gap-16 laptop-l:gap-12 laptop-s:gap-8 tab-s:flex-col mb-l:gap-6 mb:gap-4">
          <div className="basis-[calc(50%-2rem)] laptop-l:basis-[calc(50%-1.5rem)] laptop-s:basis-[calc(50%-1rem)]">
            <img src={image} alt="Clothes" className="about-image" />
          </div>
          <div className="basis-[calc(50%-2rem)] flex justify-center flex-col items-center gap-8 laptop-l:basis-[calc(50%-1.5rem)] laptop-l:gap-6 laptop-s:basis-[calc(50%-1rem)] laptop-s:gap-4">
            <p className="para2">{description3}</p>
            <p className="para2">{description4}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Details
