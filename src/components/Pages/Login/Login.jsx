import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import api from "../../../api/api";
import { toast } from "react-toastify";
import OtpInput from "./OTPInput";

export default function Login() {
  const [loader, setLoader] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSend, setOtpSend] = useState(false);
  const [otp, setOtp] = useState("");

  const sendOTPHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoader(true);
    await api
      .post("/api/auth/send-otp", { phoneNumber })
      .then((response) => {
        console.log("Response:", response.data);
        toast.success(response.data.message, { theme: "colored" });
        setOtpSend(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.response.data.error, { theme: "colored" });
      });
    setLoader(false);
  };

  const verifyOTPHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoader(true);
    await api
      .post("/api/auth/verify-otp", { phoneNumber, otp })
      .then((response) => {
        console.log("Response:", response.data);
        toast.success(response.data.message, { theme: "colored" });
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.response.data.error, { theme: "colored" });
      });
    setLoader(false);
  };
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
        <form
          onSubmit={otpSend ? verifyOTPHandler : sendOTPHandler}
          className="w-full max-w-md px-2 -mt-20"
        >
          <img
            className="w-auto h-7 sm:h-8 mb-4 inline-block"
            src="https://merakiui.com/images/logo.svg"
            alt=""
          />
          {otpSend ? (
            <>
              <h1 className="mt-5 text-2xl font-extrabold text-gray-800 capitalize sm:text-3xl dark:text-white">
                Enter OTP
              </h1>
              <p className="dark:text-white opacity-60 mt-2 text-sm md:text-base font-mono tracking-tighter">
                An otp has been sent to{" "}
                <span className="font-bold">{phoneNumber}</span>
              </p>
              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                }}
              />
            </>
          ) : (
            <>
              <h1 className="mt-5 text-2xl font-extrabold text-gray-800 capitalize sm:text-3xl dark:text-white">
                Phone Number
              </h1>
              <div className="relative flex items-center mt-4">
                <div className="absolute">
                  <DevicePhoneMobileIcon className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input w-full px-12 border border-slate-600 focus:border-success bg-transparent text-slate-400 text-xl font-bold placeholder:opacity-50"
                  placeholder="01xxxxxxxxx"
                  maxLength={11}
                  inputMode="numeric"
                />
              </div>
            </>
          )}

          <div className="mt-10">
            <button type="submit" className="btn btn-success w-full">
              {loader ? (
                <span className="loading loading-dots loading-md"></span>
              ) : otpSend ? (
                "Verify OTP"
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
