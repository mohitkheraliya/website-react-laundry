import './footer.css'
import { FaFacebookF } from 'react-icons/fa'
import { FiClock, FiPhoneCall } from 'react-icons/fi'
import { MdOutlineEmail } from 'react-icons/md'
import { RiInstagramFill, RiYoutubeFill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

const Footer = () => {
  const admin = import.meta.env.VITE_BASE_URL.replace("api", "admin") + "/dashboard";

  return (
    <footer className="footer">
      <div className="footer-space">
        <div className="secondary-container">
          <div className="flex justify-between tab-s:grid tab-s:grid-cols-2 tab-s:grid-rows-2 tab-s:gap-x-10 gap-y-20 tab:gap-x-8 tab:gap-y-16 mb-l:grid-cols-1 mb-l:gap-12 mb-l:justify-center mobile-footer">
            <div className="basis-[22%] flex flex-col justify-center items-start gap-12 laptop-l:basis-1/5 laptop-l:gap-10 laptop-m:gap-8 laptop-s:gap-6 tab-s:px-10 tab:px-0 mb-l:items-center">
              <img src="footer-logo.png" alt="Logo" className="footer-logo" loading="lazy" title="sikka cleaners" />
              <div className="flex items-center gap-10 laptop-l:gap-8 laptop-m:gap-6 laptop-s:gap-4 mb-l:gap-6">
                <a
                  href="https://www.facebook.com/sikkacleaners/"
                  target="__blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="Follow on facebook">
                  <FaFacebookF className="social-icon" />
                </a>
                <a
                  href="https://www.instagram.com/sikka_cleaners/"
                  target="__blank"
                  className="social-link"
                  title="Follow on instagram"
                  rel="noopener noreferrer">
                  <RiInstagramFill className="social-icon" />
                </a>
                <a
                  href="https://www.youtube.com/@sikkacleaners3220"
                  target="__blank"
                  className="social-link"
                  title="Subscribe on YouTube"
                  rel="noopener noreferrer">
                  <RiYoutubeFill className="social-icon" />
                </a>
              </div>
              <p className="text-[1.6rem] leading-[1.25] laptop-l:text-[1.4rem] laptop-m:text-[1.3rem] laptop-s:text-lg mb-l:text-xl">
                &copy; {new Date().getFullYear()} Sikka Cleaners All rights reserved.
              </p>
              <a
                href={admin}
                target="__blank"
                rel="noopener noreferrer"
                title="admin login"
                aria-label="admin login"
                className="border border-[var(--secondary)] rounded-full p-[1.2rem] text-[1.4rem] font-semibold leading-[1.4] laptop-l:p-4 laptop-l:font-medium laptop-m:text-[1.2rem] laptop-s:p-3 laptop:text-lg mb-l:px-4 mb-l:py-3 mb-l:text-xl">
                Admin Login
              </a>
            </div>

            <div className="tab-s:px-10 tab:px-0">
              <h4 className="sitemap-title">Explore</h4>
              <ul className="sitemap-list">
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li>
                  <Link to="/our-services">Our Services</Link>
                </li>
                <li>
                  <Link to="/prices">Prices</Link>
                </li>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
              </ul>
            </div>

            <div className="tab-s:px-10 tab:px-0">
              <h4 className="sitemap-title">Services</h4>
              <ul className="sitemap-list">
                <li>
                  <Link to="/our-services">Laundry Services</Link>
                </li>
                <li>
                  <Link to="/terms-condition">Terms & Condition</Link>
                </li>
                <li>
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
                <li className="hidden">
                  <Link to="/">Shipping Policy</Link>
                </li>
                <li>
                  <Link to="/refund-policy">Refund Policy</Link>
                </li>
              </ul>
            </div>

            <div className="basis-[30%] text-[1.8rem] leading-[2.2rem] laptop-l:basis-[30%] tab-m:basis-[35%] laptop-m:text-[1.6rem] laptop-m:leading-normal laptop-m:tracking-[1px] tab-s:px-10 tab:px-0">
              <h4 className="sitemap-title">contact</h4>
              <div className="contact flex flex-col gap-9 laptop-m:gap-6 mb-l:max-w-[22rem] mb-l:mx-auto mb-l:items-center">
                <div className="flex items-center gap-4 laptop-l:text-[1.6rem] laptop-m:text-[1.4rem] laptop-m:gap-3 laptop-s:text-[1.25rem] laptop-s:gap-2 tab-x:flex-col tab-x:items-start tab-x:gap-y-5 mb-l:text-[1.4rem]  mb-l:gap-6">
                  <div className="flex items-center gap-2 tab-x:gap-3">
                    <FiPhoneCall className="block h-[2.4rem] w-[2.4rem] laptop-l:h-[2rem] laptop-l:w-[2rem] laptop-m:h-[1.8rem] laptop-m:w-[1.8rem] laptop-s:h-6 laptop-s:w-6 mb-l:h-7 mb-l:w-7" />
                    <a href="tel:9879400838" className="border-b ml-3 border-white laptop-m:border-b-[0.5px] laptop-m:tracking-normal tab-x:ml-0">
                      +91 98256 00838
                    </a>
                  </div>
                  <div className="flex items-center gap-2 tab-x:gap-3">
                    <FiPhoneCall className="hidden tab-x:block h-[2.4rem] w-[2.4rem] laptop-l:h-[2rem] laptop-l:w-[2rem] laptop-m:h-[1.8rem] laptop-m:w-[1.8rem] laptop-s:h-6 laptop-s:w-6 mb-l:h-7 mb-l:w-7" />
                    <span className="block tab-x:hidden">|</span>
                    <a href="tel:9825600838" className="border-b ml-3 border-white laptop-m:border-b-[0.5px] laptop-m:tracking-normal tab-x:ml-0">
                      +91 97730 26100
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-start gap-4 laptop-l:text-[1.6rem] laptop-m:text-[1.4rem] laptop-m:tracking-normal laptop-m:gap-3 laptop-s:text-[1.25rem] mb-l:text-[1.4rem]">
                  <span className="block">
                    <MdOutlineEmail className="block h-[2.4rem] w-[2.4rem] laptop-l:h-[2.2rem] laptop-l:w-[2.2rem] laptop-m:h-8 laptop-m:w-8 laptop-s:h-6 laptop-s:w-6 mb-l:h-8 mb-l:w-8" />
                  </span>
                  <a href="mailto:sikkacleaners@gmail.com">sikkacleaners@gmail.com</a>
                </div>

                <div className="flex items-center gap-4 laptop-l:text-[1.6rem] laptop-m:text-[1.4rem] laptop-m:tracking-normal laptop-s:text-[1.25rem] mb-l:order-1 mb-l:text-[1.3rem] mb-l:gap-3">
                  <span className="block">
                    <FiClock className="block h-[2.4rem] w-[2.4rem] laptop-l:h-[2rem] laptop-l:w-[2rem] laptop-m:h-[1.8rem] laptop-m:w-[1.8rem] laptop-s:h-6 laptop-s:w-6 mb-l:h-8 mb-l:w-8" />
                  </span>
                  <p>
                    Mon to Sat: 10.00am - 8.30pm, <br className="hidden mb-l:block" />
                    Sun: 10.00am - 12.30pm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
