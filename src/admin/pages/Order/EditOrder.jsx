import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarDaysIcon, 
  PhoneIcon, 
  MapPinIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { 
  getOrderDetail, 
  getOrderItemSizes, 
  getOrderProgressMain, 
  getOrderProgressByMain, 
  getOrderProgressDetailItems,
  createOrderProgress, 
  deleteOrderProgress,
  createOrderProgressDetail,
  updateOrderProgressDetail,
  deleteOrderProgressDetail,
  getUsers
} from '../../../api/Order/order';

const EditOrder = () => {
  const { oId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderProgressMain, setOrderProgressMain] = useState([]);
  const [orderProgressDetails, setOrderProgressDetails] = useState({});
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState(new Set([0])); // Default: hanya section pertama yang expanded

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Progress form state
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [selectedProgressMainId, setSelectedProgressMainId] = useState(null);
  const [newProgress, setNewProgress] = useState({
    oisId: '',
    opAmount: '',
    opDeadlineAt: '',
    uId: ''
  });

  // Progress detail form state
  const [showAddProgressDetail, setShowAddProgressDetail] = useState(false);
  const [showEditProgressDetail, setShowEditProgressDetail] = useState(false);
  const [selectedProgressId, setSelectedProgressId] = useState(null);
  const [selectedProgressDetailId, setSelectedProgressDetailId] = useState(null);
  const [newProgressDetail, setNewProgressDetail] = useState({
    opdAmount: '',
    opdFinishedAt: ''
  });
  const [editProgressDetail, setEditProgressDetail] = useState({
    opdId: '',
    opdAmount: '',
    opdFinishedAt: ''
  });

  // Mockup image popup state
  const [showMockupPopup, setShowMockupPopup] = useState(false);
  const [selectedMockupImage, setSelectedMockupImage] = useState('');

  // Progress Main names - ini hanya untuk display jika nama tidak ada dari API
  const progressMainNames = [
    'POTONG', 'BORDIR', 'JAHIT', 'QC', 'LB KANCING', 
    'PS KANCING', 'BERSIH BENANG', 'IRONING', 'FOLDING', 
    'POLYBAG', 'KODIFIKASI', 'KIRIM'
  ];

  // Helper function untuk extract data dari response API
  const extractDataFromResponse = useCallback((response) => {
    if (!response?.data) return [];
    
    const data = response.data;
    
    // Handle different response structures
    if (Array.isArray(data)) return data;
    if (data.data) {
      if (Array.isArray(data.data)) return data.data;
      if (data.data.listData && Array.isArray(data.data.listData)) return data.data.listData;
      return data.data;
    }
    if (data.listData && Array.isArray(data.listData)) return data.listData;
    
    return [];
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await getUsers();
      const usersData = extractDataFromResponse(response);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [extractDataFromResponse]);

  // Fetch order detail
  const fetchOrderDetail = useCallback(async () => {
    if (!oId) return null;
    
    try {
      const response = await getOrderDetail(oId);
      const orderData = response?.data?.data;
      setOrderData(orderData);
      return orderData;
    } catch (err) {
      console.error('Error fetching order detail:', err);
      throw err;
    }
  }, [oId]);

  // Fetch order items
  const fetchOrderItems = useCallback(async () => {
    if (!oId) return [];
    
    try {
      const response = await getOrderItemSizes(oId);
      const itemsData = extractDataFromResponse(response);
      setOrderItems(itemsData);
      return itemsData;
    } catch (err) {
      console.error('Error fetching order items:', err);
      // Fallback to order detail items if available
      return [];
    }
  }, [oId, extractDataFromResponse]);

  // Fetch progress main
  const fetchProgressMain = useCallback(async () => {
    if (!oId) return [];
    
    try {
      const response = await getOrderProgressMain(parseInt(oId));
      const progressData = extractDataFromResponse(response);
      setOrderProgressMain(progressData);
      return progressData;
    } catch (err) {
      console.error('Error fetching progress main:', err);
      setOrderProgressMain([]);
      return [];
    }
  }, [oId, extractDataFromResponse]);

  // Fetch progress details for each progress main
  const fetchProgressDetails = useCallback(async (progressMainData) => {
    if (!progressMainData || progressMainData.length === 0) return;

    const progressDetails = {};
    
    try {
      for (const progressMain of progressMainData) {
        if (!progressMain.opmId) continue;
        
        console.log(`Fetching progress for main ID ${progressMain.opmId}...`);
        
        // Get progress items for this progress main
        const progressResponse = await getOrderProgressByMain(progressMain.opmId);
        const progressItems = extractDataFromResponse(progressResponse);
        console.log(`Found ${progressItems.length} progress items for main ID ${progressMain.opmId}:`, progressItems);
        
        // Store progress items under main ID
        progressDetails[progressMain.opmId] = progressItems;
        
        // Get details for each progress item
        if (progressItems.length > 0) {
          for (const progressItem of progressItems) {
            if (!progressItem.opId) continue;
            
            console.log(`Fetching details for progress ID ${progressItem.opId}...`);
            const detailResponse = await getOrderProgressDetailItems(progressItem.opId);
            const detailItems = extractDataFromResponse(detailResponse);
            console.log(`Found ${detailItems.length} detail items for progress ID ${progressItem.opId}:`, detailItems);
            
            // Store detail items under progress ID
            progressDetails[progressItem.opId] = detailItems;
          }
        }
      }
      
      console.log('Final progress details structure:', progressDetails);
      setOrderProgressDetails(progressDetails);
    } catch (err) {
      console.error('Error fetching progress details:', err);
    }
  }, [extractDataFromResponse]);

  // Debug effect untuk monitoring state
  useEffect(() => {
  }, [orderData, orderItems, orderProgressMain, orderProgressDetails, selectedProgressMainId, selectedProgressId]);

  // Main data fetching effect
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching all data...');
        
        // Fetch all data in parallel where possible
        const [orderData, itemsData] = await Promise.all([
          fetchOrderDetail(),
          fetchOrderItems()
        ]);

        console.log('Order Data fetched:', orderData);
        console.log('Items Data fetched:', itemsData);

        // If order items not found from separate API, use items from order detail
        if (itemsData.length === 0 && orderData?.oItems) {
          console.log('Using items from order detail:', orderData.oItems);
          setOrderItems(orderData.oItems);
        }

        // Fetch progress main data
        const progressMainData = await fetchProgressMain();
        console.log('Progress Main Data fetched:', progressMainData);
        
        // Fetch progress details if progress main exists
        if (progressMainData.length > 0) {
          console.log('Fetching progress details...');
          await fetchProgressDetails(progressMainData);
        }

      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Gagal memuat data pesanan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [fetchOrderDetail, fetchOrderItems, fetchProgressMain, fetchProgressDetails]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      // Parse tanggal dan tampilkan sesuai input user
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Gunakan format 24 jam
      }) + ' WIB';
    } catch {
      return '-';
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case 1: return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 2: return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
      case 3: return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 4: return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getApprovalStatusText = (status) => {
    switch (parseInt(status)) {
    case 1: return 'Menunggu Konfirmasi';
    case 2: return 'Order Dibuat/Diproses';
    case 3: return 'Order Selesai';
    case 4: return 'Order Ditolak';
    default: return 'Status Tidak Diketahui';
  }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 0: return 'Belum Bayar';
      case 1: return 'Down Payment';
      case 2: return 'Lunas';
      default: return '-';
    }
  };

  // Handle add progress
  const handleAddProgress = async () => {
    try {
      console.log('Starting add progress with data:', {
        selectedProgressMainId,
        newProgress,
        orderItems
      });

      // Validasi basic input
      if (!selectedProgressMainId || !newProgress.oisId || !newProgress.opAmount || !newProgress.opDeadlineAt || !newProgress.uId) {
        throw new Error('Mohon lengkapi semua field yang required');
      }

      // Validasi status order
      if (orderData?.oApprovalStatus !== 2) {
        throw new Error('Order harus berstatus "Order Dibuat/Diproses" untuk menambah progress');
      }

      // Validasi item
      const selectedItem = orderItems.find(item => item.oisId === parseInt(newProgress.oisId));
      if (!selectedItem) {
        throw new Error('Item yang dipilih tidak valid');
      }

      // Validasi amount tidak melebihi jumlah item
      if (parseInt(newProgress.opAmount) > selectedItem.oisAmount) {
        throw new Error(`Jumlah tidak boleh melebihi jumlah item (${selectedItem.oisAmount} pcs)`);
      }

      // Validasi deadline
      const deadlineDate = new Date(newProgress.opDeadlineAt);
      const orderDeadline = new Date(orderData.oDeadlineAt);
      const now = new Date();

      if (deadlineDate < now) {
        throw new Error('Deadline tidak boleh di masa lalu');
      }

      if (deadlineDate > orderDeadline) {
        throw new Error('Deadline progress tidak boleh melewati deadline order');
      }

      // Prepare data sesuai dengan API example
      const progressData = {
        opmId: parseInt(selectedProgressMainId),
        opItems: [{
          oisId: parseInt(newProgress.oisId),
          uId: newProgress.uId,
          opAmount: parseInt(newProgress.opAmount),
          // Tambahkan 7 jam untuk mengkompensasi timezone
          opDeadlineAt: (() => {
            const date = new Date(newProgress.opDeadlineAt);
            date.setHours(date.getHours() + 7);
            return date.toISOString();
          })()
        }]
      };

      console.log('Sending progress data:', progressData);
      setSaving(true);

      try {
        console.log('Attempting to create progress with data:', progressData);
        
        // Create progress
        const response = await createOrderProgress(progressData);
        
        // Periksa response dengan lebih detail
        if (!response?.data) {
          console.error('No response data received');
          throw new Error('No response from server');
        }
        
        if (response.data.status === 'error' || response.status === 500) {
          console.error('Server error:', response.data);
          throw new Error(response.data.remark || 'Failed to create progress');
        }

        // Tunggu sebentar untuk memastikan data tersimpan di server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh data secara berurutan
        const progressMainData = await fetchProgressMain();
        if (!progressMainData?.length) {
          throw new Error('No progress main data returned after create');
        }

        // Ambil progress items untuk progress main yang baru saja diupdate
        const progressResponse = await getOrderProgressByMain(parseInt(selectedProgressMainId));
        const progressItems = extractDataFromResponse(progressResponse);
        
        // Update state dengan data baru
        setOrderProgressDetails(prev => ({
          ...prev,
          [selectedProgressMainId]: progressItems || []
        }));

        // Reset form
        setNewProgress({
          oisId: '',
          opAmount: '',
          opDeadlineAt: '',
          uId: ''
        });
        setShowAddProgress(false);
        setSelectedProgressMainId(null);

              // Reset form
      setNewProgress({
        oisId: '',
        opAmount: '',
        opDeadlineAt: '',
        uId: ''
      });
      setShowAddProgress(false);
      setSelectedProgressMainId(null);
      
      toast.success('Progress berhasil ditambahkan');
      } catch (apiError) {
        console.error('API Error:', apiError);
        throw new Error(apiError.response?.data?.message || 'Gagal menyimpan progress ke server');
      }
    } catch (err) {
      console.error('Error adding progress:', err);
      toast.error(err.message || 'Gagal menambahkan progress');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete progress
  const handleDeleteProgress = async (progressId) => {
    // Konfirmasi penghapusan
    if (!window.confirm('Apakah Anda yakin ingin menghapus progress ini?')) {
      return;
    }

    const toastId = toast.loading('Menghapus progress...');
    setSaving(true);
    try {
      await deleteOrderProgress(progressId);
      
      // Refresh progress data
      const progressMainData = await fetchProgressMain();
      if (progressMainData.length > 0) {
        await fetchProgressDetails(progressMainData);
      }
      
      toast.update(toastId, {
        render: 'Progress berhasil dihapus',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error deleting progress:', err);
      toast.update(toastId, {
        render: 'Gagal menghapus progress: ' + (err.response?.data?.message || err.message),
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle add progress detail (Finished Item)
  const handleAddProgressDetail = async () => {
    try {
      // Validasi basic input
      if (!selectedProgressId || !newProgressDetail.opdAmount || !newProgressDetail.opdFinishedAt) {
        throw new Error('Mohon lengkapi semua field yang required');
      }

      // Validasi status order
      if (orderData?.oApprovalStatus !== 2) {
        throw new Error('Order harus berstatus "Order Dibuat/Diproses" untuk menambah finished item');
      }

      // Cari progress yang sedang aktif
      let activeProgress = null;
      let activeProgressMainId = null;

      for (const main of orderProgressMain) {
        const progressItems = orderProgressDetails[main.opmId] || [];
        const foundProgress = progressItems.find(p => p.opId === parseInt(selectedProgressId));
        if (foundProgress) {
          activeProgress = foundProgress;
          activeProgressMainId = main.opmId;
          break;
        }
      }

      if (!activeProgress) {
        throw new Error('Progress tidak ditemukan');
      }

      // Validasi amount
      const existingDetails = orderProgressDetails[selectedProgressId] || [];
      const totalFinished = existingDetails.reduce((sum, d) => sum + (parseInt(d.opdAmount) || 0), 0);
      const remainingAmount = parseInt(activeProgress.opAmount) - totalFinished;

      if (parseInt(newProgressDetail.opdAmount) > remainingAmount) {
        throw new Error(`Jumlah melebihi sisa yang tersedia (${remainingAmount} pcs)`);
      }

      // Validasi tanggal
      const finishDate = new Date(newProgressDetail.opdFinishedAt);
      const now = new Date();
      const deadline = new Date(activeProgress.opDeadlineAt);

      if (finishDate > now) {
        throw new Error('Tanggal selesai tidak boleh di masa depan');
      }

      if (finishDate > deadline) {
        throw new Error('Tanggal selesai tidak boleh melewati deadline progress');
      }

      console.log('Validation passed, creating finished item with data:', {
        selectedProgressId,
        newProgressDetail,
        activeProgress,
        remainingAmount
      });

      setSaving(true);

      // Format data sesuai dengan API example
      const progressDetailData = {
        opId: parseInt(selectedProgressId),
        opdItems: [{
          opdAmount: parseInt(newProgressDetail.opdAmount),
          opdFinishedAt: (() => {
            const date = new Date(newProgressDetail.opdFinishedAt);
            date.setHours(date.getHours() + 7); // Tambah 7 jam untuk timezone
            return date.toISOString();
          })()
        }]
      };

      console.log('Sending data to API:', progressDetailData);

      const response = await createOrderProgressDetail(progressDetailData);
      console.log('API Response:', response);

      if (response?.data?.status === 'error' || response?.status === 500) {
        throw new Error(response?.data?.remark || 'Failed to create finished item');
      }

      // Tunggu sebentar untuk memastikan data tersimpan di server
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh data
      const progressMainData = await fetchProgressMain();
      console.log('Progress main data after create:', progressMainData);

      if (!progressMainData?.length) {
        throw new Error('No progress main data returned after create');
      }

      // Ambil progress items untuk progress main yang aktif
      const progressResponse = await getOrderProgressByMain(activeProgressMainId);
      const progressItems = extractDataFromResponse(progressResponse);
      console.log('Progress items after create:', progressItems);

      // Ambil detail items untuk progress yang diupdate
      const detailResponse = await getOrderProgressDetailItems(selectedProgressId);
      const detailItems = extractDataFromResponse(detailResponse);
      console.log('Detail items after create:', detailItems);

      // Update state dengan data baru
      setOrderProgressDetails(prev => {
        const newState = { ...prev };
        // Update progress items untuk progress main
        newState[activeProgressMainId] = progressItems;
        // Update detail items untuk progress
        newState[selectedProgressId] = detailItems;
        console.log('New state:', newState);
        return newState;
      });

      // Reset form
      setNewProgressDetail({
        opdAmount: '',
        opdFinishedAt: ''
      });
      setShowAddProgressDetail(false);
      setSelectedProgressId(null);
      
      toast.success('Finished item berhasil ditambahkan');
    } catch (err) {
      console.error('Error adding finished item:', err);
      toast.error(err.message || 'Gagal menambahkan finished item');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit progress detail
  const handleEditProgressDetail = async () => {
    try {
      // Validasi basic input
      if (!editProgressDetail.opdId || !editProgressDetail.opdAmount || !editProgressDetail.opdFinishedAt) {
        throw new Error('Mohon lengkapi semua field yang required');
      }

      // Validasi status order
      if (orderData?.oApprovalStatus !== 2) {
        throw new Error('Order harus berstatus "Order Dibuat/Diproses" untuk mengubah finished item');
      }

      setSaving(true);

      // Format data sesuai dengan API example
      const updateData = {
        opdItems: [{
          opdId: parseInt(editProgressDetail.opdId),
          opdAmount: parseInt(editProgressDetail.opdAmount),
          opdFinishedAt: (() => {
            const date = new Date(editProgressDetail.opdFinishedAt);
            date.setHours(date.getHours() + 7); // Tambah 7 jam untuk timezone
            return date.toISOString();
          })()
        }]
      };

      console.log('Sending update data to API:', updateData);

      const response = await updateOrderProgressDetail(updateData);
      console.log('API Response:', response);

      if (response?.data?.status === 'error' || response?.status === 500) {
        throw new Error(response?.data?.remark || 'Failed to update finished item');
      }

      // Tunggu sebentar untuk memastikan data tersimpan di server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data
      const detailResponse = await getOrderProgressDetailItems(selectedProgressId);
      const detailItems = extractDataFromResponse(detailResponse);
      console.log('Updated detail items:', detailItems);
      
      // Update state
      setOrderProgressDetails(prev => {
        const newState = { ...prev };
        newState[selectedProgressId] = detailItems;
        console.log('New state after update:', newState);
        return newState;
      });

      // Reset form
      setEditProgressDetail({
        opdId: '',
        opdAmount: '',
        opdFinishedAt: ''
      });
      setShowEditProgressDetail(false);
      setSelectedProgressDetailId(null);
      
      toast.success('Finished item berhasil diupdate');
    } catch (err) {
      console.error('Error updating progress detail:', err);
      toast.error(err.message || 'Gagal mengupdate finished item');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete progress detail
  const handleDeleteProgressDetail = async (opdId) => {
    // Konfirmasi penghapusan
    if (!window.confirm('Apakah Anda yakin ingin menghapus finished item ini?')) {
      return;
    }

    const toastId = toast.loading('Menghapus finished item...');
    setSaving(true);
    try {
      await deleteOrderProgressDetail(opdId);
      
      // Refresh progress details
      const detailResponse = await getOrderProgressDetailItems(selectedProgressId);
      const detailItems = extractDataFromResponse(detailResponse);
      
      setOrderProgressDetails(prev => ({
        ...prev,
        [selectedProgressId]: detailItems
      }));
      
      toast.update(toastId, {
        render: 'Finished item berhasil dihapus',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error deleting progress detail:', err);
      toast.update(toastId, {
        render: 'Gagal menghapus finished item: ' + (err.response?.data?.message || err.message),
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress percentage
  const calculateProgressPercentage = (progressMain, progressItems) => {
    if (!progressMain.opmAmountTotal || progressMain.opmAmountTotal === 0) return 0;
    
    const totalFinished = progressItems.reduce((total, item) => {
      const details = orderProgressDetails[item.opId] || [];
      const itemFinished = details.reduce((sum, detail) => sum + (detail.opdAmount || 0), 0);
      return total + itemFinished;
    }, 0);
    
    return Math.min(Math.round((totalFinished / progressMain.opmAmountTotal) * 100), 100);
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
              <p className="text-primaryColor font-semibold">Memuat data pesanan...</p>
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
                onClick={() => window.location.reload()}
                className="mt-4 mr-2 px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90"
              >
                Coba Lagi
              </button>
              <button 
                onClick={() => navigate('/admin/order/list')}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Kembali
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
              <h1 className="text-3xl font-bold text-primaryColor">Edit Progress Pesanan</h1>
              <div className="space-y-1">
                {orderData?.oPoNumber && (
                  <p className="text-black">No. PO: {orderData.oPoNumber}</p>
                )}
                <p className="text-black">No. Order: {orderData?.oNumber || oId}</p>
              </div>
            </div>
          </div>

          {/* Order Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primaryColor mb-4 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Informasi Pesanan
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
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-semibold">{formatDate(orderData?.oDeadlineAt)}</p>
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
                  {getApprovalStatusIcon(orderData?.oApprovalStatus || 0)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Status Approval</p>
                    <p className="font-semibold">{getApprovalStatusText(orderData?.oApprovalStatus)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                    <p className="font-semibold">{getPaymentStatusText(orderData?.oStatusPayment)}</p>
                  </div>
                </div>
                                 <div className="flex items-center gap-3">
                   <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                   <div className="flex-1">
                     <p className="text-sm text-gray-500 mb-1">Total Harga</p>
                     <p className="font-semibold">
                       Rp {orderData?.oPrice ? new Intl.NumberFormat('id-ID').format(orderData.oPrice) : '0'}
                     </p>
                   </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="flex items-center gap-3 mt-4">
                   <ChartBarIcon className="w-5 h-5 text-gray-400" />
                   <div className="flex-1">
                     <div className="flex justify-between text-sm text-gray-500 mb-1">
                       <span>Progress Pesanan</span>
                       <span>{orderData?.oProgress || 0}%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                       <div 
                         className="h-2.5 rounded-full bg-primaryColor transition-all duration-300"
                         style={{ width: `${orderData?.oProgress || 0}%` }}
                       ></div>
                     </div>
                   </div>
                 </div>
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
                        <h3 className="font-semibold text-lg mb-2 text-primaryColor">
                          {item.cpName || `Item #${index + 1}`}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Product ID:</span> {item.cpId || '-'}</p>
                          <p><span className="font-medium">Stock ID:</span> {item.isId || '-'}</p>
                          <p><span className="font-medium">Order Item Size ID:</span> {item.oisId || '-'}</p>
                          <p><span className="font-medium">Ukuran:</span> {item.sName || '-'}</p>
                          <p><span className="font-medium">Jumlah:</span> {item.oisAmount || 0} pcs</p>
                        </div>
                      </div>
                      
                      {/* Mockup Images */}
                      {item.oiMockupImage && item.oiMockupImage.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-black">Mockup Images</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.oiMockupImage.map((image, imgIndex) => (
                              <img 
                                key={imgIndex}
                                src={image} 
                                alt={`Mockup ${imgIndex + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  setSelectedMockupImage(image);
                                  setShowMockupPopup(true);
                                }}
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

          {/* Order Progress Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primaryColor">Kelola Progress Pesanan</h2>
              <p className="text-sm text-gray-600 mt-1">
                Progress Main dibuat otomatis saat order diapprove. Anda dapat menambahkan Progress Items dan Progress Details.
              </p>
            </div>

            {/* Progress Main List */}
            <div className="space-y-6">
              {orderProgressMain.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada Progress Main</h3>
                  <p className="mb-4">Progress Main akan dibuat otomatis saat order diapprove oleh admin</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      Progress Main yang akan dibuat otomatis:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-600">
                      {progressMainNames.map((name, index) => (
                        <span key={index} className="bg-blue-100 px-2 py-1 rounded">
                          {index + 1}. {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                orderProgressMain.map((progressMain, index) => {
                  const progressItems = orderProgressDetails[progressMain.opmId] || [];
                  const progressPercentage = calculateProgressPercentage(progressMain, progressItems);
                  
                  return (
                    <div key={progressMain.opmId || index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div 
                        className="flex items-center justify-between mb-4 cursor-pointer"
                        onClick={() => {
                          setExpandedSections(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(index)) {
                              newSet.delete(index);
                            } else {
                              newSet.add(index);
                            }
                            return newSet;
                          });
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-xl text-primaryColor">
                              {progressMain.opmName || progressMainNames[index] || `Progress Main #${index + 1}`}
                            </h3>
                            {expandedSections.has(index) ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress: {progressPercentage}%</span>
                              <span>
                                {progressItems.reduce((total, item) => {
                                  const details = orderProgressDetails[item.opId] || [];
                                  return total + details.reduce((sum, detail) => sum + (detail.opdAmount || 0), 0);
                                }, 0)} / {progressMain.opmAmountTotal || 0}
                              </span>
                            </div>
                                                          <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full transition-all duration-500 bg-primaryColor"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                            <div>
                              <span className="font-medium">Progress Main ID:</span>
                              <p>{progressMain.opmId}</p>
                            </div>
                            <div>
                              <span className="font-medium">Total Amount:</span>
                              <p>{progressMain.opmAmountTotal || 0}</p>
                            </div>
                            <div>
                              <span className="font-medium">Amount Done:</span>
                              <p>{progressMain.opmAmountTotalDone || 0}</p>
                            </div>
                            <div>
                              <span className="font-medium">Progress Items:</span>
                              <p>{progressItems.length}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering expand/collapse
                              setSelectedProgressMainId(progressMain.opmId);
                              setShowAddProgress(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 disabled:opacity-50"
                            disabled={saving}
                          >
                            <PlusIcon className="w-4 h-4" />
                            Tambah Progress
                          </button>
                        </div>
                      </div>
                      
                      {/* Content yang bisa di-collapse */}
                      {expandedSections.has(index) && (
                        <div className="mt-4">
                          {/* Add Progress Form */}
                          {showAddProgress && selectedProgressMainId === progressMain.opmId && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <PlusIcon className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-lg text-blue-800">
                              Tambah Progress ke: {progressMain.opmName}
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Order Item Size *
                                </label>
                                <select
                                  value={newProgress.oisId}
                                  onChange={(e) => setNewProgress({...newProgress, oisId: e.target.value})}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                  required
                                >
                                  <option value="">-- Pilih Item yang akan dikerjakan --</option>
                                  {orderItems.map((item, index) => (
                                    <option key={item.oisId || index} value={item.oisId || index}>
                                      📦 {item.cpName || `Item #${index + 1}`} | 📏 {item.sName || 'No Size'} | 🔢 {item.oisAmount || 0} pcs
                                    </option>
                                  ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Pilih item pesanan yang akan dikerjakan pada tahap {progressMain.opmName}</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Progress Amount *
                                </label>
                                <input
                                  type="number"
                                  value={newProgress.opAmount}
                                  onChange={(e) => setNewProgress({...newProgress, opAmount: e.target.value})}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                  placeholder="Masukkan jumlah yang akan dikerjakan"
                                  min="1"
                                  required
                                />
                                <p className="text-xs text-gray-500 mt-1">Jumlah unit yang akan dikerjakan oleh pekerja ini</p>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Deadline Pengerjaan *
                                </label>
                                <input
                                  type="datetime-local"
                                  value={newProgress.opDeadlineAt}
                                  onChange={(e) => setNewProgress({...newProgress, opDeadlineAt: e.target.value})}
                                  min={new Date().toISOString().slice(0, 16)}
                                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                                  onKeyDown={(e) => e.preventDefault()}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                  required
                                />
                                <p className="text-xs text-gray-500 mt-1">Target waktu penyelesaian pekerjaan</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Assigned User *
                                </label>
                                {usersLoading ? (
                                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-gray-600">Loading users...</span>
                                  </div>
                                ) : users.length > 0 ? (
                                  <select
                                    value={newProgress.uId}
                                    onChange={(e) => setNewProgress({...newProgress, uId: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                    required
                                  >
                                    <option value="">-- Pilih Pekerja --</option>
                                    {users.map((user) => (
                                      <option key={user.uId} value={user.uId}>
                                        👤 {user.uName} ({user.uEmail || user.uId})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={newProgress.uId}
                                      onChange={(e) => setNewProgress({...newProgress, uId: e.target.value})}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                      placeholder="Masukkan User ID"
                                      required
                                    />
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                      <p className="text-xs text-amber-700 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        Users API tidak tersedia. Silakan masukkan User ID secara manual.
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Pekerja yang akan bertanggung jawab mengerjakan progress ini</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-blue-200">
                            <button
                              onClick={handleAddProgress}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                              disabled={saving || !newProgress.oisId || !newProgress.opAmount || !newProgress.opDeadlineAt || !newProgress.uId}
                            >
                              {saving ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Menyimpan Progress...
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Simpan Progress
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowAddProgress(false);
                                setSelectedProgressMainId(null);
                                setNewProgress({oisId: '', opAmount: '', opDeadlineAt: '', uId: ''});
                              }}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
                              disabled={saving}
                            >
                              <XCircleIcon className="w-4 h-4" />
                              Batal
                            </button>
                          </div>
                          
                          {/* Progress Summary */}
                          <div className="mt-4 bg-white border border-blue-100 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">📊 Ringkasan Progress Main</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <p className="text-gray-500">Target Total</p>
                                <p className="font-semibold text-blue-600">{progressMain.opmAmountTotal || 0} pcs</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">Progress Items</p>
                                <p className="font-semibold text-blue-600">{progressItems.length}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">Sudah Selesai</p>
                                <p className="font-semibold text-green-600">
                                  {progressItems.reduce((total, item) => {
                                    const details = orderProgressDetails[item.opId] || [];
                                    return total + details.reduce((sum, detail) => sum + (detail.opdAmount || 0), 0);
                                  }, 0)} pcs
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">Progress</p>
                                <p className="font-semibold text-purple-600">{progressPercentage}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Progress Items */}
                      {progressItems.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 border-t border-gray-200">
                          <p className="mb-3">Belum ada progress items untuk {progressMain.opmName}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProgressMainId(progressMain.opmId);
                              setShowAddProgress(true);
                            }}
                            className="px-4 py-2 bg-primaryColor text-white text-sm rounded-lg hover:bg-primaryColor/90"
                          >
                            Tambah Progress Item Pertama
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 border-t border-gray-200 pt-4">
                          <h4 className="font-medium text-gray-700">Progress Items ({progressItems.length})</h4>
                          {progressItems.map((progress, pIndex) => {
                            const progressDetails = orderProgressDetails[progress.opId] || [];
                            const totalFinished = progressDetails.reduce((sum, detail) => sum + (detail.opdAmount || 0), 0);
                            const itemProgress = progress.opAmount > 0 ? Math.round((totalFinished / progress.opAmount) * 100) : 0;
                            
                            return (
                              <div key={progress.opId || pIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-lg">Progress Item #{pIndex + 1}</h5>
                                    <div className="text-sm text-gray-600 mt-1">
                                      <span className="inline-flex items-center gap-4">
                                        <span>Target: {progress.opAmount}</span>
                                        <span>Selesai: {totalFinished}</span>
                                        <span className={`font-medium ${itemProgress === 100 ? 'text-primaryColor' : 'text-secondaryColor'}`}>
                                          {itemProgress}%
                                        </span>
                                      </span>
                                    </div>
                                    {/* Progress bar for individual item */}
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                      <div 
                                        className="h-2 rounded-full transition-all duration-300 bg-primaryColor"
                                        style={{ width: `${itemProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => {
                                        setSelectedProgressId(progress.opId);
                                        setShowAddProgressDetail(true);
                                      }}
                                      className="text-sm px-3 py-1 bg-primaryColor text-white rounded hover:bg-primaryColor/90 flex items-center gap-1"
                                      title="Tambah Finished Item"
                                    >
                                      <PlusIcon className="w-3 h-3" />
                                      Tambah Detail
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProgress(progress.opId)}
                                      className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                      title="Hapus Progress"
                                    >
                                      <TrashIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                                  <div>
                                    <span className="font-medium">Progress ID:</span> {progress.opId}
                                  </div>
                                  <div>
                                    <span className="font-medium">Deadline:</span> {formatDateTime(progress.opDeadlineAt)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Assigned User:</span> {
                                      users.find(u => u.uId === progress.uId)?.uName || progress.uId
                                    }
                                  </div>
                                </div>
                                
                                {/* Add Progress Detail Form */}
                                {showAddProgressDetail && selectedProgressId === progress.opId && (
                                  <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50">
                                    <h6 className="font-medium text-green-800 mb-3">Tambah Finished Item</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Jumlah Selesai *</label>
                                        <input
                                          type="number"
                                          value={newProgressDetail.opdAmount}
                                          onChange={(e) => setNewProgressDetail({...newProgressDetail, opdAmount: e.target.value})}
                                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                          placeholder="Jumlah yang sudah selesai"
                                          max={progress.opAmount}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Waktu Selesai *</label>
                                                                                  <input
                                            type="datetime-local"
                                            value={newProgressDetail.opdFinishedAt}
                                            onChange={(e) => setNewProgressDetail({...newProgressDetail, opdFinishedAt: e.target.value})}
                                            max={new Date().toISOString().slice(0, 16)}
                                            onKeyDown={(e) => e.preventDefault()}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                          />
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                      <button
                                        onClick={handleAddProgressDetail}
                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                                        disabled={saving}
                                      >
                                        {saving ? 'Menyimpan...' : 'Simpan'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowAddProgressDetail(false);
                                          setSelectedProgressId(null);
                                          setNewProgressDetail({opdAmount: '', opdFinishedAt: ''});
                                        }}
                                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                                        disabled={saving}
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Progress Details (Finished Items) */}
                                {progressDetails.length > 0 ? (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <h6 className="font-medium text-green-700">
                                        Finished Items ({progressDetails.length})
                                      </h6>

                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {progressDetails.map((detail, dIndex) => (
                                        <div key={detail.opdId || dIndex} className="bg-green-50 border border-green-200 rounded p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-green-700 text-sm">
                                              Item #{dIndex + 1}
                                            </span>
                                            <div className="flex gap-1">
                                              <button
                                                onClick={() => {
                                                  setSelectedProgressDetailId(detail.opdId);
                                                  setSelectedProgressId(progress.opId);
                                                  setEditProgressDetail({
                                                    opdId: detail.opdId,
                                                    opdAmount: detail.opdAmount,
                                                    opdFinishedAt: detail.opdFinishedAt ? detail.opdFinishedAt.slice(0, 16) : ''
                                                  });
                                                  setShowEditProgressDetail(true);
                                                }}
                                                className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                title="Edit"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setSelectedProgressId(progress.opId);
                                                  handleDeleteProgressDetail(detail.opdId);
                                                }}
                                                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                title="Hapus"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </div>
                                          <div className="text-xs text-green-600">
                                            <p><span className="font-medium">Amount:</span> {detail.opdAmount}</p>
                                            <p><span className="font-medium">Finished:</span> {formatDateTime(detail.opdFinishedAt)}</p>
                                          </div>
                                          
                                          {/* Edit Progress Detail Form */}
                                          {showEditProgressDetail && selectedProgressDetailId === detail.opdId && (
                                            <div className="mt-3 pt-3 border-t border-yellow-200">
                                              <h6 className="font-medium text-yellow-800 mb-2 text-sm">Edit Finished Item</h6>
                                              <div className="space-y-2">
                                                <div>
                                                  <label className="block text-xs font-medium mb-1">Jumlah Selesai *</label>
                                                  <input
                                                    type="number"
                                                    value={editProgressDetail.opdAmount}
                                                    onChange={(e) => setEditProgressDetail({...editProgressDetail, opdAmount: e.target.value})}
                                                    className="w-full p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                                    required
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium mb-1">Waktu Selesai *</label>
                                                  <input
                                                    type="datetime-local"
                                                    value={editProgressDetail.opdFinishedAt}
                                                    onChange={(e) => setEditProgressDetail({...editProgressDetail, opdFinishedAt: e.target.value})}
                                                    className="w-full p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                                    required
                                                  />
                                                </div>
                                              </div>
                                              <div className="flex gap-1 mt-2">
                                                <button
                                                  onClick={handleEditProgressDetail}
                                                  className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 disabled:opacity-50"
                                                  disabled={saving}
                                                >
                                                  {saving ? 'Saving...' : 'Update'}
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setShowEditProgressDetail(false);
                                                    setSelectedProgressDetailId(null);
                                                    setEditProgressDetail({opdId: '', opdAmount: '', opdFinishedAt: ''});
                                                  }}
                                                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                  disabled={saving}
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                                    <p className="text-gray-400 text-sm mb-2">Belum ada finished items</p>                                    
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Mockup Image Popup Modal */}
          {showMockupPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-black">Mockup Image</h3>
                  <button
                    onClick={() => {
                      setShowMockupPopup(false);
                      setSelectedMockupImage('');
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={selectedMockupImage}
                    alt="Mockup Preview"
                    className="max-w-full max-h-[70vh] object-contain rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditOrder;