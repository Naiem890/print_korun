import React, { useEffect, useState } from "react";
import { Axios } from "../../api/api";
import { toast } from "react-hot-toast";
import Modal from "../Common/Modal";
import {
  DEPARTMENTS,
  fixedButtonClass,
  fixedInputClass,
} from "../../Utils/constant";
import { XCircleIcon } from "@heroicons/react/24/outline";

export const AddPrinterModal = ({
  showAddStudentModal,
  setShowAddStudentModal,
  refetchHandler,
  setRefetchHallIdHandler,
  refetchHallIdHandler,
}) => {
  const [profileImage, setProfileImage] = useState(null);
  const [image, setImage] = useState("");
  const [hallId, setHallId] = useState("");
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  useEffect(() => {
    const getHallId = async () => {
      const response = await Axios.get("/student/hallId");
      setHallId(response.data.hallId);
    };
    getHallId();
  }, [refetchHallIdHandler]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("name", e.target.name.value);
      formData.append("phoneNumber", e.target.phoneNumber.value);
      formData.append("studentId", e.target.studentId.value);
      formData.append("department", e.target.department.value);
      formData.append("batch", e.target.batch.value);
      formData.append("gender", e.target.gender.value);
      formData.append("hallId", e.target.hallId.value);

      const response = await Axios.post("/student/add", formData);

      setShowAddStudentModal(false);
      e.target.reset();
      refetchHandler();
      setRefetchHallIdHandler((prev) => !prev);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <Modal
      setShowAddStudentModal={setShowAddStudentModal}
      className={`${showAddStudentModal ? "" : "hidden"}`}
    >
      <button
        type="button"
        onClick={() => {
          setImage("");
          setProfileImage(null);
          setShowAddStudentModal(false);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <XCircleIcon className="w-8 h-8 hover:text-red-600" />
      </button>
      <h3 className="font-bold text-lg inline-block">Add Printer</h3>
      <div className="divide-2" />
      <form onSubmit={handleAddStudent} className="flex flex-col gap-4 mt-4">
        <div className="">
          <label className="block text-sm font-medium leading-6 text-gray-600">
            Printer Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. HP DeskJet 3630"
            className={`${fixedInputClass} mt-2`}
          />
        </div>

        <div className="">
          <label className="block text-sm font-medium leading-6 text-gray-600">
            Printer Location
          </label>
          <input
            type="text"
            name="location"
            placeholder="e.g. MIST Tower 3, 5th Floor"
            className={`${fixedInputClass} mt-2`}
          />
        </div>
        <div className="">
          <label className="block text-sm font-medium leading-6 text-gray-600">
            Google Map Link (Optional)
          </label>
          <input
            type="text"
            name="googleMapLink"
            placeholder="e.g. https://maps.app.goo.gl/Rj4XVe9tBipr5viR8"
            className={`${fixedInputClass} mt-2`}
          />
        </div>
        <div className="">
          <label className="block text-sm font-medium leading-6 text-gray-600">
            IP Address
          </label>
          <input
            type="text"
            name="piIpAddress"
            placeholder="e.g. 54.209.7.87"
            className={`${fixedInputClass} mt-2`}
          />
        </div>

        <div className="flex gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium leading-6 text-gray-600">
              Color Print / Page
            </label>
            <input
              type="number"
              name="colorPrintPrice"
              placeholder="10"
              min={0}
              className={`${fixedInputClass} mt-2`}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium leading-6 text-gray-600">
              B&W Print / Page
            </label>
            <input
              type="number"
              name="bwPrintPrice"
              placeholder="10"
              min={0}
              className={`${fixedInputClass} mt-2`}
            />
          </div>
        </div>
        <div className="mt-4 col-span-full flex justify-end gap-6">
          <button type="submit" className={`${fixedButtonClass} w-auto`}>
            Add Printer
          </button>
        </div>
      </form>
    </Modal>
  );
};
