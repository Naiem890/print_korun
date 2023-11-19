import React, { useEffect, useState } from "react";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-hot-toast";
import { Axios } from "../../api/api";
import { fixedButtonClass, fixedInputClass } from "../../Utils/constant";

export default function Profile() {
  const [user, setUser] = useState(null);

  const fetchStudentProfile = async () => {
    try {
      const res = await Axios.get("/user");
      console.log(res.data);
      setUser(res?.data?.user);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="mb-10 lg:my-10 px-5 lg:mr-12">
      <h2 className="sm:text-3xl text-xl font-semibold">Update Profile Info</h2>
      <div className="divider"></div>
      <form onSubmit={handleUpdateProfile} className="xl:w-1/2 ">
        <div className="grid sm:grid-cols-2 gap-3 lg:gap-6">
          <div className="">
            <label className="block text-sm font-medium leading-6 text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              value={user?.name}
              placeholder="Type here"
              className={`${fixedInputClass} disabled:bg-gray-200 mt-2`}
            />
          </div>
          <div className="">
            <label className="block text-sm font-medium leading-6 text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              value={user?.phone}
              disabled
              placeholder="eg: 01712345678"
              className={`${fixedInputClass} disabled:bg-gray-200 mt-2`}
            />
          </div>
        </div>

        <div className="mt-4 col-span-full flex justify-end">
          <button type="submit" className={`${fixedButtonClass} sm:w-44`}>
            Update Changes
          </button>
        </div>
      </form>
    </div>
  );
}
