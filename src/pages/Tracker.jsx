import React, { useState, useEffect } from 'react';
import StickyNavbar from '../components/Navbar';
import Footer from '../components/Footer';

const DUMMY_ORDER_NUMBER = '12345678910AB';

const initialSizes = [
  { label: 'S', value: 12 },
  { label: 'M', value: 2 },
  { label: 'L', value: 6 },
  { label: 'XL', value: 0 },
  { label: 'XXL', value: 4 },
  { label: 'XXXL', value: 0 },
  { label: '4XL', value: 0 },
  { label: '5XL', value: 0 },
  { label: '6XL', value: 0 },
];

const uploads = [
  { id: 1, name: 'Upload 1', url: '#' },
  { id: 2, name: 'Upload 2', url: '#' },
  { id: 3, name: 'Upload 3', url: '#' },
];

const Tracker = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState('');
  const [animatePage, setAnimatePage] = useState(false);
  const [animateResult, setAnimateResult] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSearch = () => {
    if (orderNumber === DUMMY_ORDER_NUMBER) {
      setShowProgress(true);
      setError('');
      setTimeout(() => setAnimateResult(true), 50);
      setProgress(0);
    } else {
      setShowProgress(false);
      setError('Order Number not found. Please try again.');
      setAnimateResult(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  useEffect(() => {
    let interval;
    if (showProgress) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 15) {
            const next = prev + (prev < 10 ? 0.3 : 0.15);
            return Math.min(next, 15);
          } else {
            clearInterval(interval);
            return 15;
          }
        });
      }, 5);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [showProgress]);

  return (
      <div className="flex flex-col min-h-screen" style={{
        backgroundImage: "url('/src/assets/background-image/logobg-zumar.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
      }}
      >
      <StickyNavbar />
      <main className={`flex-grow flex flex-col items-center justify-center p-4 transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-2xl text-center mb-8">
          <h1 className="text-2xl text-gray-600 font-montserrat mb-4">
            Please insert your Order Number
          </h1>
          <div className="flex w-full max-w-md mx-auto shadow-md rounded-full overflow-hidden">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="12345678910AB"
              className="w-full px-6 py-3 text-gray-700 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-primaryColor text-white font-semibold px-8 py-3 hover:bg-secondaryColor transition-colors"
            >
              Search
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {showProgress && (
          <div className={`w-full max-w-md bg-gray-200 p-8 rounded-2xl shadow-lg transition-all duration-700
            ${animateResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex justify-center mb-8">
              <span className="bg-secondaryColor text-white text-sm font-semibold rounded-full px-6 py-2 shadow">
                On Progress
              </span>
            </div>

            <div className="mb-8">
              <div className="relative h-6 w-full bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primaryColor rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                >
                  {progress.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="space-y-6 font-montserrat">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Produk</label>
                <p className="w-full border-b border-gray-300 py-2 text-sm">Apparel</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Jenis Produk</label>
                <p className="w-full border-b border-gray-300 py-2 text-sm">Kemeja</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bahan</label>
                <p className="w-full border-b border-gray-300 py-2 text-sm">American Drill</p>
              </div>

              {/* Size Selector */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {initialSizes.map((size) => (
                  <div
                    key={size.label}
                    className={`flex w-full h-12 rounded border text-xs font-semibold overflow-hidden border-primaryColor bg-gray-100`}
                  >
                    <span
                      className={`flex items-center justify-center w-1/2 h-full ${size.value > 0 ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-400'}`}
                    >
                      {size.label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={size.value}
                      disabled
                      className={`flex items-center justify-center w-1/2 h-full text-primaryColor text-center outline-none border-0 appearance-none bg-gray-100 ${size.value === 0 ? 'text-gray-400' : ''}`}
                      style={{ MozAppearance: 'textfield' }}
                    />
                  </div>
                ))}
              </div>

              {/* Nomor POS */}
              <div className="mt-6">
                <label className="block text-xs text-gray-500 mb-1">Nomor POS</label>
                <p className="w-full border-b border-gray-300 py-2 text-sm">-</p>
              </div>

              {/* Designs / Mock Ups */}
              <div className="mt-6">
                <h3 className="text-center text-gray-600 font-bold text-sm mb-2 tracking-wider">DESIGNS / MOCK UPS</h3>
                <div className="flex flex-col gap-2 items-center">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium w-20 text-right">{upload.name}</span>
                      <a href={upload.url} className="text-secondaryColor font-semibold hover:underline ml-2">See</a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="mt-6 flex justify-center">
                <div className="border border-primaryColor rounded-md p-4 w-full text-xs text-gray-600 bg-gray-100">
                  Lorem ipsum dolor sit amet consectetur. Ac adipiscing elit justo morbi sapien habitant quisque. Nisi sem et facilisi arcu malesuada leo et duis nisl. Quis suscipit suspendisse nulla habitasse congue sed curabitur consectetur faucibus. Quis ac vel odio lectus. Molestie nullam risus vivamus felis. Nunc condimentum magnis sit sed cras arcu. Morbi est ac dignissim augue iaculis sagittis eleifend.
                </div>
              </div>

              {/* Nama */}
              <div className="mt-6">
                <label className="block text-xs text-gray-500 mb-1">Nama</label>
                <p className="w-full border-b border-gray-300 py-2 text-sm">User name</p>
              </div>
              {/* Nomor Telepon */}
              <div className="mt-6">
                <label className="block text-xs text-gray-500 mb-1">Nomor Telepon</label>
                <p className="w-full border-b border-gray-300 py-2 text-sm">081 123 456 789</p>
              </div>
              {/* Alamat Pengiriman */}
              <div className="mt-6">
                <label className="block text-xs text-gray-500 mb-1">Alamat Pengiriman</label>
                <p className="w-full border-b border-gray-300 py-2 text-sm">Jl. Blimbingham No.12</p>
              </div>

              {/* Tombol Print */}
              <div className="mt-8 flex justify-center">
                <button
                  className="flex items-center gap-2 bg-primaryColor text-white font-semibold px-6 py-2 rounded shadow hover:bg-secondaryColor transition-colors"
                  onClick={() => window.print()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-6 0v4m0 0h4m-4 0H8" /></svg>
                  Print
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Tracker;
