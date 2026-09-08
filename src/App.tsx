// src/App.tsx
//npm install html2canvas jspdf xlsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
// import Province from './pages/Province';
// import City from '@pages/City';
import Company from '@pages/CompanyPage';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';  // ✅ حذف type
import PersonPage from '@pages/PersonPage';
import ResearchPage from '@pages/ResearchPage';
import RfpPage from '@pages/RfpPage';
import ProposalPage from '@pages/ProposalPage';
import ProjectSubjectPage from '@pages/ProjectSubjectPage';
import ContractPage from '@pages/ContractPage';
import PaymentPage from '@pages/PaymentPage';
import PaymentTypePage from '@pages/PaymentTypePage';
import ProgressPage from '@pages/ProgressPage';
import { ContractDetailsPage } from './modules/contract';
import ResearchCommitteePage from '@pages/ResearchCommitteePage';
import SteeringCommitteePage from '@pages/SteeringCommitteePage';
import ContractDelayPage from '@pages/ContractDelayPage';
import SettlementPage from '@pages/SettlementPage';
import ProvincePage from '@pages/ProvincePage';
import CityPage from '@pages/CityPage';
import UniversityPage from '@pages/UniversityPage';
import UniversityTypePage from '@pages/UniversityTypePage';
import CommunicationPage from '@pages/CommunicationPage';
import PaymentDetailsPage from './modules/payment/components/PaymentDetails';
import ResearchDetailsPage from './modules/research/components/ResearchDetails';
import RfpDetailsPage from './modules/rfp/components/RfpDetails';
import ProposalDetailsPage from './modules/proposal/components/ProposalDetails';
import ProgressDetailsPage from './modules/progress/components/ProgressDetails';
import ResearchCommitteeDetailsPage from './modules/research-committee/components/ResearchCommitteeDetailsPage';
import SteeringCommitteeDetailsPage from './modules/steering-committee/components/SteeringCommitteeDetailsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, //  وقتی تب مرورگر فعال می‌شود، داده‌ها را به‌روز می‌کند
      staleTime: 0, //  داده‌ها همیشه fresh باشند
      gcTime: 0, // بلافاصله کش پاک شود
      // retry: 1,
      // staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="province" element={<ProvincePage />} />
            <Route path="city" element={<CityPage />} />
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="company" element={<Company />} />
            <Route path="university" element={<UniversityPage />} />
            <Route path="university-types" element={<UniversityTypePage />} />
            <Route path="person" element={<PersonPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="/research/:id" element={<ResearchDetailsPage />} />
            <Route path="/rfp" element={<RfpPage />} />
            <Route path="/rfp/:id" element={<RfpDetailsPage />} />
            <Route path="/project-subjects" element={<ProjectSubjectPage />} />
            <Route path="/proposal" element={<ProposalPage />} />
            <Route path="/proposal/:id" element={<ProposalDetailsPage />} />
            <Route path="/contract" element={<ContractPage />} />
            <Route path='/contract/:id' element={<ContractDetailsPage />} />
            <Route path="/payment-types" element={<PaymentTypePage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/:id" element={<PaymentDetailsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/progress/:id" element={<ProgressDetailsPage />} />
            <Route path="/contract-delays" element={<ContractDelayPage />} />
            <Route path="/settlements" element={<SettlementPage />} />
            <Route path="committees-research" element={<ResearchCommitteePage />} />
            <Route path="committees-research/:id" element={<ResearchCommitteeDetailsPage />} />
            <Route path="committees-steering" element={<SteeringCommitteePage />} />
            <Route path="committees-steering/:id" element={<SteeringCommitteeDetailsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            direction: 'rtl',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
//