import { useState } from "react";
import api from "../services/api";

function Register({ openLogin }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async () => {

    setMessage("");
    setLoading(true);

    try {

      const response = await api.post(
        "/auth/register",
        {
          name,
          email,
          password
        }
      );

      if (response.data.message === "User registered successfully") {
        localStorage.setItem(
          `userName_${email}`,
          name
        );
      }

      setIsError(response.data.message !== "User registered successfully");
      setMessage(response.data.message || "Registration completed.");

      console.log(response.data);

    } catch (error) {

      setIsError(true);
      setMessage("Registration failed. Please try again.");

      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 flex items-center justify-center">

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-slate-200 p-6 sm:p-8">

        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Document Signature App
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2">
            Register to start uploading and signing PDF documents.
          </p>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-2">
          Full Name
        </label>

        <input
          className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">
          Email Address
        </label>

        <input
          className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">
          Password
        </label>

        <input
          className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {
          message && (
            <p className={`mt-4 rounded-md px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
              {message}
            </p>
          )
        }

        <button
          className="w-full mt-6 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          onClick={register}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already registered?{" "}
          <button
            className="font-semibold text-blue-600 hover:text-blue-700"
            onClick={openLogin}
          >
            Login
          </button>
        </p>

      </div>

    </div>
  );
}

export default Register;
