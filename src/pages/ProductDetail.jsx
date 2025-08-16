import React, { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import BackToTopButton from "../components/BackToTopButton";
import StickyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { getCatalogueProductById } from "../api/Catalogue/catalogue";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animatePage, setAnimatePage] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID produk tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCatalogueProductById(id);
        const productData = response.data.data;
        
        if (!productData) {
          setError('Produk tidak ditemukan');
          setLoading(false);
          return;
        }

        setProduct(productData);
        
        // Set main image to first image if available
        if (productData.cpImage && productData.cpImage.length > 0) {
          setMainImage(productData.cpImage[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Gagal memuat data produk');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  // Handle mouse move for zoom effect
  const handleMouseMove = (e) => {
    if (!mainImage) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    setZoomPosition({ x, y });
  };

  // Get product images for gallery
  const productImages = product && product.cpImage && product.cpImage.length > 0 
    ? product.cpImage 
    : [];

  if (loading) {
    return (
      <>
        <StickyNavbar />
        <div className="min-h-screen bg-gray-100 font-montserrat py-8 px-4 md:px-12 lg:px-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-primaryColor font-semibold mb-2">Loading...</div>
            <div className="text-gray-500">Memuat detail produk</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <StickyNavbar />
        <div className="min-h-screen bg-gray-100 font-montserrat py-8 px-4 md:px-12 lg:px-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-red-500 font-semibold mb-2">Error</div>
            <div className="text-gray-500">{error || 'Produk tidak ditemukan'}</div>
            <button 
              onClick={() => navigate("/catalog")}
              className="mt-4 px-6 py-2 bg-primaryColor text-white rounded-lg hover:bg-secondaryColor transition-colors"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <StickyNavbar />
      <div
        className={`min-h-screen bg-gray-100 font-montserrat py-8 px-4 md:px-12 lg:px-24 flex flex-col transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: "url('/src/assets/background-image/logobg-zumar.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '1000px auto',
          backgroundPosition: 'center',
          opacity: 1
        }}
      >
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto">
          {/* Left: Info */}
          <div className={`flex-1 flex flex-col justify-start transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-2 mb-4 w-fit">
              <button className="text-secondaryColor font-bold text-lg p-0" onClick={() => navigate("/catalog")}> 
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-primaryColor">{product.cpName}</h1>
            </div>
            <h2 className="text-lg font-bold text-primaryColor mb-2 tracking-wide">PRODUCT DESCRIPTION</h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-4 max-w-md">
              {product.cpDescription || 'Deskripsi produk tidak tersedia'}
            </p>
            <div className="mt-4">
              <span className="text-primaryColor font-semibold cursor-pointer hover:underline">Informasi Produk</span>
              <p className="text-gray-400 text-sm mt-1">Kategori: {product.ccName || 'Tidak tersedia'}</p>
              <p className="text-gray-400 text-sm">Sub Kategori: {product.csName || 'Tidak tersedia'}</p>
            </div>
          </div>
          {/* Right: Image Gallery with Zoom */}
          <div className={`flex-1 flex justify-center items-center transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col md:flex-row w-full max-w-md items-center">
              <div className="relative w-full md:w-4/5">
                {/* Main Image Container */}
                <div 
                  className="rounded-2xl overflow-hidden shadow-md aspect-square bg-gray-100 flex items-center justify-center relative cursor-zoom-in"
                  onMouseEnter={() => setShowZoom(true)}
                  onMouseLeave={() => setShowZoom(false)}
                  onMouseMove={handleMouseMove}
                >
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.cpName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <div className="text-lg font-semibold mb-2">Tidak ada gambar</div>
                      <div className="text-sm">Gambar produk tidak tersedia</div>
                    </div>
                  )}
                  
                  {/* Magnifying Glass Overlay */}
                  {showZoom && mainImage && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle 80px at ${zoomPosition.x}% ${zoomPosition.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 40%, transparent 60%)`
                      }}
                    />
                  )}
                  
                  {/* Zoomed Image Overlay */}
                  {showZoom && mainImage && (
                    <div 
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{
                        background: `radial-gradient(circle 80px at ${zoomPosition.x}% ${zoomPosition.y}%, transparent 0%, transparent 40%, rgba(0,0,0,0.1) 60%)`
                      }}
                    >
                      <img
                        src={mainImage}
                        alt={product.cpName}
                        className="object-cover w-full h-full"
                        style={{
                          transform: `scale(2.5)`,
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {productImages.length > 1 && (
                <div className="flex md:flex-col flex-row gap-3 md:ml-4 mt-4 md:mt-0 md:w-1/5 w-full justify-center items-center">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`rounded-lg overflow-hidden border-2 ${mainImage === img ? 'border-secondaryColor' : 'border-transparent'} w-16 h-16 focus:outline-none`}
                    >
                      <img src={img} alt={`${product.cpName} ${idx + 1}`} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* BackToTopButton */}
        <div className="fixed bottom-8 right-8 z-50">
          <BackToTopButton />
        </div>
      </div>
      <Footer />
    </>
  );
} 