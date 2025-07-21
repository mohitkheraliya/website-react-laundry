import PropTypes from "prop-types";
import "./ppmodel.css";
import { IoClose } from "react-icons/io5";
import useFetchDueOrders from "../../../hooks/payement/useFetchDueOrders";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useState } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import useGetTransactionId from "../../../hooks/payement/useGetTransactionId";
import { useSelector } from "react-redux";
import useVerifyPayement from "../../../hooks/payement/useVerifyPayement";
import useClearDue from "../../../hooks/cleardue/useClearDue";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import DueOrdersShimmer from "./DueOrdersShimmer";

const PartialPayementModel = ({ setModleHandler, setRefetch }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBtn, setActiveBtn] = useState(1);

  const { dueData, loading } = useFetchDueOrders(currentPage);
  const userData = useSelector((state) => state?.user?.user);

  const [payAmount, setPayAmount] = useState(0);
  const [dueOrders, setDueOrders] = useState({});
  const [open, setOpen] = useState(false);

  const { getTransactionId } = useGetTransactionId();
  const { verifyPayement } = useVerifyPayement();
  const { clearDue } = useClearDue();

  const hanldePay = async () => {
    setOpen(true);
    const razorpay_order_id = await getTransactionId(payAmount);

    if (!razorpay_order_id) {
      toast.error("Failed to generated transaction id !", {
        className: "toast-error",
      });
      setOpen(false);
      return;
    } else {
      try {
        const { first_name, last_name, mobile_number, email } = userData;
        const allOrderIds = Object.values(dueOrders).flat();

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          aount: payAmount * 100,
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
                payAmount,
                razorpay_order_id,
                allOrderIds
              );
              if (result.status) {
                setOpen(false);
                setModleHandler(false);
                setRefetch((prev) => !prev);
              }
              setOpen(false);
            }
          },
          prefill: {
            name: first_name + " " + last_name,
            email: email,
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

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    setActiveBtn(pageNum);
  };

  const onCheckBoxCheckChange = (e, record) => {
    const { order_id, remaining_amount } = record;

    setDueOrders((prev) => {
      const updatedOrders = { ...prev };
      const selectedOrders = updatedOrders[currentPage] || [];

      if (e.target.checked) {
        if (!selectedOrders.includes(order_id)) {
          updatedOrders[currentPage] = [...selectedOrders, order_id];
          setPayAmount((prevAmount) => prevAmount + remaining_amount);
        }
      } else {
        updatedOrders[currentPage] = selectedOrders.filter(
          (id) => id !== order_id
        );
        setPayAmount((prevAmount) => prevAmount - remaining_amount);
      }

      return updatedOrders;
    });
  };

  const { count, result } = dueData;
  const last_index = count <= 10 ? 1 : Math.ceil(count / 10);

  return (
    <>
      <div className="fixed inset-0 top-0 bg-black bg-opacity-75 grid place-items-center p-4 overflow-y-auto tab-s:flex tab-s:items-center tab-s:justify-center tab-s:min-h-screen">
        <div className="border border-[#b9bccf4d] rounded-xl px-14 py-16 w-full max-w-[1000px] relative laptop:px-12 laptop:py-14 tab-l:rounded-lg tab-l:px-10 tab-l:py-12  tab-s:gap-6  mb-l:gap-4 bg-white tab-s:max-w-full tab-s:w-full tab:px-8 mb-l:px-6 tab:pb-8 mb-l:pb-6 tab-s:my-auto">
          {loading ? (
            <DueOrdersShimmer />
          ) : (
            <>
              <button
                type="button"
                title="close"
                className="absolute top-4 right-4 border border-gray-300 rounded-md p-1 inline-flex items-center justify-center text-gray-400 focus:outline-none focus:border-indigo-500 shadow-2xl laptop:right-3 laptop:top-3 tab-s:right-2 tab-s:top-2"
                onClick={() => setModleHandler(false)}
              >
                <IoClose className="h-8 w-8 laptop:h-7 laptop:w-7" />
              </button>
              <div className="flex justify-between items-center mb-8 mt-2 laptop:mb-6 mb-l:my-4">
                <h2 className="text-[2.25rem] leading-[1.75] capitalize text-[var(--black)] font-semibold laptop:text-[1.8rem] tab-s:text-[1.6rem]">
                  Orders
                </h2>
                <div className="flex justify-center items-center gap-8 laptop:gap-6">
                  <span className="text-[1.4rem] font-medium text-[var(--secondary)]">
                    Amount: ₹{payAmount}
                  </span>
                  <button
                    onClick={hanldePay}
                    disabled={payAmount === 0}
                    className={`${
                      payAmount === 0 ? "disabled-ppd-btn" : ""
                    } ppd-btn`}
                  >
                    Pay
                  </button>
                </div>
              </div>
              <div className="border border-[#b9bccf4d] rounded-lg">
                <div
                  className="
                overflow-x-auto max-w-full"
                >
                  <table className="pp-table">
                    <thead className="border-b border-[#b9bccf4d]">
                      <tr>
                        <th className="w-40 min-w-40">check</th>
                        <th className="min-w-48">Order No</th>
                        <th className="min-w-[18rem]">booking date</th>
                        <th className="min-w-[15rem]">delivery date</th>
                        <th className="min-w-40">Total</th>
                        <th className="min-w-40">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.length > 0 ? (
                        result.map((record, index) => {
                          const {
                            order_id,
                            created_at,
                            estimated_delivery_time,
                            total,
                            remaining_amount,
                          } = record;
                          return (
                            <tr key={index}>
                              <td>
                                <input
                                  type="checkbox"
                                  onChange={(e) =>
                                    onCheckBoxCheckChange(e, record)
                                  }
                                  checked={
                                    dueOrders[currentPage]?.includes(
                                      order_id
                                    ) || false
                                  }
                                  className="w-8 h-8 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-0 laptop-s:h-7 laptop-s:w-7"
                                />
                              </td>
                              <td>{order_id}</td>
                              <td>
                                {dayjs(created_at).format(
                                  "DD/MM/YYYY, hh:mm A"
                                )}
                              </td>
                              <td>
                                {dayjs(estimated_delivery_time).format(
                                  "DD/MM/YY, hh:mm A"
                                )}
                              </td>
                              <td>₹{total}</td>
                              <td>₹{remaining_amount}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="font-medium text-center">
                            No Due Order Found!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {count > 10 && (
                  <div className="bg-white flex items-center flex-wrap gap-4 justify-between px-5 max-w-full laptop:px-6  tab:px-4 tab:flex-wrap mb-l:flex-col mb-l:gap-4 border-t border-[#b9bccf4d] tab:py-3 data-[wrapped=true]:justify-center mb-l:p-3">
                    <p className="cpn-tag">
                      Showing{" "}
                      {(currentPage === 1 && "1") || (currentPage - 1) * 10 + 1}{" "}
                      to {currentPage === last_index ? count : currentPage * 10}{" "}
                      entries
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-l:flex-wrap">
                      <button
                        className={`pg-btn`}
                        onClick={() => {
                          if (currentPage !== 1) {
                            handlePageChange(1);
                          }
                        }}
                      >
                        <FaAngleDoubleLeft
                          className={`${
                            currentPage == 1 ? "pg-icon-light" : "pg-icon"
                          }`}
                        />
                      </button>
                      <button
                        className={`pg-btn`}
                        onClick={() => {
                          if (currentPage !== 1) {
                            handlePageChange(currentPage - 1);
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
                        className={`pg-btn ${
                          activeBtn === 1 ? "active-pg" : ""
                        }`}
                        onClick={() => {
                          if (currentPage !== 1) {
                            handlePageChange(1);
                          }
                        }}
                      >
                        <span className="pg-num">1</span>
                      </button>
                      <button
                        className={`pg-btn ${
                          activeBtn === 2 ? "active-pg" : ""
                        }`}
                        onClick={() => {
                          if (currentPage !== 2) {
                            handlePageChange(2);
                          }
                        }}
                      >
                        <span className="pg-num">2</span>
                      </button>
                      {count > 20 && (
                        <>
                          <button
                            className={`pg-btn ${
                              activeBtn === 3 ? "active-pg" : ""
                            }`}
                            onClick={() => {
                              if (currentPage !== 3) {
                                handlePageChange(3);
                              }
                            }}
                          >
                            <span className="pg-num">3</span>
                          </button>
                          {count > 30 && (
                            <>
                              <button
                                className={`pg-btn ${
                                  activeBtn === 4 ? "active-pg" : ""
                                } ${count > 40 ? "!hidden" : "!block"}`}
                                onClick={() => {
                                  if (currentPage !== 4) {
                                    handlePageChange(4);
                                  }
                                }}
                              >
                                <span className="pg-num">4</span>
                              </button>
                              {count > 40 && (
                                <>
                                  <button
                                    className={`pg-btn ${
                                      count > 40 &&
                                      currentPage >= 4 &&
                                      currentPage < last_index
                                        ? "active-pg"
                                        : ""
                                    }`}
                                  >
                                    <span className="pg-num">...</span>
                                  </button>

                                  <button
                                    className={`pg-btn ${
                                      activeBtn === last_index
                                        ? "active-pg"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (currentPage !== last_index) {
                                        handlePageChange(last_index);
                                      }
                                    }}
                                  >
                                    <span className="pg-num">{last_index}</span>
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}

                      <button
                        className={`pg-btn`}
                        onClick={() => {
                          if (currentPage !== last_index) {
                            handlePageChange(currentPage + 1);
                          }
                        }}
                      >
                        <FaAngleRight
                          className={`${
                            currentPage === last_index
                              ? "pg-icon-light"
                              : "pg-icon"
                          }`}
                        />
                      </button>

                      <button
                        className={`pg-btn`}
                        onClick={() => {
                          if (currentPage !== last_index) {
                            handlePageChange(last_index);
                          }
                        }}
                      >
                        <FaAngleDoubleRight
                          className={`${
                            currentPage === last_index
                              ? "pg-icon-light"
                              : "pg-icon"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

PartialPayementModel.propTypes = {
  setModleHandler: PropTypes.func.isRequired,
  setRefetch: PropTypes.func.isRequired,
};

export default PartialPayementModel;
