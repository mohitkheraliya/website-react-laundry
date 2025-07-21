import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { RiHourglassFill, RiMoneyRupeeCircleFill } from "react-icons/ri";
import { IoCaretDown, IoCaretUp, IoNewspaper } from "react-icons/io5";
import useGetOrders from "../../hooks/dashboard/useGetOrders";
import Loading from "./Loading";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
  FaEye,
  FaStar,
} from "react-icons/fa";
import useGetOrders02 from "../../hooks/dashboard/useGetOrders02";
import { IoMdDownload } from "react-icons/io";
import useDownloadInvoice from "../../hooks/invoice/useDownloadInvoice";
import { CiStar } from "react-icons/ci";

import { Backdrop, CircularProgress, IconButton } from "@mui/material";
import FeedbackModel from "./FeedbackModel";
import toast from "react-hot-toast";
import useGetTransactionId from "../../hooks/payement/useGetTransactionId";
import useVerifyPayement from "../../hooks/payement/useVerifyPayement";
import useClearDue from "../../hooks/cleardue/useClearDue";
import { useSelector } from "react-redux";
import CancelOrderModel from "./CancelOrderModel";
import { MdCancel } from "react-icons/md";
import PartialPayementModel from "./payemetModel/PartialPayementModel";

const Home = () => {
  const { getOrders } = useGetOrders();
  const { getOrders02 } = useGetOrders02();
  const [orders, setOrders] = useState([]);
  const [ipoCount, setIpoCount] = useState(0);
  const [totalDueAmt, SetTotalDueAmt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [activeBtn, setActiveBtn] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [invoice, setInvoice] = useState(0);
  const [modelProp, setModelProp] = useState("");
  const [currentFb, setCurrentFb] = useState({});
  const { downloadInvoice, loading: loadingInvoice } = useDownloadInvoice();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dueOrderIds, setDueOrderIds] = useState([]);

  const { getTransactionId } = useGetTransactionId();
  const { verifyPayement } = useVerifyPayement();
  const { clearDue } = useClearDue();
  const [modelIsOpen, setModelIsOpen] = useState(false);
  const [cancelModelIsOpen, setCancelModelIsOpen] = useState(false);
  const userData = useSelector((state) => state?.user?.user);
  const [isPartialPay, setIsPartialPay] = useState(false);

  const [refetch, setRefetch] = useState(false);

  const handlePageClick = async (page) => {
    setLoading(true);
    setCurrentPage(page);
    const result = await getOrders02(page);
    if (result) {
      setOrders(result.result);
      setLoading(false);
    }
  };

  const handleUpDownClick = async (order_by) => {
    setSortColumn(order_by);
    if (!sortOrder) {
      setSortOrder("desc");
      const result = await getOrders02(currentPage, "asc", order_by);
      if (result) {
        setOrders(result.result);
      }
      return;
    }
    if (sortOrder == "desc") {
      setSortOrder("asc");
      const result = await getOrders02(currentPage, sortOrder, order_by);
      if (result) {
        setOrders(result.result);
      }
    } else {
      setSortOrder("desc");
      const result = await getOrders02(currentPage, sortOrder, order_by);
      if (result) {
        setOrders(result.result);
      }
    }
  };

  const handleDownloadClick = async (order_id) => {
      setInvoice(order_id);
      await downloadInvoice(order_id);
  };

  const handleGiveFeedBack = (order_id, feedback) => {
    setModelIsOpen(true);
    setModelProp(order_id);
    setCurrentFb(feedback);
  };

  const handlePaynow = async () => {
    if (!totalDueAmt || totalDueAmt <= 0) {
      toast("No due amount to clear.", {
        className: "toast-success",
      });
      return;
    }

    setOpen(true);
    const razorpay_order_id = await getTransactionId(totalDueAmt);

    if (!razorpay_order_id) {
      toast.error("Failed to generated transaction id !", {
        className: "toast-error",
      });
      setOpen(false);
      return;
    } else {
      try {
        const { first_name, last_name, mobile_number } = userData;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          aount: totalDueAmt * 100,
          currency: "INR",
          description: "Due Payement",
          order_id: razorpay_order_id,
          handler: async function (response) {
            setOpen(true);
            const res = await verifyPayement(response);
            if (!res.status) {
              setOpen(false);
              return;
            } else {
              const result = await clearDue(
                totalDueAmt,
                razorpay_order_id,
                dueOrderIds
              );
              if (result.status) {
                setRefetch((prev) => !prev);
              }
              setOpen(false);
            }
          },
          prefill: {
            name: first_name + " " + last_name,
            email: "user@gmail.com",
            contact: mobile_number,
          },
          theme: {
            color: "#161F5F",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch {
        toast.error(
          "Failed to initiate online payement please try again letter!",
          {
            className: "toast-error",
          }
        );
      } finally {
        setOpen(false);
      }
    }
  };

  const handleCancelOrder = (order_id, order_status) => {
    if (order_status === 11) {
      toast("Order is delivered and cannot be canceled.");
      return;
    }

    if (order_status === 12 || order_status === 13) {
      toast("Order is cancelled alredy");
      return;
    }

    setModelProp(order_id);
    setCancelModelIsOpen(true);
  };

  const handlePartialPay = () => {
    setIsPartialPay(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setActiveBtn(1);
      const result = await getOrders();
      if (result) {
        setDueOrderIds(result.order_ids);
        SetTotalDueAmt(result?.total_pending_due_amount);
        setIpoCount(result.inProgressCount);
        setTotalRows(result.count);
        setCount(Math.ceil(result.count / 10));
        setOrders(result.result);
        setLoading(false);
      }
      setLoading(false);
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col gap-8 tab-l:gap-6 mb-l:gap-4">
        <div className="flex items-start justify-between gap-14 laptop-m:gap-10 laptop:gap-8 tab-l:gap-6 tab-s:gap-4 tab-s:flex-wrap tab-s:items-stretch">
          <div className="status-card flex gap-8 items-center laptop:gap-6 tab-l:gap-4 tab-l:flex-col tab-s:min-w-[21rem] tab-s:flex-1 tab-s:order-last mb-l:order-first">
            <span className="bg-[#FFE0EB] inline-block h-24 w-24 rounded-full laptop:h-20 laptop:w-20 tab-l:h-[4.5rem] tab-l:w-[4.5rem] tab-s:h-16 tab-s:w-16">
              <RiMoneyRupeeCircleFill className="inline-block p-5 h-full w-full fill-[#FF82AC] laptop:p-4 tab-l:p-3 tab-s:p-3" />
            </span>
            <div className="flex flex-col gap-4 grow laptop-s:gap-3 tab-l:self-stretch tab-l:items-center tab-s:gap-2 ">
              <p className="card-label">Total Pending Due Amount</p>
              <p className="card-price">₹{totalDueAmt || "0"}</p>
              {totalDueAmt && totalDueAmt > 0 ? (
                <div className="flex justify-start items-center flex-wrap gap-4">
                  <button className="paynow-btn" onClick={handlePaynow}>
                    Pay Full
                  </button>
                  <button className="paynow-btn" onClick={handlePartialPay}>
                    Pay Partial
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="status-card flex gap-8 items-center laptop:gap-6 tab-l:gap-4 tab-l:flex-col tab-s:min-w-[21rem] tab-s:flex-1">
            <span className="bg-[#DCFAF8] inline-block h-24 w-24 rounded-full laptop:h-20 laptop:w-20 tab-l:h-[4.5rem] tab-l:w-[4.5rem] tab-s:h-16 tab-s:w-16">
              <IoNewspaper className="inline-block p-7 h-full w-full fill-[#16DBCC] laptop:p-5 tab-l:p-4" />
            </span>
            <div className="flex flex-col gap-4 grow laptop:gap-3 tab-l:self-stretch tab-l:items-center tab-s:gap-2 tab-s:items-center">
              <p className="card-label">Lifetime Total Order Number</p>
              <p className="card-price">{totalRows}</p>
            </div>
          </div>

          <div className="status-card flex gap-8 items-center laptop:gap-6 tab-l:gap-4 tab-l:flex-col tab-s:flex-col tab-s:min-w-[21rem] tab-s:flex-1">
            <span className="bg-[#FEF7E7] inline-block h-24 w-24 rounded-full laptop:h-20 laptop:w-20 tab-l:h-[4.5rem] tab-l:w-[4.5rem] tab-s:h-16 tab-s:w-16">
              <RiHourglassFill className="inline-block p-6 h-full w-full fill-[#F2B413] laptop:p-5 tab-l:p-4" />
            </span>
            <div className="flex flex-col gap-4 grow laptop:gap-3 tab-l:self-stretch tab-l:items-center tab-s:gap-2 tab-s:items-center">
              <p className="card-label">Total In Progress Orders</p>
              <p className="card-price">{ipoCount}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 laptop:gap-6 tab-s:gap-5 mb-l:gap-4">
          <h3 className="booking-title">Your Booking List</h3>
          <div className="main-orders-container">
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleUpDownClick("order_id")}
                    >
                      <span>Order No</span>
                      <span className="flex flex-col">
                        <IoCaretUp
                          className={`updown-icon ${
                            sortOrder === "desc" && sortColumn === "order_id"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                        <IoCaretDown
                          className={`updown-icon ${
                            sortOrder === "asc" && sortColumn === "order_id"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                      </span>
                    </th>
                    <th
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleUpDownClick("created_at")}
                    >
                      <span>booking date</span>
                      <span className="flex flex-col">
                        <IoCaretUp
                          className={`updown-icon ${
                            sortOrder === "desc" && sortColumn === "created_at"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                        <IoCaretDown
                          className={`updown-icon ${
                            sortOrder === "asc" && sortColumn === "created_at"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                      </span>
                    </th>
                    <th
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() =>
                        handleUpDownClick("estimated_delivery_time")
                      }
                    >
                      <span>delivery date</span>
                      <span className="flex flex-col">
                        <IoCaretUp
                          className={`updown-icon ${
                            sortOrder === "desc" &&
                            sortColumn === "estimated_delivery_time"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                        <IoCaretDown
                          className={`updown-icon ${
                            sortOrder === "asc" &&
                            sortColumn === "estimated_delivery_time"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                      </span>
                    </th>
                    <th
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleUpDownClick("total")}
                    >
                      <span>amount</span>
                      <span className="flex flex-col">
                        <IoCaretUp
                          className={`updown-icon ${
                            sortOrder === "desc" && sortColumn === "total"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                        <IoCaretDown
                          className={`updown-icon ${
                            sortOrder === "asc" && sortColumn === "total"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                      </span>
                    </th>
                    <th
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleUpDownClick("kasar_amount")}
                    >
                      <span>kasar</span>
                      <span className="flex flex-col">
                        <IoCaretUp
                          className={`updown-icon ${
                            sortOrder === "desc" &&
                            sortColumn === "kasar_amount"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                        <IoCaretDown
                          className={`updown-icon ${
                            sortOrder === "asc" && sortColumn === "kasar_amount"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                      </span>
                    </th>
                    <th
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleUpDownClick("paid_amount")}
                    >
                      <span>paid</span>
                      <span className="flex flex-col">
                        <IoCaretUp
                          className={`updown-icon ${
                            sortOrder === "desc" && sortColumn === "paid_amount"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                        <IoCaretDown
                          className={`updown-icon ${
                            sortOrder === "asc" && sortColumn === "paid_amount"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                      </span>
                    </th>
                    <th
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleUpDownClick("order_status")}
                    >
                      <span>status</span>
                      <span className="flex flex-col">
                        <IoCaretUp
                          className={`updown-icon ${
                            sortOrder === "desc" &&
                            sortColumn === "order_status"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                        <IoCaretDown
                          className={`updown-icon ${
                            sortOrder === "asc" && sortColumn === "order_status"
                              ? "!fill-[#676788]"
                              : ""
                          }`}
                        />
                      </span>
                    </th>
                    <th className="">actions</th>
                  </tr>
                </thead>
                <tbody>
                  {totalRows > 0 ? (
                    orders.map((order, index) => {
                      const {
                        order_id,
                        total,
                        created_at,
                        estimated_delivery_time,
                        kasar_amount,
                        paid_amount,
                        order_status,
                        order_status_name,
                        feedback,
                      } = order;

                      return (
                        <tr
                          key={index}
                          onClick={() =>
                            navigate("/dashboard/view-order", {
                              state: { order_id },
                            })
                          }
                          className="cursor-pointer"
                        >
                          <td>{order_id}</td>
                          <td>
                            {dayjs(created_at).format("DD/MM/YYYY, hh:mm A")}
                          </td>
                          <td>
                            {dayjs(estimated_delivery_time).format(
                              "DD/MM/YYYY"
                            )}
                          </td>
                          <td>₹{total}</td>
                          <td>₹{kasar_amount}</td>
                          <td>{"₹" + paid_amount || "0"}</td>
                          <td
                            style={{ padding: "5px", textAlign: "left" }}
                            className="flex items-center justify-center"
                          >
                            <span
                              className={`inline-block px-4 py-1 rounded-lg font-medium text-[1rem] leading-[2.4rem] order-status-label-${
                                order_status >= 4 && order_status < 9
                                  ? 0
                                  : order_status
                              }`}
                            >
                              {order_status_name}
                            </span>
                          </td>

                          <td className="flex justify-start items-center gap-5 !p-[0.5rem]">
                            <div className="relative group">
                              <button
                                className="icon-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/dashboard/view-order", {
                                    state: { order_id },
                                  });
                                }}
                              >
                                <FaEye className="h-7 w-7 fill-primary tab-s:h-6 tab-s:w-6" />
                              </button>

                              <div
                                role="tooltip"
                                className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary text-white rounded-md shadow-sm px-3 py-2 text-sm text-nowrap tab:hidden"
                                style={{
                                  top: "-25px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                }}
                              >
                                View
                                <div
                                  className="tooltip-arrow"
                                  data-popper-arrow
                                ></div>
                              </div>
                            </div>

                              <div className="relative group">
                                <button
                                  className="icon-button"
                                  disabled={loadingInvoice}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadClick(order_id);
                                  }}
                                >
                                  {loadingInvoice && invoice === order_id ? (
                                    <IconButton>
                                      <span className="inline-block h-8 w-8 rounded-full border-[3px] border-white border-r-indigo-600 animate-spin"></span>
                                    </IconButton>
                                  ) : (
                                    <IoMdDownload
                                      className={`inline-block h-8 w-8 tab-s:h-7 tab-s:w-7 fill-[var(--primary)] cursor-pointer`}
                                    />
                                  )}
                                </button>
                                  <div
                                    role="tooltip"
                                    className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[var(--primary)] text-white rounded-md shadow-sm px-3 py-2 text-sm text-nowrap tab:hidden"
                                    style={{
                                      top: "-25px",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                    }}
                                  >
                                    Download
                                    <div
                                      className="tooltip-arrow"
                                      data-popper-arrow
                                    ></div>
                                  </div>
                              </div>

                            {order_status === 11 && (
                              <div className="relative group">
                                <button
                                  className={`icon-button`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGiveFeedBack(order_id, feedback);
                                  }}
                                >
                                  {feedback ? (
                                    <FaStar
                                      className={`inline-block h-8 w-8 cursor-pointer fill-[var(--primary)] tab-s:h-7 tab-s:w-7`}
                                    />
                                  ) : (
                                    <CiStar
                                      className={`inline-block h-8 w-8 cursor-pointer fill-[var(--primary)] tab-s:h-7 tab-s:w-7`}
                                    />
                                  )}
                                </button>
                                <div
                                  role="tooltip"
                                  className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[var(--primary)] text-white rounded-md shadow-sm px-3 py-2 text-sm text-nowrap tab:hidden"
                                  style={{
                                    top: "-25px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                  }}
                                >
                                  {feedback ? "View Feedback" : "Give Feedback"}
                                  <div
                                    className="tooltip-arrow"
                                    data-popper-arrow
                                  ></div>
                                </div>
                              </div>
                            )}

                            {order_status === 1 || order_status === 2 ? (
                              <div className="relative group">
                                <button
                                  className="icon-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelOrder(order_id, order_status);
                                  }}
                                >
                                  <MdCancel
                                    className={`inline-block h-8 w-8 tab-s:h-6 tab-s:w-6 fill-[var(--primary)]`}
                                  />
                                </button>

                                <div
                                  role="tooltip"
                                  className={`absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white rounded-md shadow-sm px-3 py-2 text-sm text-nowrap tab:hidden bg-[var(--primary)]`}
                                  style={{
                                    top: "-25px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                  }}
                                >
                                  Cancel Order
                                  <div
                                    className="tooltip-arrow"
                                    data-popper-arrow
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="text-center col-span-full">
                        No record found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-white flex items-center justify-between px-8 max-w-full laptop:px-6 tab:px-4 tab:flex-wrap mb-l:flex-col mb-l:gap-4 mb-l:py-4">
              {totalRows > 10 && (
                <>
                  <p className="current-page-num">
                    Showing{" "}
                    {(currentPage === 1 && "1") || (currentPage - 1) * 10 + 1}{" "}
                    to {currentPage === count ? totalRows : currentPage * 10}{" "}
                    entries
                  </p>
                  <div className="flex items-center gap-4 mb-l:flex-wrap mb-l:justify-center">
                    <button
                      className={`pagination-btn`}
                      onClick={() => {
                        if (currentPage !== 1) {
                          handlePageClick(1);
                          setActiveBtn(1);
                        }
                      }}
                    >
                      <FaAngleDoubleLeft
                        className={`${
                          currentPage == 1 ? "page-icon-light" : "page-icon"
                        }`}
                      />
                    </button>
                    <button
                      className={`pagination-btn`}
                      onClick={() => {
                        if (currentPage !== 1) {
                          handlePageClick(currentPage - 1);
                          setActiveBtn(currentPage - 1);
                        }
                      }}
                    >
                      <FaAngleLeft
                        className={`${
                          currentPage == 1 ? "page-icon-light" : "page-icon"
                        }`}
                      />
                    </button>
                    <button
                      className={`pagination-btn ${
                        activeBtn === 1 && "active-page"
                      }`}
                      onClick={() => {
                        if (currentPage !== 1) {
                          handlePageClick(1);
                          setActiveBtn(1);
                        }
                      }}
                    >
                      <span className="page-num">1</span>
                    </button>
                    {count > 1 && (
                      <button
                        className={`pagination-btn ${
                          activeBtn === 2 && "active-page"
                        }`}
                        onClick={() => {
                          if (currentPage !== 2) {
                            handlePageClick(2);
                            setActiveBtn(2);
                          }
                        }}
                      >
                        <span className="page-num">2</span>
                      </button>
                    )}
                    {count > 2 && (
                      <button
                        className={`pagination-btn ${
                          activeBtn === 3 && "active-page"
                        }`}
                        onClick={() => {
                          if (currentPage !== 3) {
                            handlePageClick(3);
                            setActiveBtn(3);
                          }
                        }}
                      >
                        <span className="page-num">3</span>
                      </button>
                    )}
                    {count > 3 && (
                      <>
                        <button className={`pagination-btn border-transparent`}>
                          <span className="page-num">...</span>
                        </button>
                        <button
                          className={`pagination-btn ${
                            activeBtn === count && "active-page"
                          }`}
                          onClick={() => {
                            if (currentPage !== count) {
                              handlePageClick(count);
                              setActiveBtn(count);
                            }
                          }}
                        >
                          <span className="page-num">{count}</span>
                        </button>
                      </>
                    )}
                    <button className={`pagination-btn`}>
                      <FaAngleRight
                        className={`${
                          currentPage == count ? "page-icon-light" : "page-icon"
                        }`}
                        onClick={() => {
                          if (currentPage !== count) {
                            handlePageClick(currentPage + 1);
                            setActiveBtn(currentPage + 1);
                          }
                        }}
                      />
                    </button>
                    <button className={`pagination-btn`}>
                      <FaAngleDoubleRight
                        className={`${
                          currentPage == count ? "page-icon-light" : "page-icon"
                        }`}
                        onClick={() => {
                          if (currentPage !== count) {
                            handlePageClick(count);
                            setActiveBtn(count);
                          }
                        }}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {modelIsOpen && (
        <FeedbackModel
          order_id={modelProp}
          setModelIsOpen={setModelIsOpen}
          feedback={currentFb}
          setRefetch={setRefetch}
        />
      )}

      {cancelModelIsOpen && (
        <CancelOrderModel
          setCancelModelIsOpen={setCancelModelIsOpen}
          order_id={modelProp}
          setRefetch={setRefetch}
        />
      )}
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {isPartialPay && (
        <PartialPayementModel
          setModleHandler={setIsPartialPay}
          setRefetch={setRefetch}
        />
      )}
    </>
  );
};

export default Home;
