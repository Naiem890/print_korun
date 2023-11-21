/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from "react";
import { Axios } from "../../api/api";
import { toast } from "react-hot-toast";
import Modal from "../Common/Modal";
import {
  DEPARTMENTS,
  fixedButtonClass,
  fixedInputClass,
} from "../../Utils/constant";
import { XCircleIcon } from "@heroicons/react/24/outline";

export const EditPrinterModal = ({
  showModal,
  setShowModal,
  printerIoT,
  setPrinterIoT,
  refetchHandler,
}) => {
  console.log("printerIoT", printerIoT);

  const [name, setName] = useState(printerIoT?.name);
  const [location, setLocation] = useState(printerIoT?.location);
  const [googleMapLink, setGoogleMapLink] = useState(printerIoT?.googleMapLink);
  const [ip, setIp] = useState(printerIoT?.ip);
  const [colorPrintPrice, setColorPrintPrice] = useState(
    printerIoT?.colorPrintPrice || 0
  );

  useEffect(() => {
    // Update the state when printerIoT changes
    setName(printerIoT?.name || "");
    setLocation(printerIoT?.location || "");
    setGoogleMapLink(printerIoT?.googleMapLink || "");
    setIp(printerIoT?.ip || "");
    setColorPrintPrice(printerIoT?.colorPrintPrice || 0);
    setBWPrintPrice(printerIoT?.BWPrintPrice || 0);
    // console.log(name,location,googleMapLink,ip,colorPrintPrice,BWPrintPrice,"shovo");
  }, [printerIoT]);

  const [BWPrintPrice, setBWPrintPrice] = useState(
    printerIoT?.BWPrintPrice || 0
  );

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleUpdatePrintIoT = async (e) => {
    e.preventDefault();
  
    try {
      // Send a PUT request to update the printerIoT
      const updatedPrinter = await Axios.put(
        `/printerIoT/${printerIoT._id}`,
        {
          name,
          location,
          googleMapLink,
          ip,
          colorPrintPrice,
          BWPrintPrice,
        }
      );
  
      // Update the local state with the updated printerIoT
      setPrinterIoT(updatedPrinter.data.printerIoT);
      console.log(name,location);
      // Display a success message
      toast.success("Printer updated successfully!");
      refetchHandler();
      // Close the modal
      setShowModal(false);
    } catch (error) {
      console.error("Error updating printer:", error);
  
      // Display an error message
      toast.error("Failed to update printer. Please try again.");
    }
  };
  

  return (
    <Modal
      setShowModal={setShowModal}
      className={`${showModal ? "" : "hidden"}`}
    >
      <button
        type="button"
        onClick={() => {
          setShowModal(false);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <XCircleIcon className="w-8 h-8 hover:text-red-600" />
      </button>
      <h3 className="font-bold text-lg inline-block">Edit Printer</h3>
      <div className="divide-2" />
      <form
        onSubmit={handleUpdatePrintIoT}
        className="flex flex-col gap-4 mt-4"
      >
        <div className="">
          <label className="block text-sm font-medium leading-6 text-gray-600">
            Printer Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. HP DeskJet 3630"
            className={`${fixedInputClass} mt-2`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="">
          <label className="block text-sm font-medium leading-6 text-gray-600">
            Printer Location
          </label>
          <input
            type="text"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            value={googleMapLink}
            onChange={(e) => setGoogleMapLink(e.target.value)}
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
            name="ip"
            placeholder="e.g. 54.209.7.87"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
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
              value={colorPrintPrice}
              onChange={(e) => setColorPrintPrice(e.target.value)}
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
              name="BWPrintPrice"
              placeholder="10"
              value={BWPrintPrice}
              onChange={(e) => setBWPrintPrice(e.target.value)}
              min={0}
              className={`${fixedInputClass} mt-2`}
            />
          </div>
        </div>
        <p className="text-sm text-info">
          💡 Keep relevant print service empty or 0 if the printer doesn't
          support it.
        </p>
        <div className="mt-4 col-span-full flex justify-end gap-6">
          <button type="submit" className={`${fixedButtonClass} w-auto`}>
            Edit Printer
          </button>
        </div>
      </form>
    </Modal>
  );
};
