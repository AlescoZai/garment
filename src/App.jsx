import { Routes, Route } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Catalog from './pages/Catalog';
import ProductDetail from "./pages/ProductDetail";
import Order from './pages/Order';
import PaymentAwait from './pages/PaymentAwait';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentDeclined from './pages/PaymentDeclined';
import Tracker from './pages/Tracker';
import HistoryOrder from './pages/HistoryOrder';
import AdminDashboard from './admin/pages/Dashboard';
import AdminRoute from './components/AdminRoute';
import WarehouseList from './admin/pages/Inventory/WarehouseList';
import CategoryList from './admin/pages/Inventory/CategoryList';
import SubCategoryList from './admin/pages/Inventory/SubCategoryList';
import InventoryList from './admin/pages/Inventory/InventoryList';
import AddInventory from './admin/pages/Inventory/AddInventory';
import EditInventory from './admin/pages/Inventory/EditInventory';
import NotFound from './pages/NotFound';
import InventoryRelocation from './admin/pages/Inventory/InventoryRelocation';
import CatalogueCategoryList from './admin/pages/Catalogue/CategoryList';
import CatalogueSubCategoryList from './admin/pages/Catalogue/SubCategoryList';
import CatalogueList from './admin/pages/Catalogue/CatalogueList';
import AddCatalogue from './admin/pages/Catalogue/AddCatalogue';
import EditCatalogue from './admin/pages/Catalogue/EditCatalogue';
import OrderList from './admin/pages/Order/OrderList';
import OrderDetail from './admin/pages/Order/OrderDetail';
import EditOrder from './admin/pages/Order/EditOrder';
import EditRabOrder from './admin/pages/Order/EditRabOrder';
import AddOrder from './admin/pages/Order/AddOrder';
import TokenDebug from './components/TokenDebug';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/order" element={<Order />} />
        <Route path="/payment-await" element={<PaymentAwait />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-declined" element={<PaymentDeclined />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/history-order" element={<HistoryOrder />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/inventory/list" element={<AdminRoute><InventoryList /></AdminRoute>} />
        <Route path="/admin/inventory/add" element={<AdminRoute><AddInventory /></AdminRoute>} />
        <Route path="/admin/inventory/edit/:id" element={<AdminRoute><EditInventory /></AdminRoute>} />
        <Route path="/admin/inventory/warehouse" element={<AdminRoute><WarehouseList /></AdminRoute>} />
        <Route path="/admin/inventory/category" element={<AdminRoute><CategoryList /></AdminRoute>} />
        <Route path="/admin/inventory/subcategory" element={<AdminRoute><SubCategoryList /></AdminRoute>} />
        <Route path="/admin/inventory/relocation" element={<AdminRoute><InventoryRelocation /></AdminRoute>} />
        <Route path="/admin/catalogue/category" element={<AdminRoute><CatalogueCategoryList /></AdminRoute>} />
        <Route path="/admin/catalogue/subcategory" element={<AdminRoute><CatalogueSubCategoryList /></AdminRoute>} />
        <Route path="/admin/catalogue/list" element={<AdminRoute><CatalogueList /></AdminRoute>} />
        <Route path="/admin/catalogue/add" element={<AdminRoute><AddCatalogue /></AdminRoute>} />
        <Route path="/admin/catalogue/edit/:id" element={<AdminRoute><EditCatalogue /></AdminRoute>} />
        <Route path="/admin/order/list" element={<AdminRoute><OrderList /></AdminRoute>} />
        <Route path="/admin/order/add" element={<AdminRoute><AddOrder /></AdminRoute>} />
        <Route path="/admin/order/detail/:oId" element={<AdminRoute><OrderDetail /></AdminRoute>} />
        <Route path="/admin/order/edit/:oId" element={<AdminRoute><EditOrder /></AdminRoute>} />
        <Route path="/admin/order/rab/:orderId" element={<AdminRoute><EditRabOrder /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Token Debug Component - Hanya tampil di development */}
      {import.meta.env.MODE === 'development' && <TokenDebug />}
    </>
  );
}

export default App;
