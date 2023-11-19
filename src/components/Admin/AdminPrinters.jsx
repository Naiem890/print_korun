import {
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  DEPARTMENTS,
  fixedButtonClass,
  fixedInputClass,
} from "../../Utils/constant";
import { Axios } from "../../api/api";
import { EditPrinterModal } from "./EditPrinterModal";
import { AddPrinterModal } from "./AddPrinterModal";

export const AdminPrinters = () => {
  const [printerIoTs, setPrinterIoTs] = useState([]);
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [refetchHallIdHandler, setRefetchHallIdHandler] = useState(false);

  useEffect(() => {
    fetchPrinterIoT();

    async function fetchPrinterIoT() {
      const result = await Axios.get("/printerIoT/all");
      console.log("printers", result.data);
      setPrinterIoTs(result.data.printerIoTs);
    }
  }, [refetch]);

  const refetchHandler = () => {
    setRefetch((prev) => !prev);
  };

  const handleEditAccount = (student) => {
    setShowModal(true);
    setStudent(student);
  };

  const handleAddAccount = () => {
    setShowAddStudentModal(true);
  };

  return (
    <div className="lg:my-10 mb-10 px-5 lg:mr-12">
      <h2 className="sm:text-3xl text-xl font-semibold"> Printers</h2>
      <div className="divider"></div>
      <div className="flex justify-between items-center mb-6 gap-12">
        <div className="">
          <h3 className="text-xl font-semibold mr-4 basis-1/3">
            Total Printers: {printerIoTs.length}
          </h3>
        </div>
        <div className="flex gap-2 basis-2/3">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`${fixedInputClass} h-auto basis-1/4`}
          >
            <option selected value="">
              Gender
            </option>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
          </select>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={`${fixedInputClass} h-auto basis-1/4`}
          >
            <option selected value="">
              Departments
            </option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name, Roll, Hall ID"
            className={`${fixedInputClass} h-auto basis-2/4`}
          />
          <button
            onClick={() => {
              handleAddAccount();
            }}
            className={`${fixedButtonClass} btn-sm h-auto basis-40 ml-2`}
          >
            <PlusIcon className="w-4 h-4" /> Add Printer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {printerIoTs.map((printerIoT) => (
          <div
            key={printerIoT._id}
            className="max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg mb-4"
          >
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                {/* <img
                  className="h-48 w-full object-cover md:w-48"
                  src="your-image-source.jpg" // Replace with actual image source
                  alt="Printer Image"
                /> */}
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                  {printerIoT.name}
                </div>
                <p className="block mt-1 text-lg leading-tight font-semibold text-gray-900">
                  {printerIoT.location}
                </p>
                <p className="mt-2 text-gray-600">{`IP Address: ${printerIoT.ip}`}</p>
                <p className="mt-2 text-gray-600">{`Status: ${printerIoT.status}`}</p>
                <p className="mt-2 text-gray-600">{`Color Print Price: ${printerIoT.colorPrintPrice}`}</p>
                <p className="mt-2 text-gray-600">{`B&W Print Price: ${printerIoT.BWPrintPrice}`}</p>
                {printerIoT.googleMapLink && (
                  <a
                    href={printerIoT.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-indigo-500 hover:text-indigo-600"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddPrinterModal
        showAddStudentModal={showAddStudentModal}
        setShowAddStudentModal={setShowAddStudentModal}
        refetchHandler={refetchHandler}
        setRefetchHallIdHandler={setRefetchHallIdHandler}
        refetchHallIdHandler={refetchHallIdHandler}
      />
      <EditPrinterModal
        showModal={showModal}
        setShowModal={setShowModal}
        student={student}
        // setStudents={setStudents}
        setStudent={setStudent}
      />
    </div>
  );
};
