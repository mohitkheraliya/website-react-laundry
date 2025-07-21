import PropTypes, { oneOfType } from "prop-types";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import useSendFeedback from "../../hooks/feedback/useSendFeedback";
import { IoClose } from "react-icons/io5";

const FeedbackModel = ({ order_id, setModelIsOpen, feedback, setRefetch }) => {
  const { sendFeedBack, loading } = useSendFeedback();
  const [error, setError] = useState({});
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isFbAvaileble, setIsFbAvaileble] = useState(false);

  useEffect(() => {
    if (feedback) {
      const { comment, rating } = feedback;
      setMessage(comment);
      setRating(rating);
      setIsFbAvaileble(true);
    }
  }, [feedback, isFbAvaileble]);

  const handleClick = (value) => {
    if (isFbAvaileble) {
      return;
    }
    setRating(value);
  };

  const handleSubmit = async () => {
    const newError = {};

    if (rating === 0) {
      newError.star = "Please select at least one star.";
    }

    if (message === "") {
      newError.message = "Please enter your message.";
    }

    if (message.trim().length >= 512) {
      setError("message cannot exceed 512 characters");
    }

    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }
    setError({});
    const param = {
      rating,
      comment: message,
      order_id: order_id,
      is_publish: 1,
    };
    const result = await sendFeedBack(param);
    if (result) {
      setModelIsOpen(false);
      setRefetch((prev) => !prev);
    }
  };

  return (
    <div className="fixed inset-0 top-0 bg-black bg-opacity-75 flex justify-center items-center mb-l:p-6 mb:p-4">
      <div className="border border-[#b9bccf4d] rounded-xl bg-white px-14 py-16 flex flex-col gap-10 w-[40rem] relative laptop:px-12 laptop:py-14 laptop:gap-8 tab-l:rounded-lg tab-l:px-10 tab-l:py-12 tab-l:w-[37.5rem] tab-s:gap-6 tab-s:w-[35rem] mb-l:gap-4">
        <button
          type="button"
          title="close"
          className="absolute top-4 right-4 border border-gray-300 rounded-md p-1 inline-flex items-center justify-center text-gray-400 focus:outline-none focus:border-indigo-500 shadow-2xl laptop:right-3 laptop:top-3 tab-s:right-2 tab-s:top-2"
          onClick={() => setModelIsOpen(false)}
        >
          <IoClose className="h-7 w-7 tab-s:h-6 tab-s:w-6" />
        </button>

        <div className="text-[2rem] capitalize text-[var(--black)] font-semibold laptop:text-[1.8rem] tab-s:text-[1.6rem]">
          Order No: #{order_id}
        </div>

        <div>
          <div className="flex justify-start items-center gap-4 tab-s:gap-3">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <FaStar
                  key={index}
                  onClick={() => handleClick(index + 1)}
                  className={`inline-block h-[4.6rem] w-[4.6rem] cursor-pointer text-3xl laptop:h-[4.2rem] laptop:w-[4.2rem] tab-s:h-[3.8rem] tab-s:w-[3.8rem] ${
                    index < rating ? "fill-[#FF2E17]" : "fill-[#B9BCCF]"
                  }`}
                />
              ))}
          </div>
          {error.star && (
            <span className="block mt-2 text-xl leading-1 text-secondary tab-s:text-lg">
              {error.star}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6 laptop:gap-4">
          <label
            htmlFor="message"
            className="text-[1.4rem] leading-[2rem] text-[var(--black)]"
          >
            Write a Review
          </label>
          <div>
            <textarea
              id="message"
              rows={6}
              value={message}
              readOnly={isFbAvaileble}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-[1.4rem] leading-[2.25rem] text-[var(--black)] border border-indigo-200 focus:border-indigo-500 focus:outline-none rounded-lg p-3 tab-s:leading-[2.1rem] tab-s:p-2"
            ></textarea>
            {error.message && (
              <span className="block mt-2 text-xl leading-1 text-secondary tab-s:text-lg">
                {error.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-start items-center gap-8 tab-s:gap-6">
          <button
            className={`text-white font-medium w-[8.5rem] h-[3.75rem] text-[1.4rem] leading-[1.25] rounded-lg capitalize flex justify-center items-center ${
              isFbAvaileble
                ? "bg-[#b9bccf] cursor-not-allowed"
                : "bg-primary cursor-pointer"
            }`}
            onClick={handleSubmit}
            disabled={!!isFbAvaileble}
          >
            {loading ? (
              <span className="inline-block h-8 w-8 border-2 border-white/25 border-r-white rounded-full animate-spin"></span>
            ) : (
              <span>submit</span>
            )}
          </button>
          <button
            className="text-[var(--black)] font-medium w-[8.5rem] h-[3.75rem] text-[1.4rem] leading-[1.25] rounded-lg capitalize flex justify-center items-center border border-gray-300"
            onClick={() => setModelIsOpen(false)}
          >
            <span>cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

FeedbackModel.propTypes = {
  order_id: PropTypes.number.isRequired,
  setModelIsOpen: PropTypes.func.isRequired,
  setRefetch: PropTypes.func.isRequired,
  feedback: oneOfType([
    PropTypes.string,
    PropTypes.shape({
      comment: PropTypes.string,
      rating: PropTypes.number,
    }),
  ]),
};
export default FeedbackModel;
