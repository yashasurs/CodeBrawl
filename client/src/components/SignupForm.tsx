"use client";
import React from 'react';
import Image from 'next/image';

export default function SignupForm() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center mb-4">
        <div className="mb-4">
          <Image 
            src="/logo.svg" 
            alt="CodeBrawl Logo" 
            width={80} 
            height={80}
            className="mx-auto drop-shadow-lg animate-pulse"
          />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
          Join CodeBrawl
        </h1>
        <p className="text-lg text-purple-300/80 font-light tracking-wide">
          Create your <span className="text-purple-400 font-semibold">CodeBrawl</span> account
        </p>
      </div>
      {/* From Uiverse.io by micaelgomestavares */}
      <div className="bg-gray-900/70 backdrop-blur-sm p-8 rounded-3xl shadow-lg w-full max-w-lg border border-purple-600">
        <form className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-purple-300 font-semibold mb-2">Full Name</label>
            <div className="border-2 border-purple-500 bg-gray-800 rounded-xl h-12 flex items-center px-3 transition-colors focus-within:border-purple-400">
              <svg height={20} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
                <path fill="#a855f7" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <input 
                type="text" 
                className="ml-3 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-purple-200 placeholder-purple-400" 
                placeholder="Enter your full name" 
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-purple-300 font-semibold mb-2">Email</label>
            <div className="border-2 border-purple-500 bg-gray-800 rounded-xl h-12 flex items-center px-3 transition-colors focus-within:border-purple-400">
              <svg height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg">
                <g id="Layer_3" data-name="Layer 3">
                  <path fill="#a855f7" d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
                </g>
              </svg>
              <input 
                type="email" 
                className="ml-3 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-purple-200 placeholder-purple-400" 
                placeholder="Enter your email" 
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-purple-300 font-semibold mb-2">LeetCode Username</label>
            <div className="border-2 border-purple-500 bg-gray-800 rounded-xl h-12 flex items-center px-3 transition-colors focus-within:border-purple-400">
              <svg height={20} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
                <path fill="#a855f7" d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.818 2.133 8.022-.074l2.957-2.957A1.375 1.375 0 0 0 17.5 15.5L15.544 17.456a2.542 2.542 0 0 1-3.804-.032L7.462 13.15a2.543 2.543 0 0 1-.032-3.804L9.388 7.388a2.542 2.542 0 0 1 3.804.032l4.278 4.274a2.543 2.543 0 0 1 .032 3.804L15.544 17.456a1.375 1.375 0 0 0 1.956 1.956l1.958-1.956c2.207-2.206 2.239-5.777.074-8.022L15.255 5.157a5.828 5.828 0 0 0-1.818-1.271 5.938 5.938 0 0 0-1.017-.349 5.527 5.527 0 0 0-2.362-.062 5.35 5.35 0 0 0-.513.125 5.266 5.266 0 0 0-2.104 1.209L3.315 8.935a1.374 1.374 0 0 0 1.956 1.956L9.388 6.774a2.542 2.542 0 0 1 3.804.032l4.278 4.274a2.543 2.543 0 0 1 .032 3.804l-1.958 1.956a1.375 1.375 0 0 0 1.956 1.956l1.958-1.956c2.207-2.206 2.239-5.777.074-8.022z"/>
              </svg>
              <input 
                type="text" 
                className="ml-3 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-purple-200 placeholder-purple-400" 
                placeholder="leetcode username" 
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-purple-300 font-semibold mb-2">Password</label>
            <div className="border-2 border-purple-500 bg-gray-800 rounded-xl h-12 flex items-center px-3 transition-colors focus-within:border-purple-400">
              <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg">
                <path fill="#a855f7" d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                <path fill="#a855f7" d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
              </svg>
              <input 
                type="password" 
                className="ml-3 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-purple-200 placeholder-purple-400" 
                placeholder="Create a password" 
              />
              <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                <path fill="#a855f7" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-purple-300 font-semibold mb-2">Confirm Password</label>
            <div className="border-2 border-purple-500 bg-gray-800 rounded-xl h-12 flex items-center px-3 transition-colors focus-within:border-purple-400">
              <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg">
                <path fill="#a855f7" d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                <path fill="#a855f7" d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
              </svg>
              <input 
                type="password" 
                className="ml-3 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-purple-200 placeholder-purple-400" 
                placeholder="Confirm your password" 
              />
              <svg height={20} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
                <path fill="#a855f7" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between gap-4 my-2">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2 accent-purple-500" />
              <label className="text-sm text-purple-300">I agree to the Terms & Conditions</label>
            </div>
          </div>

          <button 
            type="submit"
            className="mt-4 mb-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl h-12 w-full cursor-pointer transition-colors"
          >
            Create Account
          </button>

          <p className="text-center text-purple-300 text-sm my-2">
            Already have an account? <span className="text-purple-400 font-medium cursor-pointer hover:text-purple-200">Sign In</span>
          </p>
          
          <p className="text-center text-purple-300 text-sm my-2">Or Sign Up With</p>

          <div className="flex flex-col gap-2">
            <button 
              type="button"
              className="w-full h-12 rounded-xl flex justify-center items-center font-medium gap-3 border border-purple-500 bg-gray-800 text-purple-300 cursor-pointer transition-colors hover:border-purple-400 hover:bg-gray-700"
            >
              <svg version="1.1" width={20} id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve">
                <path style={{fill: '#FBBB00'}} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z" />
                <path style={{fill: '#518EF8'}} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" />
                <path style={{fill: '#28B446'}} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" />
                <path style={{fill: '#F14336'}} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z" />
              </svg>
              Google
            </button>
            
            <button 
              type="button"
              className="w-full h-12 rounded-xl flex justify-center items-center font-medium gap-3 border border-purple-500 bg-gray-800 text-purple-300 cursor-pointer transition-colors hover:border-purple-400 hover:bg-gray-700"
            >
              <svg height={20} width={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#a855f7" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
