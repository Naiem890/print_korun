/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Axios } from "../../api/api";
import { toast } from "react-hot-toast";
import Modal from "../Common/Modal";
import {
  DEPARTMENTS,
  fixedButtonClass,
  fixedInputClass,
} from "../../Utils/constant";
import { XCircleIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";

export const AddPrinterModal = ({
  showAddPrintIoTModal,
  setShowAddPrintIoTModal,
  refetchHandler,
}) => {
  const handleAddPrinter = async (e) => {
    e.preventDefault();

    // Fetch values from the form directly
    const name = e.target.elements.name.value;
    const location = e.target.elements.location.value;
    const googleMapLink = e.target.elements.googleMapLink.value || "";
    const ip = e.target.elements.piIpAddress.value;
    const colorPrintPrice = e.target.elements.colorPrintPrice.value || 0;
    const BWPrintPrice = e.target.elements.bwPrintPrice.value || 0;

    try {
      // Make a POST request to your API endpoint
      const response = await Axios.post("/printerIoT", {
        name,
        location,
        googleMapLink,
        ip,
        colorPrintPrice,
        BWPrintPrice,
      });

      // Show success toast
      toast.success(response.data.message);

      // Close the modal
      setShowAddPrintIoTModal(false);

      // You might want to trigger a refetch or update state here if needed
      refetchHandler();
    } catch (error) {
      // Show error toast
      toast.error(error.response.data.error);
    }
  };

  return (
    <Modal
      setShowAddPrintIoTModal={setShowAddPrintIoTModal}
      className={`${showAddPrintIoTModal ? "" : "hidden"}`}
    >
      <button
        type="button"
        onClick={() => {
          setShowAddPrintIoTModal(false);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <XCircleIcon className="w-8 h-8 hover:text-red-600" />
      </button>
      <h3 className="font-bold text-lg inline-block">Add Printer</h3>
      <div className="divide-2" />
      <form onSubmit={handleAddPrinter} className="flex flex-col gap-4 mt-4">
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
        <p className="text-sm text-info">
          💡 Keep relevant print service empty or 0 if printer doesn't support
          it.
        </p>
        <div className="mt-4 col-span-full flex justify-end gap-6">
          <button type="submit" className={`${fixedButtonClass} w-auto`}>
            Add Printer
          </button>
        </div>
      </form>
    </Modal>
  );
};
