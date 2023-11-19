/* eslint-disable react/no-unescaped-entities */
import { useSignIn } from "react-auth-kit";
import { toast } from "react-hot-toast";
import MISTImage from "../../assets/MIST.png";
import { Link, useNavigate } from "react-router-dom";
import { Axios } from "../../api/api";
import Logo from "../Common/Logo";
import { fixedButtonClass, fixedInputClass } from "../../Utils/constant";

export default function SignUp() {
  const signIn = useSignIn();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    const confirmedPassword = e.target.confirmedPassword.value;

    // add check if password and confirmed password are same

    if (password !== confirmedPassword) {
      toast.error("Password not matching");
      e.target.password.focus();
      return;
    }

    try {
      const result = await Axios.post("auth/signup", {
        name,
        phone,
        password,
        confirmedPassword,
      }).then((res) => res.data);

      console.log("result", result);
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
      toast.success(result.message || result.error);

      if (result?.user?.isPhoneVerified) {
        navigate("/dashboard");
      } else {
        navigate("/verify-phone");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] flex-1 flex-col justify-center px-4 py-12 lg:px-8 -mt-16 md:my-0">
      <div className="shadow-lg bg-white rounded-xl p-6 sm:p-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <Logo
          logo={MISTImage}
          alt="Osmany Hall"
          title="Sohoz Print"
          subTitle="User SignUp"
        />

        <div className="mt-10 ">
          <form
            className="grid grid-cols-2 gap-x-6 gap-y-4"
            onSubmit={handleSignUp}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-600"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Joe Brown"
                autoComplete="name"
                required
                className={`${fixedInputClass} mt-2`}
              />
            </div>
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

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="confirmedPassword"
                  className="block text-sm font-medium leading-6 text-gray-600"
                >
                  Confirm Password
                </label>
              </div>
              <input
                id="confirmedPassword"
                name="confirmedPassword"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className={`${fixedInputClass} mt-2 tracking-widest`}
              />
            </div>

            <button
              type="submit"
              className={`${fixedButtonClass} col-span-full mt-4`}
            >
              Create Account
            </button>
            <div className="divider my-0 col-span-full"></div>
            <p className="text-center text-sm text-gray-600 col-span-full">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-500 font-semibold"
              >
                Log in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
