import React, { useState } from "react";
import { motion } from "motion/react";
import { User, LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { SiGoogle } from "react-icons/si";import { Link } from "react-router-dom";
                                                                                                                                                                                                                         ;

// WRAPPER (User icon trigger)
export const UserAccountOverlayWrapper = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOverlayOpen(true)}
        aria-label="Compte"
        className="hover:text-[#007B8A] transition-colors duration-300"
      >
        <User size={22} />
      </button>

      {isOverlayOpen &&
        createPortal(
          <Account onClose={() => setIsOverlayOpen(false)} />,
          document.body
        )}
    </>
  );
};

// ACCOUNT PANEL
interface AccountProps {
  onClose: () => void;
}

export const Account = ({ onClose }: AccountProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ email: "", password: "" });
  };

  // INFO BLOCK
  const MyLVInfo = () => (
    <div className=" mt-8 py-8 px-8 bg-gray-100 style-none rounded-md text-sm text-gray-700 space-y-2">
      <p className="font-medium text-xs">What you will find in your MyLV account:</p>
      <ul className="list-disc list-inside space-y-2 pl-8">
        <li className=" py-2 text-xs" >Access your order history</li>
        <li className="border-t border-gray-200 py-2 text-xs" >Manage your personal information</li>
        <li className="border-t border-gray-200 py-2 text-xs" >Receive Louis Vuitton's digital communications</li>
        <li className="border-t border-gray-200 py-2 text-xs" >Register your wishlist</li>
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Sliding Panel */}
      <motion.div
        className="ml-auto relative bg-white w-full md:w-1/2 lg:w-1/2 h-full py-6 pt-10    overflow-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 md:px-16 lg:px-32">{isLoggedIn ? (
          // ------------------------------------------------------------------
          // LOGGED IN
          // ------------------------------------------------------------------
          <div className="min-h-full flex  flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">MON COMPTE</h2>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-[#007B8A] transition-colors"
              >
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </div>

            <p className="text-gray-600">
              Bienvenue dans votre espace personnel.
            </p>
          </div>
        ) : (
          // ------------------------------------------------------------------
          // LOGIN ONLY (NO SIGNUP TAB, NO MULTIPLE SECTIONS)
          // ------------------------------------------------------------------
          <div>
            {/* Close Button */}

           {onClose && (
          <button
            onClick={onClose}
            className="absolute right-8 top-8 text-gray-500 hover:text-black transition"
          >
            ✕
          </button>
        )}
            <h2 className="t font-medium text-sm py-6">Identification</h2>
            

            <p className="py-6 font-medium text-xs">I already have an account.</p>

            {/* Google Login */}
            <button className="w-full bg-gray-100 py-4 rounded-3xl flex text-sm items-center justify-center gap-2 hover:bg-gray-200 transition mb-4">
              <SiGoogle size={22} />
              Sign In With Google
            </button>

            <div className="flex items-center my-4">
              <span className="flex-1 border-b border-gray-300" />
              <span className="px-2 my-6 text-gray-500">OR</span>
              <span className="flex-1 border-b border-gray-300" />
            </div>

            <form onSubmit={handleLogin} >
              <p className="font-regular flex justify-end text-xs ">Required Fields*</p>
              <p className="font-regular pb-2 text-xs ">login*</p>
              <input
                type="email"
                placeholder="Login*"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full border border-gray-300 px-4 py-3 mb-6 rounded-md focus:border-[#007B8A]"
                required
              />
              <p className="font-regular pb-2 text-xs ">Password*</p>
              <input
                type="password"
                placeholder="Password*"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full border border-gray-300 px-4 py-3  rounded-md focus:border-[#007B8A]"
                required
              />

              

              <button
                type="button"
                className="text-[#007B8A] hover:underline mb-4 text-xs"
              >
                Forgot your password?
              </button>

              <p className="text-sm text-gray-500 mt-2">
                Or use a one-time login link to sign in. Email me the link.
              </p>
            </form>
            <button
                type="submit"
                className="w-full bg-[#000000] text-md text-white py-3 my-4 rounded-3xl hover:bg-[#006170]"
              >
                Sign In
              </button>

            {/* LOWER SECTION */}
          </div>  
        )}</div>
        <div className="mt-8 border-t border-gray-200 pt-6 ">
        <div className="px-8 md:px-16 lg:px-32">
              <p className="font-medium text-md my-6">I do not have an account.</p>
              <p className="text-gray-500 font-medium text-xs mb-6">
                Access your MyLV account to discover your wishlist and order
                history.
              </p>
              <Link to="/compte" onClick={onClose}>
              <button className="w-full border-2 border-[#007B8A]  py-2 rounded-3xl hover:bg-[#f0fafa] transition">
                Create a my Account
              </button></Link>

              
            </div>
          </div>
          <div className="block md:hidden">
                <MyLVInfo />
              </div>
      </motion.div>
    </div>
  );
};                                                                                                                                                                         