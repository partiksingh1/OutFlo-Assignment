import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import MessagePage from './pages/MessagePage';
import ScrapePage from './pages/ScrapePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns/create" element={<CreateCampaign />} />
            <Route path="/campaigns/edit/:id" element={<EditCampaign />} />
            <Route path="/message" element={<MessagePage />} />
            <Route path="/leads" element={<ScrapePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;