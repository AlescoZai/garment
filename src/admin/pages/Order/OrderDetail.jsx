import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon, UserIcon, PhoneIcon, MapPinIcon, DocumentTextIcon, CalendarDaysIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { getOrderDetail, getOrderItemSizes, getOrderProgressDetail } from '../../../api/Order/order';

const OrderDetail = () => {
  const { oId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderProgress, setOrderProgress] = useState([]);
  
  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch all order data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!oId) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Fetch 3 APIs in parallel
        const [detailRes, itemsRes, progressRes] = await Promise.all([
          getOrderDetail(oId),
          getOrderItemSizes(oId),
          getOrderProgressDetail(oId).catch((err) => {
            console.log('Order Progress API Error:', err);
            return { data: { data: [] } };
          }) // Optional API
        ]);

        console.log('Order Detail Response:', detailRes);
        console.log('Order Items Response:', itemsRes);
        console.log('Order Progress Response:', progressRes);

        // Set order basic data
        if (detailRes.data && detailRes.data.data) {
          setOrderData(detailRes.data.data);
        }

        // Set order items data
        if (itemsRes.data && itemsRes.data.data) {
          const itemsData = Array.isArray(itemsRes.data.data.listData) ? itemsRes.data.data.listData : itemsRes.data.data;
          setOrderItems(Array.isArray(itemsData) ? itemsData : []);
        }

        // Set order progress data (optional)
        if (progressRes.data && progressRes.data.data) {
          const progressData = Array.isArray(progressRes.data.data.listData) ? progressRes.data.data.listData : progressRes.data.data;
          setOrderProgress(Array.isArray(progressData) ? progressData : []);
        }

      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Gagal memuat data detail pesanan');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [oId]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getApprovalStatusText = (status) => {
    switch (status) {
      case 0: return 'Menunggu Persetujuan';
      case 1: return 'Disetujui';
      case 2: return 'Ditolak';
      default: return 'Unknown';
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 0: return 'text-yellow-600 bg-yellow-100';
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case 0: return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 1: return <CheckCircleIcon className="w-5 h-5" />;
      case 2: return <XCircleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 0: return 'Belum Bayar';
      case 1: return 'Down Payment';
      case 2: return 'Lunas';
      default: return 'Unknown';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 0: return 'text-red-600 bg-red-100';
      case 1: return 'text-orange-600 bg-orange-100';
      case 2: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen overflow-x-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <div className="flex-1 overflow-x-hidden">
          <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
              <p className="text-primaryColor font-semibold">Memuat detail pesanan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen overflow-x-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <div className="flex-1 overflow-x-hidden">
          <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-semibold">{error}</p>
              <button 
                onClick={() => navigate('/admin/order/list')}
                className="mt-4 px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90"
              >
                Kembali ke Daftar Pesanan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: "url('/src/assets/background-image/logobg-zumar.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
        opacity: 1
      }}
    >
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex-1 overflow-x-hidden">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="w-full mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat overflow-x-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/order/list')}
              className="flex items-center gap-2 px-4 py-2 text-primaryColor hover:bg-primaryColor hover:text-white rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primaryColor">Detail Pesanan</h1>
              <p className="text-gray-500">
                {orderData?.oPoNumber ? `No. PO: ${orderData.oPoNumber}` : `Order ID: ${oId}`}
              </p>
            </div>
          </div>

          {/* Order Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primaryColor mb-4 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Informasi Pemesan
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nama Pemesan</p>
                    <p className="font-semibold">{orderData?.oName || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-semibold">{orderData?.oPhone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Alamat</p>
                    <p className="font-semibold">{orderData?.oAddress || '-'}</p>
                  </div>
                </div>
                {orderData?.oNotes && (
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Catatan</p>
                      <p className="font-semibold">{orderData.oNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primaryColor mb-4 flex items-center gap-2">
                <ClockIcon className="w-6 h-6" />
                Status Pesanan
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-semibold">{formatDate(orderData?.oDeadlineAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getApprovalStatusIcon(orderData?.oApprovalStatus)}
                  <div>
                    <p className="text-sm text-gray-500">Status Approval</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(orderData?.oApprovalStatus)}`}>
                      {getApprovalStatusText(orderData?.oApprovalStatus)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Status Pembayaran</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(orderData?.oStatusPayment)}`}>
                      {getPaymentStatusText(orderData?.oStatusPayment)}
                    </span>
                  </div>
                </div>
                {orderData?.oTotalAmount && (
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-bold text-lg text-primaryColor">{formatCurrency(orderData.oTotalAmount)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-primaryColor mb-4">Item Pesanan</h2>
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada data item pesanan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Item #{index + 1}</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Catalogue Product ID:</span> {item.cpId || '-'}</p>
                          <p><span className="font-medium">Inventory Stock ID:</span> {item.isId || '-'}</p>
                          {item.sName && <p><span className="font-medium">Ukuran:</span> {item.sName}</p>}
                          {item.oisAmount && <p><span className="font-medium">Jumlah:</span> {item.oisAmount} pcs</p>}
                        </div>
                      </div>
                      
                      {/* Mockup Images */}
                      {item.oiMockupImage && item.oiMockupImage.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Mockup Images</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.oiMockupImage.map((image, imgIndex) => (
                              <img 
                                key={imgIndex}
                                src={image} 
                                alt={`Mockup ${imgIndex + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-primaryColor mb-4">Progress Pesanan</h2>
            {orderProgress.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada data progress pesanan</p>
                <p className="text-xs mt-1">API: /api/order-progress/detail?opId={oId}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderProgress.map((progress, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
                    <div className="w-3 h-3 bg-primaryColor rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold">{progress.title || `Progress ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">{progress.description || 'No description'}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(progress.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
