import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import FamilyMembers from './pages/FamilyMembers';
import AddFamilyMember from './pages/AddFamilyMember';
import Profile from './pages/Profile';
import NursingServices from './pages/NursingServices';
import ScheduleDateTime from './pages/ScheduleDateTime';
import UploadPrescription from './pages/UploadPrescription';
import PrescriptionReview from './pages/PrescriptionReview';
import NurseAssignment from './pages/NurseAssignment';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import ServiceTracking from './pages/ServiceTracking';
import Emergency from './pages/Emergency';
import Notifications from './pages/Notifications';
import MedicationReminders from './pages/MedicationReminders';
import AddMedication from './pages/AddMedication';
import OrderMedicines from './pages/OrderMedicines';
import AIHealthAssistant from './pages/AIHealthAssistant';
import HealthLogTrends from './pages/HealthLogTrends';
import LabTests from './pages/LabTests';
import HealthWallet from './pages/HealthWallet';
import ClaimsTracker from './pages/ClaimsTracker';
import MembershipPlans from './pages/MembershipPlans';
import HealthInsurance from './pages/HealthInsurance';
import TreatmentPackages from './pages/TreatmentPackages';
import HealthCheckupPackages from './pages/HealthCheckupPackages';
import EditProfile from './pages/EditProfile';
import NurseProfile from './pages/NurseProfile';
import DoctorProfile from './pages/DoctorProfile';
import NurseVerificationForm from './pages/NurseVerificationForm';
import NurseVerificationStatus from './pages/NurseVerificationStatus';
import AdminProfile from './pages/AdminProfile';
import Help from './pages/Help';
import Settings from './pages/Settings';
import Vitals from './pages/Vitals';
import HealthRecords from './pages/HealthRecords';

import { LoginDoctor, LoginPatient, LoginNurse, LoginAdmin } from './pages/Logins';
import LandingPage from './pages/LandingPage';
import PatientLogin from './pages/PatientLogin';
import DoctorLogin from './pages/DoctorLogin';
import NurseLogin from './pages/NurseLogin';
import AdminLogin from './pages/AdminLogin';
import InventoryManagement from './pages/InventoryManagement';
import IVFluidServices from './pages/IVFluidServices';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorConsult from './pages/DoctorConsult';
import IssuePrescription from './pages/IssuePrescription';
import PrescriptionDetail from './pages/PrescriptionDetail';
import NurseDashboard from './pages/NurseDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NurseAddNotes from './pages/NurseAddNotes';
import DoctorAddNotes from './pages/DoctorAddNotes';
import RateService from './pages/RateService';
import EmergencyBooking from './pages/EmergencyBooking';
import ManageAddresses from './pages/ManageAddresses';
import AddAddress from './pages/AddAddress';
import PackageManagement from './pages/PackageManagement';
import StaffManagement from './pages/StaffManagement';
import RevenueReports from './pages/RevenueReports';
import MedicalStore from './pages/MedicalStore';
import Cart from './pages/Cart';
import StoreCheckout from './pages/StoreCheckout';
import OrderTracking from './pages/OrderTracking';
import Ambulance from './pages/Ambulance';
import NearbyHospitals from './pages/NearbyHospitals';
import InsuranceApplication from './pages/InsuranceApplication';
import PatientPortalPage from './pages/PatientPortalPage';
import DoctorPortalPage from './pages/DoctorPortalPage';
import NursePortalPage from './pages/NursePortalPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DoctorVerificationForm from './pages/DoctorVerificationForm';
import DoctorVerificationStatus from './pages/DoctorVerificationStatus';

function App() {
  // Initialize dark mode from localStorage
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes - Dedicated per-role login pages */}
          <Route path="/login/patient" element={<PatientLogin />} />
          <Route path="/login/doctor" element={<DoctorLogin />} />
          <Route path="/login/nurse" element={<NurseLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Legacy role selection - redirect to landing page */}
          <Route path="/role-selection" element={<Navigate to="/" replace />} />

          {/* Portal Info Pages */}
          <Route path="/portal/patient" element={<PatientPortalPage />} />
          <Route path="/portal/doctor" element={<DoctorPortalPage />} />
          <Route path="/portal/nurse" element={<NursePortalPage />} />
          <Route path="/portal/admin" element={<AdminPortalPage />} />

          {/* Doctor Portal Routes */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-consult" element={<DoctorConsult />} />
          <Route path="/doctor/issue-prescription/:consultId" element={<IssuePrescription />} />
          <Route path="/doctor/prescription/:id" element={<PrescriptionDetail />} />
          <Route path="/doctor/verify" element={<DoctorVerificationForm />} />
          <Route path="/doctor/status" element={<DoctorVerificationStatus />} />

          {/* Nurse Portal Routes */}
          <Route path="/nurse/verify" element={<NurseVerificationForm />} />
          <Route path="/nurse/status" element={<NurseVerificationStatus />} />
          <Route path="/nurse/dashboard" element={<NurseDashboard />} />
          <Route path="/nurse/profile" element={<NurseProfile />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/help" element={<Help />} />

          {/* Admin Portal Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          <Route path="/nurse/add-notes/:assignmentId" element={<NurseAddNotes />} />
          <Route path="/doctor/add-notes/:prescriptionId" element={<DoctorAddNotes />} />
          <Route path="/doctor/prescription/:id" element={<PrescriptionDetail />} />
          <Route path="/rate-service" element={<RateService />} />
          <Route path="/emergency" element={<EmergencyBooking />} />
          <Route path="/manage-addresses" element={<ManageAddresses />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/package-management" element={<PackageManagement />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/revenue-reports" element={<RevenueReports />} />
          <Route path="/store" element={<MedicalStore />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/store-checkout" element={<StoreCheckout />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/ambulance" element={<Ambulance />} />
          <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
          <Route path="/treatment-packages" element={<TreatmentPackages />} />

          {/* Main app routes with layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/services" element={<Services />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/family-members" element={<FamilyMembers />} />
            <Route path="/add-family-member" element={<AddFamilyMember />} />
          </Route>

          {/* Booking Flow - No Layout */}
          <Route path="/nursing-services" element={<NursingServices />} />
          <Route path="/schedule-datetime" element={<ScheduleDateTime />} />
          <Route path="/upload-prescription" element={<UploadPrescription />} />
          <Route path="/prescription-review" element={<PrescriptionReview />} />
          <Route path="/nurse-assignment" element={<NurseAssignment />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/service-tracking" element={<ServiceTracking />} />
          <Route path="/emergency-info" element={<Emergency />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Medication Management - No Layout */}
          <Route path="/medication-reminders" element={<MedicationReminders />} />
          <Route path="/add-medication" element={<AddMedication />} />
          <Route path="/order-medicines" element={<OrderMedicines />} />

          {/* Health & Wellness - No Layout */}
          <Route path="/ai-health-assistant" element={<AIHealthAssistant />} />
          <Route path="/health-log-trends" element={<HealthLogTrends />} />
          <Route path="/lab-tests" element={<LabTests />} />
          <Route path="/health-wallet" element={<HealthWallet />} />

          {/* Advanced Features - No Layout */}
          <Route path="/claims-tracker" element={<ClaimsTracker />} />
          <Route path="/membership-plans" element={<MembershipPlans />} />
          <Route path="/health-insurance" element={<HealthInsurance />} />
          <Route path="/insurance-application" element={<InsuranceApplication />} />
          <Route path="/treatment-packages" element={<TreatmentPackages />} />
          <Route path="/health-checkup-packages" element={<HealthCheckupPackages />} />

          {/* Mobile Health & Wellness - No Layout */}
          <Route path="/iv-fluid-services" element={<IVFluidServices />} />

          {/* Profile & Settings Routes */}
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/vitals" element={<Vitals />} />
          <Route path="/health-records" element={<HealthRecords />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
