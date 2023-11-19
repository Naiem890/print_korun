/* eslint-disable react/no-unescaped-entities */
import { useSignIn } from "react-auth-kit";
import { toast } from "react-hot-toast";
import MISTImage from "../../assets/MIST.png";
import { Link, useNavigate } from "react-router-dom";
import { Axios } from "../../api/api";
import Logo from "../Common/Logo";
import { fixedButtonClass, fixedInputClass } from "../../Utils/constant";

export default function Login() {
  const signIn = useSignIn();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const phone = e.target.phone.value;
    const password = e.target.password.value;

    try {
      const result = await Axios.post("/auth/login", {
        phone,
        password,
      }).then((res) => res.data);

      console.log(result);
      signIn({
        token: result.token,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: {
          _id: result?.user?._id,
          phone: result?.user?.phone,
          name: result?.user?.name,
          isPhoneVerified: result?.user?.isPhoneVerified,
        },
      });
      toast.success("Login successful");

      if (result?.user?.isPhoneVerified) {
        navigate("/dashboard");
      } else {
        navigate("/verify-phone");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
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
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium leading-6 text-gray-600"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                inputMode="numeric"
                placeholder="01790732717"
                autoComplete="phone"
                required
                className={`${fixedInputClass} mt-2`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-600"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-right text-sm font-semibold leading-6 text-emerald-600 hover:text-emerald-500"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className={`${fixedInputClass} mt-2 tracking-widest`}
              />
            </div>

            <button type="submit" className={`${fixedButtonClass}`}>
              Login
            </button>
            <div className="divider my-0"></div>
            <p className="text-center text-sm text-gray-600 ">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-emerald-600 hover:text-emerald-500 font-semibold"
              >
                Sign up now!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
