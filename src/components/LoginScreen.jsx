import React from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from '../firebase';

const LoginScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1C1C1E] rounded-[40px] p-8 md:p-10 border border-[#333] text-center shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
            <span className="text-white font-black text-xl md:text-2xl">S</span>
          </div>
          <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            SubDay
          </span>
          <span className="text-transparent bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text font-light">
            Pro
          </span>
        </h1>
        
        <button 
          onClick={() => signInWithPopup(auth, googleProvider)} 
          className="w-full bg-white text-black py-4 md:py-5 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
