import Layout from "../Layout.jsx";

import Homepage from "./Homepage";

import ReferKid from "./ReferKid";

import Gallery from "./Gallery";

import About from "./About";

import AdminDashboard from "./AdminDashboard";

import ProductionChecklist from "./ProductionChecklist";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsOfService from "./TermsOfService";

import Fundraising from "./Fundraising";

import DonationSuccess from "./DonationSuccess";

import TestingDashboard from "./TestingDashboard";

import Login from "./Login";

import { AuthProvider, RequireAdmin } from "@/lib/auth";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Homepage: Homepage,
    
    ReferKid: ReferKid,
    
    Gallery: Gallery,
    
    About: About,
    
    AdminDashboard: AdminDashboard,
    
    ProductionChecklist: ProductionChecklist,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsOfService: TermsOfService,
    
    Fundraising: Fundraising,
    
    DonationSuccess: DonationSuccess,
    
    TestingDashboard: TestingDashboard,
    
    Login: Login,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Homepage />} />
                
                
                <Route path="/Homepage" element={<Homepage />} />
                
                <Route path="/ReferKid" element={<ReferKid />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/AdminDashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                
                <Route path="/ProductionChecklist" element={<RequireAdmin><ProductionChecklist /></RequireAdmin>} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/Fundraising" element={<Fundraising />} />
                
                <Route path="/DonationSuccess" element={<DonationSuccess />} />
                
                <Route path="/TestingDashboard" element={<RequireAdmin><TestingDashboard /></RequireAdmin>} />
                
                <Route path="/Login" element={<Login />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <AuthProvider>
                <PagesContent />
            </AuthProvider>
        </Router>
    );
}