import React, { useRef, useEffect, useState } from 'react';
import secondaryLogoWhite from '../assets/Logo/secondary_logo_white.png';
import StickyNavbar from '../components/Navbar';

// Dummy data for orders
const mockOrders = [
  {
    id: 1,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-15',
    status: 'waiting',
  },
  {
    id: 2,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-14',
    status: 'on progress',
  },
  {
    id: 3,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-13',
    status: 'done',
  },
  {
    id: 4,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-12',
    status: 'canceled',
  },
  {
    id: 5,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-11',
    status: 'waiting',
  },
  {
    id: 6,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-10',
    status: 'on progress',
  },
  {
    id: 7,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-09',
    status: 'done',
  },
  {
    id: 8,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-08',
    status: 'canceled',
  },
  {
    id: 9,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-07',
    status: 'waiting',
  },
  {
    id: 10,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-06',
    status: 'on progress',
  },
  {
    id: 11,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-05',
    status: 'done',
  },
  {
    id: 12,
    orderNumber: '12345678910111213',
    poNumber: '12345678910111213',
    product: 'Apparel',
    productType: 'Jaket',
    date: '2024-01-04',
    status: 'canceled',
  }
];

export default function HistoryOrder() {
  const [leftSectionStyle, setLeftSectionStyle] = useState({ position: 'fixed', top: 80 });
  const footerRef = useRef(null);
  const leftSectionRef = useRef(null);
  const [animatePage, setAnimatePage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    function handleScroll() {
      if (!footerRef.current || !leftSectionRef.current) return;
      const leftSectionHeight = leftSectionRef.current.offsetHeight;
      const leftSectionTop = leftSectionRef.current.offsetTop;
      const footerTop = footerRef.current.getBoundingClientRect().top + window.scrollY;
      const leftSectionBottom = window.scrollY + leftSectionTop + leftSectionHeight;
      if (leftSectionBottom >= footerTop) {
        setLeftSectionStyle({
          position: 'absolute',
          top: footerTop - leftSectionHeight - leftSectionTop,
        });
      } else {
        setLeftSectionStyle({ position: 'fixed', top: 80 });
      }
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = mockOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(mockOrders.length / ordersPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waiting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'done':
        return 'Done';
      case 'on progress':
        return 'On Progress';
      case 'waiting':
        return 'Waiting';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <StickyNavbar />
      <div className={`flex flex-row items-start mb-16 bg-white min-h-screen relative transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left Section */}
        <div
          id="left-section"
          ref={leftSectionRef}
          style={{
            position: leftSectionStyle.position,
            top: leftSectionStyle.top,
            left: 0,
            height: leftSectionStyle.position === 'absolute' ? 'calc(100% - 5rem)' : leftSectionStyle.position === 'fixed' ? 'calc(100vh - 5rem)' : 'auto',
            width: '50%',
            zIndex: 10,
            transition: 'top 0.3s, position 0.3s',
            backgroundImage: 'url(https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className={
            'hidden md:flex flex-row items-start rounded-tr-[30px] rounded-br-[30px] px-12 pt-10 relative ' +
            (leftSectionStyle.position === 'fixed' ? ' h-[calc(100vh-5rem)]' : '')
          }
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 rounded-tr-[30px] rounded-br-[30px] z-0" />
          {/* Konten teks di atas overlay */}
          <div className="relative z-10 flex flex-row items-start w-full">
            <img src={secondaryLogoWhite} alt="Zumar Logo" className="w-56 max-w-[220px] flex-shrink-0 mr-10" />
            <div className="flex flex-col justify-center">
              <h1 className="text-white text-5xl font-bold font-poppins leading-[1.1] mb-6 text-left">Riwayat<br />Pesanan<br />Kamu</h1>
              <p className="text-[#D9D9D9] text-base max-w-md font-montserrat text-left">Lihat dan lacak semua pesanan yang pernah kamu buat di sini. Kamu bisa cek status, detail, dan histori pemesananmu.</p>
            </div>
          </div>
        </div>
        {/* Right Section */}
        <div className="flex-1 flex flex-col items-center py-10 px-4 md:px-16 md:ml-[50%]">
          <div className={`w-full max-w-xl px-8 transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}> 
            {currentOrders.map((order) => (
              <div key={order.id} className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="col-span-2">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div className="col-span-2">
                        <p className="text-sm font-semibold text-gray-800">{formatDate(order.date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primaryColor">ORDER NUMBER</p>
                        <p className="text-sm font-semibold text-gray-800">{order.orderNumber}</p>
                        <hr className="border-primaryColor mt-1"/>
                      </div>
                      <div>
                        <p className="text-xs text-primaryColor">PRODUK</p>
                        <p className="text-sm font-semibold text-gray-800">{order.product}</p>
                        <hr className="border-primaryColor mt-1"/>
                      </div>
                      <div>
                        <p className="text-xs text-primaryColor">PO NUMBER</p>
                        <p className="text-sm font-semibold text-gray-800">{order.poNumber}</p>
                        <hr className="border-primaryColor mt-1"/>
                      </div>
                      <div>
                        <p className="text-xs text-primaryColor">JENIS PRODUK</p>
                        <p className="text-sm font-semibold text-gray-800">{order.productType}</p>
                        <hr className="border-primaryColor mt-1"/>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-start md:justify-center items-center mt-4 md:mt-0 gap-3">
                    <button className="bg-primaryColor text-white py-2 px-8 rounded-lg shadow-md hover:bg-[#083540] transition-colors">
                      Detail
                    </button>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border text-primaryColor border-primaryColor disabled:opacity-50"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-primaryColor text-white border-primaryColor' : 'text-primaryColor border-primaryColor'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border text-primaryColor border-primaryColor disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 