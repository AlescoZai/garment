import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate, useParams } from 'react-router-dom';
import { getCatalogueProductById, updateCatalogueProduct, uploadCatalogueImages } from '../../../api/Catalogue/catalogue';
import { getCatalogueCategories } from '../../../api/Catalogue/catalogueCategory';
import { getCatalogueSubCategories } from '../../../api/Catalogue/catalogueSubCategory';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';

const EditCatalogue = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editedProduct, setEditedProduct] = useState({
    ccId: '',
    csId: '',
    cpName: '',
    cpDescription: '',
    cpImage: null
  });
  // Tambahkan state untuk gambar existing dan gambar baru
  const [cpImageExisting, setCpImageExisting] = useState([]); // url gambar lama
  const [cpImageNew, setCpImageNew] = useState([]); // file baru
  const [previewUrls, setPreviewUrls] = useState([]); // untuk preview gambar baru

  useEffect(() => {
    const fetchAll = async () => {
      setInitialLoading(true);
      if (!id) {
        setFormError('ID produk tidak ditemukan');
        setInitialLoading(false);
        return;
      }
      try {
        // Gunakan endpoint detail untuk mendapatkan produk berdasarkan ID
        const res = await getCatalogueProductById(id);
        const product = res.data.data;
        if (!product) {
          console.error('DEBUG: Produk dengan id', id, 'tidak ditemukan');
          setFormError('Data produk tidak ditemukan.');
          setInitialLoading(false);
          return;
        }
        setEditedProduct({
          ccId: product.ccId || '',
          csId: product.csId || '',
          cpName: product.cpName || '',
          cpDescription: product.cpDescription || '',
          cpImage: null
        });
        // Pastikan cpImageExisting selalu array (handle string/array/null)
        let images = [];
        if (Array.isArray(product.cpImage)) {
          images = product.cpImage;
        } else if (product.cpImage) {
          images = [product.cpImage];
        }
        setCpImageExisting(images);
        setCpImageNew([]);
        // Ambil kategori dan subkategori
        const [categoriesRes, subCategoriesRes] = await Promise.all([
          getCatalogueCategories({ pageLimit: 100, pageNumber: 1 }),
          getCatalogueSubCategories({ pageLimit: 100, pageNumber: 1 })
        ]);
        setCategories(Array.isArray(categoriesRes.data.data.listData) ? categoriesRes.data.data.listData : []);
        setSubCategories(Array.isArray(subCategoriesRes.data.data.listData) ? subCategoriesRes.data.data.listData : []);
      } catch (error) {
        console.error('Error fetching product:', error);
        setFormError('Gagal memuat data.');
      }
      setInitialLoading(false);
    };
    fetchAll();
  }, [id]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const filteredSubCategories = editedProduct.ccId
    ? subCategories.filter(sub => String(sub.ccId) === String(editedProduct.ccId))
    : subCategories;

  // Fungsi upload gambar baru
  async function uploadNewImages(files) {
    try {
      const imageUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await uploadCatalogueImages(formData);
          
          if (response.data && response.data.data && response.data.data.url) {
            imageUrls.push(response.data.data.url);
          } else {
            throw new Error(`Response format tidak sesuai untuk file ${file.name}`);
          }
        } catch (fileError) {
          throw new Error(`Gagal upload file ${file.name}: ${fileError.message}`);
        }
      }
      
      return imageUrls;
    } catch (error) {
      throw new Error(error.message || 'Gagal upload gambar');
    }
  }

  const handleImageNewChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validasi file
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      setFormError('Beberapa file tidak valid. Hanya file JPG, PNG, WebP dengan ukuran maksimal 5MB yang diperbolehkan.');
    } else {
      setFormError('');
    }
    
    // Cleanup previous preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create new preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    
    setCpImageNew(prev => [...prev, ...validFiles]);
  };
  const handleRemoveExistingImage = (idx) => {
    setCpImageExisting(cpImageExisting.filter((_, i) => i !== idx));
  };
  const handleRemoveNewImage = (idx) => {
    // Cleanup preview URL
    if (previewUrls[idx]) {
      URL.revokeObjectURL(previewUrls[idx]);
    }
    
    setCpImageNew(cpImageNew.filter((_, i) => i !== idx));
    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      // 1. Upload gambar baru dulu jika ada
      let newImageUrls = [];
      if (cpImageNew && cpImageNew.length > 0) {
        try {
          newImageUrls = await uploadNewImages(cpImageNew);
        } catch (uploadError) {
          setFormError(`Gagal upload gambar: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }
      
      // 2. Submit update dengan JSON (sesuai dokumentasi Swagger)
      const payload = {
        cpId: id,
        csId: editedProduct.csId,
        cpName: editedProduct.cpName,
        cpDescription: editedProduct.cpDescription,
        cpImageExisting: cpImageExisting, // array of existing URLs
        cpImageNew: newImageUrls // array of new uploaded URLs
      };
      
      console.log('Full payload:', payload);
      
      const response = await updateCatalogueProduct(payload);
      console.log('Update response:', response.data);
      navigate('/admin/catalogue/list');
    } catch (err) {
      setFormError(err.response?.data?.remark || err.message || 'Gagal mengubah produk');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1">
          <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (formError) {
    return (
      <div
      className="flex min-h-screen"
      style={{
        backgroundImage: "url('/src/assets/background-image/logobg-zumar.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
        opacity: 1
      }}
      >
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1">
          <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center py-8 text-red-500 font-semibold">{formError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage: "url('/src/assets/background-image/logobg-zumar.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
        opacity: 1
      }}
      >
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1">
        <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/catalogue/list')}
              className="flex items-center gap-2 text-primaryColor hover:text-primaryColor/80"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-8 font-montserrat">
            <h1 className="text-3xl font-bold text-center text-primaryColor mb-2">EDIT PRODUK KATALOG</h1>
            <p className="text-center text-gray-500 mb-8">Silakan edit data produk katalog di bawah ini.</p>

            <form onSubmit={handleUpdateProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex w-full flex-col">
                  <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <select
                    id="productCategory"
                    value={editedProduct.ccId}
                    onChange={e => setEditedProduct({ ...editedProduct, ccId: e.target.value, csId: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.ccId} value={cat.ccId}>{cat.ccName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex w-full flex-col">
                  <label htmlFor="productSubCategory" className="block text-sm font-medium text-gray-700 mb-1">Sub Kategori *</label>
                  <select
                    id="productSubCategory"
                    value={editedProduct.csId}
                    onChange={e => setEditedProduct({ ...editedProduct, csId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    required
                  >
                    <option value="">Pilih Sub Kategori</option>
                    {filteredSubCategories.map(sub => (
                      <option key={sub.csId} value={sub.csId}>{sub.csName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex w-full flex-col md:flex-row md:col-span-2 gap-6">
                  <div className="flex w-full flex-col md:w-1/2">
                    <div className="flex w-full flex-col mb-6">
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
                      <input
                        id="productName"
                        type="text"
                        placeholder="Nama produk"
                        value={editedProduct.cpName}
                        onChange={e => setEditedProduct({ ...editedProduct, cpName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                        required
                      />
                    </div>
                    <div className="flex w-full flex-col">
                      <label htmlFor="productImage" className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar Baru</label>
                      <input
                        id="productImage"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleImageNewChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format yang didukung: JPG, PNG, WebP. Maksimal 5MB per file.</p>
                      {/* Preview gambar existing */}
                      {cpImageExisting.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {cpImageExisting.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt={`Existing ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                              <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100">&times;</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Preview gambar baru */}
                      {cpImageNew.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {cpImageNew.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={previewUrls[idx]} alt={`Baru ${idx + 1}`} className="w-16 h-16 object-cover rounded border" />
                              <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded-full">
                                {Math.round(img.size / 1024)}KB
                              </span>
                              <button type="button" onClick={() => handleRemoveNewImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100">&times;</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full flex-col md:w-1/2">
                    <label htmlFor="productDesc" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      id="productDesc"
                      placeholder="Deskripsi produk"
                      value={editedProduct.cpDescription}
                      onChange={e => setEditedProduct({ ...editedProduct, cpDescription: e.target.value })}
                      className="w-full h-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      rows={8}
                    />
                  </div>
                </div>
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}
              <div className="flex justify-center gap-6 pt-8">
                <button
                  type="submit"
                  className="px-10 py-3 rounded-lg bg-[#4AD991] hover:bg-[#3fcf7c] text-white font-bold text-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/catalogue/list')}
                  className="px-10 py-3 rounded-lg bg-[#FB5C5C] hover:bg-[#e04a4a] text-white font-bold text-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCatalogue; 