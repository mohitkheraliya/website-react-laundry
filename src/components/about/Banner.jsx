import { Link } from 'react-router-dom'

const Banner = ({ description1, description2 }) => {
  return (
    <section className="section-space">
      <div className="secondary-container">
        <div className="flex items-start justify-start relative decorateive-star tab-s:gap-8 tab-s:flex-col tab-s:items-stretch tab:gap-6">
          <div className="basis-1/2 tab-s:basis-full tab-s:flex tab-s:justify-between tab-s:items-start mb-l:gap-4 mb-l:flex-wrap">
            <h2 className="banner-title mb-20 laptop-l:mb-16 laptop-s:mb-12 tab-l:mb-10 tab-m:mb-8 tab-s:mb-0 mb-l:shrink">
              Free Pick and Drop
              <br className="tab-s:hidden" />
              <span className="hidden tab-s:inline-block px-2 tab:px-1"></span>
              Facility
            </h2>
            <Link to="/contact" className="primary-button">
              Contact Us
            </Link>
          </div>
          <div className="basis-1/2 space-y-10 laptop-l:space-y-8 laptop-m:space-y-6 laptop-s:space-y-4">
            <p className="para2">{description1}</p>
            <p className="para2">{description2}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
