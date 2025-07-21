import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import usePlaceOrder from '../../hooks/order/usePlaceOrder'
import { useNavigate } from 'react-router-dom'
import useApplyCoupon from '../../hooks/coupon/useApplyCoupon'
import { RxCross2 } from 'react-icons/rx'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { clearCart } from '../../redux/slices/cartSlice'
import { useDispatch } from 'react-redux'
import { IoIosArrowDown, IoIosRemoveCircle } from 'react-icons/io'
import { RiDiscountPercentFill } from 'react-icons/ri'
import useGetAllCoupon from '../../hooks/coupon/useGetAllCoupon'
import { Backdrop, CircularProgress, IconButton } from '@mui/material'
import useGetTransactionId from '../../hooks/payement/useGetTransactionId'
import useVerifyPayement from '../../hooks/payement/useVerifyPayement'
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  gstNumber: Yup.string()
    .nullable()
    .notRequired()
    .test('is-valid-gst', 'GST Number must be 15 characters', function (value) {
      if (!value) return true
      return value.length === 15
    })
    .test('valid-gst-format', 'Invalid GST Number format', function (value) {
      if (!value) return true
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)
    }),
})

const OrderSummary = ({ instruction, paymentMethod, selectedAddId, selectedBranchId, setNoSelection }) => {
  const delivery_time = useSelector((state) => state.setting.settings)
  const { estimate_delivery_normal_day } = delivery_time

  const dispatch = useDispatch()
  const { getAllCoupon, loading: loadingAllCoupons, coupons } = useGetAllCoupon()
  const [viewCoupon, setViewCoupon] = useState(false)
  const subTotal = useSelector((state) => state.cart.subTotal)
  const items = useSelector((state) => state.cart.cartItems)
  const shippingCharge = parseInt(useSelector((state) => state?.setting?.settings?.normal_delivery_charges))

  const express_delivery_24hrs = parseInt(useSelector((state) => state.setting.settings.express_delivery_24hrs))
  const express_delivery_48hrs = parseInt(useSelector((state) => state.setting.settings.express_delivery_48hrs))
  const express_delivery_72hrs = parseInt(useSelector((state) => state.setting.settings.express_delivery_72hrs))

  const expressCharges = {
    24: express_delivery_24hrs,
    48: express_delivery_48hrs,
    72: express_delivery_72hrs,
  }

  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [discountValue, setDiscountValue] = useState(0)
  const [isCouponApplied, setIsCouponApplied] = useState({
    code: '',
    status: false,
  })
  const [isExpDel, setExpDel] = useState(false)
  const { applyCoupon, loading: loadingApplyCoupon } = useApplyCoupon()
  const { placeOrder, loading: placingOrder } = usePlaceOrder()
  const { getTransactionId, loading: loadingTransactionId } = useGetTransactionId()
  const { verifyPayement, loading: verifyingPayement } = useVerifyPayement()
  const user = useSelector((state) => state?.user?.user)
  const [open, setOpen] = useState(false)

  const [expHour, setExpHour] = useState(24)
  const [expressCharge, setExpressCharge] = useState(null)

  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [error, setError] = useState('')

  const [isGstIn, setIsGstIn] = useState(false)

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const calculateExpressCharge = () => {
    const calculatedSubTotal = discountValue ? subTotal - discountValue : subTotal
    const expHourPercentage = expressCharges[expHour]
    return Math.round((calculatedSubTotal * expHourPercentage) / 100)
  }

  useEffect(() => {
    setExpressCharge(calculateExpressCharge)
  }, [expHour, subTotal, discountValue])

  const handleApplyClick = async (e) => {
    e.preventDefault()

    if (!couponCode) {
      toast.error('Coupon code should  not empty!', {
        className: 'toast-error',
      })
      return
    }

    const result = await applyCoupon(subTotal, couponCode.toUpperCase())
    if (result) {
      setDiscountValue(result?.discountAmount)
      setIsCouponApplied({
        code: couponCode.toUpperCase(),
        status: true,
      })
    }
  }

  const handleCheckout = async () => {
    try {
      await validationSchema.validate({ gstNumber })
      setError('')
    } catch (err) {
      setError(err.message)
      return
    }

    let newSubTotal = subTotal - discountValue
    let expresssCharge = isExpDel ? expressCharge : 0
    let normal_delivery_charges = isExpDel ? 0 : shippingCharge
    let express_delivery_hour = isExpDel ? expHour : undefined
    let gst_company_name = companyName ? companyName : ''
    let gstin = gstNumber ? gstNumber : ''

    if (paymentMethod === 1) {
      const orderData = {
        items: items,
        sub_total: newSubTotal,
        description: instruction,
        normal_delivery_charges,
        payment_type: paymentMethod,
        address_id: selectedAddId,
        express_delivery_charges: expresssCharge,
        express_delivery_hour: express_delivery_hour,
        transaction_id: '',
        paid_amount: 0,
        branch_id: selectedBranchId,
        coupon_code: isCouponApplied.code,
        gst_company_name,
        gstin,
      }
      const result = await placeOrder(orderData)
      if (result) {
        dispatch(clearCart())
        navigate('/order', { state: { result, paymentMethod } })
      }
    }

    if (paymentMethod === 2) {
      let finalTotal = calculateTotal()

      const razorpay_order_id = await getTransactionId(finalTotal)

      if (!razorpay_order_id) {
        return
      } else {
        const { first_name, last_name, mobile_number } = user
        try {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY,
            amount: finalTotal * 100,
            currency: 'INR',
            name: 'sikka cleaners',
            description: 'Order Payment',
            order_id: razorpay_order_id,
            handler: async function (response) {
              const res = await verifyPayement(response)
              if (!res.status) {
                return
              }

              const orderData = {
                items: items,
                sub_total: newSubTotal,
                description: instruction,
                normal_delivery_charges,
                payment_type: paymentMethod,
                address_id: selectedAddId,
                express_delivery_charges: expresssCharge,
                express_delivery_hour: express_delivery_hour,
                transaction_id: razorpay_order_id,
                paid_amount: finalTotal,
                branch_id: selectedBranchId,
                coupon_code: isCouponApplied.code,
                gst_company_name,
                gstin,
              }

              const result = await placeOrder(orderData)
              if (result) {
                dispatch(clearCart())
                navigate('/order', { state: { result, paymentMethod } })
              }
            },
            prefill: {
              name: first_name + ' ' + last_name,
              email: 'user@gmail.com',
              contact: mobile_number,
            },
            theme: {
              color: '#161F5F',
            },
          }

          const razorpay = new window.Razorpay(options)

          razorpay.open()
        } catch {
          toast.error('Failed to initiate online payement please try again letter!', {
            className: 'toast-error',
          })
        }
      }
    }
  }

  const handleRemoveCoupon = () => {
    setIsCouponApplied({
      code: '',
      status: false,
    })
    setCouponCode('')
    setDiscountValue(0)
  }

  const handleViewMoreClick = async () => {
    setViewCoupon(!viewCoupon)

    if (!viewCoupon) {
      await getAllCoupon()
    }
  }

  const applyBtnClick = async (code) => {
    const result = await applyCoupon(subTotal, code.toUpperCase())
    if (result) {
      setDiscountValue(result?.discountAmount)
      setIsCouponApplied({
        code: code.toUpperCase(),
        status: true,
      })
      setCouponCode(code.toUpperCase())
      setViewCoupon(false)
    }
  }

  useEffect(() => {
    if (loadingTransactionId || verifyingPayement || placingOrder || loadingApplyCoupon) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [loadingTransactionId, verifyingPayement, placingOrder, loadingApplyCoupon])

  const calculateTotal = () => {
    const baseTotal = Number(subTotal) - Number(discountValue)
    const deliveryCharge = isExpDel ? Number(expressCharge || 0) : Number(shippingCharge)
    return baseTotal + deliveryCharge
  }

  const handleShowPopup = () => {
    if (!selectedBranchId) setNoSelection(true)

    if (!paymentMethod && !selectedAddId && !selectedBranchId) {
      toast.error('Please select Shipping Address, Branch and Payment Method ', {
        className: 'toast-error',
      })
      return
    }

    if (!selectedAddId) {
      toast.error('Please select Shipping Address', {
        className: 'toast-error',
      })
      return
    }

    if (!selectedBranchId) {
      toast.error('Please select branch name', {
        className: 'toast-error',
      })
      return
    }

    if (!paymentMethod) {
      toast.error('Please select Payment Method', {
        className: 'toast-error',
      })
      return
    }

    if (paymentMethod && selectedAddId && selectedBranchId) {
      setShowConfirmModal(true)
    }
  }

  return (
    <>
      {viewCoupon ? (
        <div className="all-coupon-container space-y-10 laptop-l:space-y-8 laptop:space-y-6">
          <div className="flex justify-between items-center">
            <h3>Coupons</h3>
            <span
              className="cursor-pointer inline-block h-10 w-10 laptop-l:h-8 laptop-l:w-8 laptop-md:h-7 laptop-md:w-7 tab-m:h-8 tab-m:w-8"
              onClick={() => setViewCoupon(!viewCoupon)}>
              <RxCross2 className="h-full w-full text-[var(--primary)]" />
            </span>
          </div>
          {loadingAllCoupons ? (
            <div className="flex justify-center items-center">
              <span className="inline-block h-16 w-16 rounded-full border-[5px] border-gray-300 border-r-indigo-500 animate-spin laptop-md:h-14 laptop-md:w-14"></span>
            </div>
          ) : (
            <table className="coupon-table w-full table-auto">
              <tbody>
                {coupons.length !== 0 ? (
                  coupons.map((coupon) => {
                    const { coupon_id, code, discount_type, discount_value, min_cart_value } = coupon
                    return (
                      <tr key={coupon_id} className="border-b border-gray-200 last:border-b-0">
                        <td className="py-3 px-2 align-top w-[70px]">
                          <RiDiscountPercentFill className="h-20 w-20 fill-[var(--secondary)] laptop-md:h-12 laptop-md:w-12 tab-m:h-12 tab-m:w-12" />
                        </td>

                        <td className="py-3 px-2 align-top w-full max-w-[300px]">
                          <div className="flex flex-col">
                            <p className="text-[1.8rem] text-[var(--black)] font-medium uppercase break-words laptop-l:text-[1.6rem] laptop-md:text-[1.4rem] laptop:text-[1.3rem] tab-m:text-[1.4rem]">
                              {code}
                            </p>
                            <p className="text-[1.4rem] text-gray-600 mt-1 break-words leading-snug laptop-l:text-[1.3rem] laptop-md:text-[1.2rem] laptop:text-[1.1rem] tab-m:text-[1.2rem]">
                              Min Cart Value: {min_cart_value}
                            </p>
                          </div>
                        </td>

                        <td className="py-3 px-2 align-top whitespace-nowrap">
                          <p className="text-[1.8rem] text-[var(--black)] uppercase laptop-l:text-[1.6rem] laptop-md:text-[1.4rem] laptop:text-[1.3rem] tab-m:text-[1.4rem]">
                            {discount_type === 1 ? `₹${discount_value} OFF` : `${discount_value}% OFF`}
                          </p>
                        </td>

                        <td className="py-3 px-2 align-top">
                          <button className="new-apply-btn whitespace-nowrap" onClick={() => applyBtnClick(code)}>
                            apply
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-3xl font-medium text-[var(--black)] laptop-l:text-2xl laptop-md:text-xl">
                      No coupon code found!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <h4 className="cart-title cart-cart-title">Order Summary</h4>
          <div className="p-10 border-b border-[#b9bccf4d] flex flex-col gap-8 laptop-l:gap-6 laptop-l:p-8 laptop-md:px-6 laptop:p-6 laptop:gap-4 tab-l:px-4 tab-m:p-6 mb-l:px-8 mb:p-4">
            <form onSubmit={handleApplyClick} className="flex items-center gap-8 laptop-l:gap-6 laptop:gap-4">
              <div className="grow relative">
                <input
                  type="text"
                  placeholder="Add Coupon Code"
                  aria-label="Add Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full uppercase border border-[#EFF3FF] rounded-xl text-[1.8rem] leading-10 py-5 px-4 focus:border-indigo-500 focus:outline-none placeholder:capitalize laptop-l:text-[1.6rem] laptop-l:leading-[1.5] laptop-l:py-4 laptop-l:px-3 laptop-l:rounded-lg laptop-md:text-[1.4rem] laptop-md:p-3 laptop:text-[1.3rem] laptop:rounded-md"></input>
                {isCouponApplied.status && (
                  <span className="clear-btn" role="button" aria-label="remove coupon code" onClick={handleRemoveCoupon}>
                    <RxCross2 className="h-full w-full p-1 text-[var(--primary)]" />
                  </span>
                )}
              </div>
              <button
                type="submit"
                className={`apply-btn ${isCouponApplied.status ? 'disabled-apply-btn' : ''}`}
                disabled={isCouponApplied.status || loadingApplyCoupon}>
                Apply
              </button>
            </form>
            <div>
              <button className="flex items-center gap-8 laptop-l:gap-6 laptop-md:gap-4 laptop:gap-3" onClick={handleViewMoreClick}>
                <p className="text-[1.8rem] text-[var(--primary)] font-medium laptop-l:text-[1.6rem] laptop-md:text-[1.4rem] laptop:text-[1.3rem] tab-m:text-[1.4rem]">
                  View More Offers
                </p>
                <span className="inline-block h-10 w-10 laptop-l:h-8 laptop-l:w-8 laptop-md:h-7 laptop-md:w-7 laptop:h-6 laptop:w-6 tab-m:h-8 tab-m:w-8">
                  <IoIosArrowDown className="h-full w-full fill-[var(--primary)]" />
                </span>
              </button>
            </div>
          </div>
          <div className="px-12 py-12 flex flex-col gap-12 laptop-l:gap-10 laptop-l:p-10 laptop-md:px-6 laptop-md:py-8 laptop-md:gap-8 laptop:p-6 tab-l:px-4 tab-l:gap-7 cart-summary tab-m:p-6 tab-m:gap-8 mb-l:px-8 mb:p-4">
            <div className="place-center">
              <p>Sub Total</p>
              <h5>₹{subTotal}</h5>
            </div>
            {isCouponApplied?.status && (
              <div className="place-center">
                <p>
                  Applied Coupon
                  {isCouponApplied.status && <span className="applied-coupon">{`( ${isCouponApplied?.code} )`}</span>}
                </p>
                <h5>₹{discountValue}</h5>
              </div>
            )}

            <div className="place-center">
              <p>Shipping Charge</p>
              <h5>₹{isExpDel ? '0' : shippingCharge}</h5>
            </div>

            <div>
              <div className="place-center relative">
                <div className="flex justify-center items-center gap-3">
                  <p>Express Delivery Charge</p>
                  {isExpDel && (
                    <div className="relative group my-[-6px]">
                      <IconButton onClick={() => setExpDel(false)}>
                        <IoIosRemoveCircle className="h-9 w-9 fill-[var(--secondary)] laptop-md:h-7 laptop-md:w-7 laptop:h-6 laptop:w-6" />
                      </IconButton>

                      <div
                        role="tooltip"
                        className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[var(--secondary)] text-white rounded-md shadow-sm px-3 py-2 text-lg text-nowrap -top-12 left-1/2 -translate-x-1/2 laptop-md:text-base laptop-md:-top-10 laptop-md:rounded-sm">
                        remove
                        <div className="tooltip-arrow" data-popper-arrow></div>
                      </div>
                    </div>
                  )}
                </div>
                {isExpDel ? (
                  <h5>₹{calculateExpressCharge() || 0}</h5>
                ) : (
                  <button className="edc-btn" onClick={() => setExpDel(true)}>
                    add
                  </button>
                )}
              </div>

              {isExpDel && (
                <div className="mt-4 laptop-l:text-[1.4rem] laptop-md:text-[1.3rem] tab-l:text-[1.2rem]">
                  <div className="flex gap-x-8 items-center">
                    <input type="radio" name="exp_hour" className="radio" value={24} checked={expHour === 24} onChange={() => setExpHour(24)} />{' '}
                    <p>24 hour</p>
                    <input type="radio" name="exp_hour" className="radio" value={48} checked={expHour === 48} onChange={() => setExpHour(48)} />
                    <p>48 hour</p>
                    <input type="radio" name="exp_hour" className="radio" value={72} checked={expHour === 72} onChange={() => setExpHour(72)} />
                    <p>72 hour</p>
                  </div>
                </div>
              )}

              {!isExpDel && (
                <div className="mt-2 text-secondary laptop-l:text-[1.4rem] laptop-md:text-[1.3rem] tab-l:text-[1.2rem]">
                  <i>Get your Delivery within 1-3 Days</i>
                </div>
              )}
            </div>

            <div className="custom-checkbox">
              <input
                id="gstin_checkbox"
                type="checkbox"
                value={isGstIn}
                onChange={() => setIsGstIn(!isGstIn)}
                checked={isGstIn}
                className="mr-5 w-8 h-8 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-0 laptop-s:h-7 laptop-s:w-7"
              />
              <p>
                <label htmlFor="gstin_checkbox">Have a GSTIN ?</label>
              </p>
            </div>

            {isGstIn && (
              <div className="px-0 pb-0 flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-6 laptop-l:gap-5 laptop-md:gap-4 laptop:grid-cols-2 tab-m:grid-cols-1">
                  <div>
                    <p>
                      <label htmlFor="gst_company_name">Company Name</label>
                    </p>
                    <input
                      id="gst_company_name"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className="w-full border border-[#EFF3FF] rounded-xl text-[1.6rem] py-4 px-4 focus:border-indigo-500 focus:outline-none placeholder:text-[1.5rem] laptop-md:text-[1.4rem] laptop-md:p-3 laptop:text-[1.3rem] laptop:rounded-md"
                    />
                  </div>
                  <div>
                    <p>
                      <label htmlFor="gstin">GSTIN</label>
                    </p>
                    <input
                      id="gstin"
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="Enter GSTIN"
                      className="w-full border border-[#EFF3FF] rounded-xl text-[1.6rem] py-4 px-4 focus:border-indigo-500 focus:outline-none placeholder:text-[1.5rem] laptop-md:text-[1.4rem] laptop-md:p-3 laptop:text-[1.3rem] laptop:rounded-md"
                    />
                    {error && <p className="aam-error-label text-red-500 text-sm mt-1">{error}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5 laptop-l:gap-4 laptop:gap-3">
              <span className="line"></span>
              <div className="capitalize">
                <span className="block text-[1.8rem] leading-[1] text-primary laptop-l:text-[1.5rem] laptop-md:text-[1.4rem] laptop:text-[1.3rem] tab-m:text-[1.4rem]">
                  {isExpDel
                    ? `your product will be deilvered in ${expHour / 24} day`
                    : `your product will be deilvered in ${estimate_delivery_normal_day} days`}
                </span>
              </div>
              <span className="line"></span>
            </div>

            <div className="place-center total-container">
              <p>Total</p>
              <h5>₹ {calculateTotal()}</h5>
            </div>
            <button className="checkout-btn" onClick={handleShowPopup} disabled={placingOrder}>
              checkout
            </button>
            {showConfirmModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-10">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-6 p-10 animate-fade-in">
                  <div className="flex justify-center mb-6">
                    <svg className="w-20 h-20 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    </svg>
                  </div>

                  <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Are You Sure You Want to Place This Order?</h2>

                  <p className="text-center text-gray-600 text-[1.4rem] leading-relaxed mb-8">
                    Once placed, this order will be processed for delivery and cannot be undone. Please review your selections before confirming.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button
                      className="px-8 py-3 text-xl font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      onClick={() => setShowConfirmModal(false)}>
                      Cancel
                    </button>
                    <button
                      className="px-8 py-3 text-xl font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                      onClick={() => {
                        setShowConfirmModal(false)
                        handleCheckout()
                      }}>
                      Yes, Place Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}

OrderSummary.propTypes = {
  instruction: PropTypes.string.isRequired,
  paymentMethod: PropTypes.number.isRequired,
  selectedAddId: PropTypes.number.isRequired,
  selectedBranchId: PropTypes.number.isRequired,
}

export default OrderSummary
