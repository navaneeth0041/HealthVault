import React, { useState } from "react";
import "./form.css";
import { submitRecord } from "../../store/interactions";
import { useDispatch, useSelector } from "react-redux";

const Form = () => {
  const provider = useSelector((state) => state.provider.connection);
  const medical = useSelector((state) => state.medical.contract);
  const account = useSelector((state) => state.provider.account);
  const dispatch = useDispatch();



  const submitHandler = (e) => {
    e.preventDefault();
    submitRecord(
      name,
      age,
      gender,
      address,
      bloodType,
      allergies,
      diagnosis,
      treatment,
      provider,
      medical,
      dispatch,
    );
    setName("");
    setAge("");
    setGender("");
    setAddress("");
    setBloodType("");
    setAllergies("");
    setDiagnosis("");
    setTreatment("");
    setStep(1)
  };
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  return (
    <div className="form-container">
      {account ? (
        <form onSubmit={submitHandler}>
          <h1>Patient Details</h1>

          <div className={`step ${step === 1 ? "active" : ""}`}>
            <h2>Step 1: Personal Information</h2>
            <label htmlFor="name">Patient Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Aman Dhattarwal"
            />

            <div className="form-row">
              <div>
                <label htmlFor="age">Age:</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  placeholder="29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="gender">Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  onChange={(e) => setGender(e.target.value)}
                  value={gender}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="123 Main St"
            />
          </div>

          <div className={`step ${step === 2 ? "active" : ""}`}>
            <h2>Step 2: Medical Details</h2>
            <label htmlFor="bloodType">Blood Type:</label>
            <input
              type="text"
              id="bloodType"
              name="bloodType"
              required
              placeholder="B positive"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
            />

            <label htmlFor="allergies">Allergies:</label>
            <textarea
              id="allergies"
              name="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              required
              placeholder="Pollen allergy"
            ></textarea>

            <label htmlFor="diagnosis">Diagnosis:</label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              placeholder="Osteoporosis"
            ></textarea>

            <label htmlFor="treatment">Treatment:</label>
            <textarea
              id="treatment"
              name="treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              required
              placeholder="Surgery"
            ></textarea>
          </div>

          <div className="form-navigation">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}>
                Previous
              </button>
            )}
            {step < 2 ? (
              <button type="button" onClick={() => setStep(step + 1)}>
                Next
              </button>
            ) : (
              <input type="submit" value="Submit" />
            )}
          </div>
        </form>
      ) : (
        <h1>Please connect your account to continue</h1>
      )}
    </div>
  );
};

export default Form;
