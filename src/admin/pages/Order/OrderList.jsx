import React, { useCallback, useEffect, useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XCircleIcon, ChevronDownIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { getOrders, approveOrder, rejectOrder, setOrderDownPayment, setOrderSettlement, updateOrderPrice } from '../../../api/Order/order';
import { useNavigate } from 'react-router-dom';

const PAGE_LIMIT = 10;

function ActionDropdown({ order, onView, onEdit, onEditRab, onUpdatePrice, onApprove, onReject, onDownPayment, onSettlement }) {
  const [open, setOpen] = useState(false);
  const btnRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primaryColor"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <ChevronDownIcon className="w-6 h-6 text-primaryColor" />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 z-10 w-44 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 flex flex-col gap-2 max-h-96 overflow-y-auto mt-2 origin-top-left"
        >
          <button
            onClick={() => { onView(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all bg-primaryColor"
          >
            View Detail
          </button>

          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all bg-secondaryColor"
          >
            Edit Progress
          </button>

          <button
            onClick={() => { onEditRab(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: '#2F6468' }}
          >
            Edit RAB
          </button>

          {/* Update Price */}
          <button
            onClick={() => { onUpdatePrice(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: '#2F6468' }}
          >
            Update Price
          </button>

          {/* Reject */}
          <button
            onClick={() => { onReject(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: '#DC2626' }}
          >
            Reject
          </button>

          {/* Down Payment */}
          <button
            onClick={() => { onDownPayment(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: '#F97316' }}
          >
            Down Payment
          </button>

          {/* Settlement */}
          <button
            onClick={() => { onSettlement(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: '#EA580C' }}
          >
            Settlement
          </button>

          {/* Approve */}
          <button
            onClick={() => { onApprove(); setOpen(false); }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: '#15803D' }}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  // Filter states with key to force refresh
  const [filters, setFilters] = useState({
    approval: null,
    payment: null,
    key: 0
  });

  // Modal states
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [oPrice, setOPrice] = useState('');

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async (goToPage) => {
    setLoading(true);
    setError('');
    try {
      // Hanya gunakan filter approval dan search
      const params = {
        pageLimit: PAGE_LIMIT,
        pageNumber: goToPage,
        ...(search && { search }),
        ...(filters.approval !== null && { filterOApprovalStatus: filters.approval })
      };

      const res = await getOrders(params);
      
      if (res?.data?.data?.listData) {
        let filteredData = res.data.data.listData;
        
        // Filter payment status di frontend
        if (filters.payment !== null) {
          filteredData = filteredData.filter(order => 
            order.oStatusPayment === filters.payment
          );
        }
        
        setOrders(filteredData);
        // Gunakan pageLast dari response API
        setTotalPage(res.data.data.pagination?.pageLast || 1);
      } else {
        setOrders([]);
        setTotalPage(1);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  const handleFilterChange = (filterType, value) => {
    const numValue = value === '' ? null : Number(value);
    
    setFilters(prev => ({
      ...prev,
      [filterType === 'approval' ? 'approval' : 'payment']: numValue,
      key: prev.key + 1
    }));
    
    setPage(1);
    setError('');
    setSearchInput('');
    setSearch('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage && newPage !== page) {
      setPage(newPage);
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/admin/order/detail/${order.oId}`);
  };

  const handleEditOrder = (order) => {
    navigate(`/admin/order/edit/${order.oId}`);
  };

  const handleEditRabOrder = (order) => {
    navigate(`/admin/order/rab/${order.oId}`);
  };

  const handleOrderAction = (order, action) => {
    setSelectedOrder(order);
    setModalAction(action);
    setShowActionModal(true);
    setActionError('');
  };

  const handleConfirmAction = async () => {
    if (!selectedOrder || !modalAction) return;
    
    setActionLoading(true);
    setActionError('');
    
    try {
      switch (modalAction.type) {
        case 'updatePrice':
          if (!oPrice || isNaN(oPrice) || Number(oPrice) <= 0) {
            throw new Error('Harga order harus lebih dari 0');
          }
          await updateOrderPrice(selectedOrder.oId, { oPrice: Number(oPrice) });
          setOPrice(''); // Reset input
          break;
        case 'approve':
          await approveOrder(selectedOrder.oId);
          break;
        case 'reject':
          await rejectOrder(selectedOrder.oId);
          break;
        case 'downPayment':
          await setOrderDownPayment(selectedOrder.oId);
          break;
        case 'settlement':
          await setOrderSettlement(selectedOrder.oId);
          break;
        default:
          throw new Error('Unknown action');
      }
      
      setShowActionModal(false);
      setSelectedOrder(null);
      setModalAction(null);
      
      await fetchData(page);
      
    } catch (err) {
      console.error('Error performing action:', err);
      setActionError(err.message || 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const getApprovalStatusText = (status) => {
    switch (parseInt(status)) {
      case 1: return 'Menunggu Konfirmasi';
      case 2: return 'Order Dibuat';
      case 3: return 'Order Selesai';
      case 4: return 'Order Ditolak';
      default: return 'Menunggu Konfirmasi';
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (parseInt(status)) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-green-600 bg-green-100';
      case 4: return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (parseInt(status)) {
      case 1: return 'Belum Dibayar';
      case 2: return 'Bayar DP';
      case 3: return 'Dibayar Lunas';
      default: return 'Belum Dibayar';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (parseInt(status)) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-green-600 bg-green-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{
      backgroundImage: "url('/src/assets/background-image/logobg-zumar.png')",
      backgroundRepeat: 'repeat',
      backgroundSize: '1000px auto',
      backgroundPosition: 'center',
      opacity: 1
    }}>
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 overflow-x-hidden">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="w-full mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat overflow-x-hidden">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">DAFTAR PESANAN</h1>
          <p className="text-center text-gray-500 mb-8">Berikut adalah daftar pesanan yang terdaftar dalam sistem.</p>

          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            {/* Search Bar Row */}
            <div className="flex flex-wrap items-center gap-4">
              <form onSubmit={handleSearch} className="flex items-center flex-shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder={searchExpanded ? 'Cari di sini' : ''}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => setSearchExpanded(true)}
                    className={`bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondaryColor transition-all duration-300 ease-in-out px-4 py-2 rounded-full text-black ${searchExpanded ? 'w-40 md:w-56 pl-10 pr-10' : 'w-0 px-0 border-transparent cursor-pointer'} min-w-0`}
                    style={{ zIndex: 1 }}
                  />
                  <MagnifyingGlassIcon className={`absolute left-3 w-5 h-5 text-[#E87722] pointer-events-none transition-opacity duration-300 ${searchExpanded ? 'opacity-100' : 'opacity-0'}`} style={{zIndex:2}} />
                  <button
                    type={searchExpanded ? 'submit' : 'button'}
                    onClick={() => { if (!searchExpanded) setSearchExpanded(true); }}
                    className="flex items-center gap-2 bg-[#E87722] hover:bg-[#d96c1f] text-white px-7 py-3 rounded-full font-semibold shadow transition-all duration-300 relative"
                    style={{marginLeft: searchExpanded ? '-2.5rem' : '0', zIndex: 4}}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    <span className={`${searchExpanded ? 'inline' : 'hidden'} md:inline`}>Search</span>
                    {searchExpanded && (
                      <span
                        onClick={e => { e.preventDefault(); setSearchExpanded(false); setSearchInput(''); }}
                        className="ml-2 flex items-center cursor-pointer"
                        tabIndex={-1}
                      >
                        <XCircleIcon className="w-5 h-5 text-white hover:text-gray-200" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              <button 
                type="button" 
                className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 flex-shrink-0"
                onClick={() => navigate('/admin/order/add')}
              >
                <PlusIcon className="w-5 h-5" />
                Tambah Pesanan
              </button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Approval Status Filter */}
              <div className="flex items-center flex-shrink-0">
                <span className="px-2 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 text-xs h-[36px] min-w-[90px] flex items-center justify-center whitespace-nowrap">Approval</span>
                <select
                  value={filters.approval === null ? '' : filters.approval}
                  onChange={(e) => handleFilterChange('approval', e.target.value)}
                  className="w-[140px] px-2 py-2 border border-primaryColor border-l-0 bg-white text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[36px] text-xs"
                >
                  <option value="">Semua</option>
                  <option value="1">Menunggu Konfirmasi</option>
                  <option value="2">Order Dibuat</option>
                  <option value="3">Order Selesai</option>
                  <option value="4">Order Ditolak</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div className="flex items-center flex-shrink-0">
                <span className="px-2 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 text-xs h-[36px] min-w-[90px] flex items-center justify-center whitespace-nowrap">Payment</span>
                <select
                  value={filters.payment === null ? '' : filters.payment}
                  onChange={(e) => handleFilterChange('payment', e.target.value)}
                  className="w-[140px] px-2 py-2 border border-primaryColor border-l-0 bg-white text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[36px] text-xs"
                >
                  <option value="">Semua</option>
                  <option value="1">Belum Dibayar</option>
                  <option value="2">Bayar DP</option>
                  <option value="3">Dibayar Lunas</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 font-montserrat">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
                <p className="text-primaryColor font-semibold">Memuat data pesanan...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-semibold mb-4">{error}</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => fetchData(page)}
                    className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada data pesanan</p>
                <p className="text-xs mt-1">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2 min-w-max">
                    <thead>
                      <tr className="text-primaryColor">
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">Action</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">ID</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[120px]">No. PO</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[140px]">Nama Pemesan</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[120px]">Telepon</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[150px]">Alamat</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[130px]">Harga</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[100px]">Deadline</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[140px]">Status Approval</th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[150px]">Status Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.oId} className="bg-white hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <ActionDropdown
                              order={order}
                              onView={() => handleViewOrder(order)}
                              onEdit={() => handleEditOrder(order)}
                              onEditRab={() => handleEditRabOrder(order)}
                              onUpdatePrice={() => handleOrderAction(order, { type: 'updatePrice', title: 'Update Harga', message: 'Apakah Anda yakin ingin mengupdate harga pesanan ini?' })}
                              onApprove={() => handleOrderAction(order, { type: 'approve', title: 'Setujui Pesanan', message: 'Apakah Anda yakin ingin menyetujui pesanan ini?' })}
                              onReject={() => handleOrderAction(order, { type: 'reject', title: 'Tolak Pesanan', message: 'Apakah Anda yakin ingin menolak pesanan ini?' })}
                              onDownPayment={() => handleOrderAction(order, { type: 'downPayment', title: 'Set Down Payment', message: 'Apakah Anda yakin ingin mengubah status ke Down Payment?' })}
                              onSettlement={() => handleOrderAction(order, { type: 'settlement', title: 'Set Settlement', message: 'Apakah Anda yakin ingin mengubah status ke Settlement?' })}
                            />
                          </td>
                          <td className="px-3 py-3 font-medium whitespace-nowrap text-sm">{order.oId}</td>
                          <td className="px-3 py-3 font-medium whitespace-nowrap text-sm">{order.oPoNumber || '-'}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm">{order.oName}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm">{order.oPhone}</td>
                          <td className="px-3 py-3 text-sm">
                            <div className="max-w-[150px] truncate" title={order.oAddress}>
                              {truncateText(order.oAddress, 25)}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                            {formatCurrency(order.oPrice)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm">{formatDate(order.oDeadlineAt)}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(order.oApprovalStatus)}`}>
                              {getApprovalStatusText(order.oApprovalStatus)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.oStatusPayment)}`}>
                              {getPaymentStatusText(order.oStatusPayment)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              {'<'}
            </button>
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded border text-primaryColor font-semibold ${p === page ? 'bg-primaryColor text-white' : 'border-gray-300'}`}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPage}
            >
              {'>'}
            </button>
          </div>

          {/* Action Confirmation Modal */}
          {showActionModal && modalAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-primaryColor">
                  {modalAction.type === 'reject' ? (
                    <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
                  ) : (
                    <CheckCircleIcon className="h-10 w-10 text-primaryColor" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-4">{modalAction.title}</h2>
                <p className="text-gray-500 mt-2">{modalAction.message}</p>
                {modalAction.type === 'updatePrice' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Order
                    </label>
                    <input
                      type="number"
                      value={oPrice}
                      onChange={(e) => setOPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                      placeholder="Masukkan harga order"
                    />
                  </div>
                )}
                {actionError && <div className="text-red-500 mt-2 text-sm">{actionError}</div>}
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    type="button" 
                    className="w-full rounded-lg bg-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-400" 
                    onClick={() => setShowActionModal(false)} 
                    disabled={actionLoading}
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleConfirmAction} 
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                      modalAction.type === 'reject' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-primaryColor hover:bg-primaryColor/90'
                    }`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Memproses...' : 'Konfirmasi'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderList;