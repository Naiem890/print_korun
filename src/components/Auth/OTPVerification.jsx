/* eslint-disable react/no-unescaped-entities */
import { useSignIn } from "react-auth-kit";
import { toast } from "react-hot-toast";
import MISTImage from "../../assets/MIST.png";
import { Link, useNavigate } from "react-router-dom";
import { Axios } from "../../api/api";
import Logo from "../Common/Logo";
import { fixedButtonClass, fixedInputClass } from "../../Utils/constant";
import OtpInput from "./OTPInput";
import { useEffect, useState } from "react";
import { useAuthUser } from "react-auth-kit";

export default function OTPVerification() {
  const navigate = useNavigate();
  const auth = useAuthUser();
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(120);
  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) =>
        prevCountdown > 0 ? prevCountdown - 1 : 0
      );
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);
  const handleOTPVerification = async (e) => {
    e.preventDefault();

    try {
      const result = await Axios.post("/auth/verify-otp", {
        otp,
      }).then((res) => res.data);

      console.log(result);
      toast.success(result.message || result.error);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  };

  const handleOTPResend = async (e) => {
    e.preventDefault();

    try {
      await Axios.post("/auth/send-otp");

      toast.success("OTP sent successfully");

      navigate("/printers");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] flex-1 flex-col justify-center px-4 py-12 lg:px-8 -mt-16 md:my-0">
      <div className="shadow-lg bg-white rounded-xl p-6 sm:p-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Logo
          logo={MISTImage}
          alt="Osmany Hall"
          title="Sohoz Print"
          subTitle="User Login"
        />

        <div className="mt-10 ">
          <form
            className="flex flex-col gap-4"
            onSubmit={handleOTPVerification}
          >
            <>
              <h1 className="text-2xl font-extrabold text-gray-800 capitalize sm:text-3xl">
                Enter OTP
              </h1>
              <p className="opacity-60 md:text-base">
                An otp has been sent to{" "}
                <span className="font-bold">{auth()?.phone}</span>
              </p>
              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                }}
              />
            </>

            <button type="submit" className={`${fixedButtonClass}`}>
              Verify OTP
            </button>
            <div className="divider my-0"></div>
            {countdown ? (
              <div className="text-center text-sm text-gray-600">
                <p>
                  Resend OTP in{" "}
                  <span className="font-semibold text-emerald-600">
                    {Math.floor(countdown / 60)}:
                    {countdown % 60 < 10
                      ? `0${countdown % 60}`
                      : countdown % 60}
                  </span>{" "}
                  seconds
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-600 ">
                Didn't receive the OTP?{"  "}
                <button
                  onClick={handleOTPResend}
                  className="text-emerald-600 hover:text-emerald-500 font-semibold"
                >
                  Resend
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
