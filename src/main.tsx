import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./dashboard/PortalContext";
import { Login, RequirePermission, SetPassword, Workspace } from "./dashboard/Portal";
import { TeamAccess } from "./dashboard/TeamAccess";
import { PortfolioManager, TestimonialManager } from "./dashboard/ContentManager";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import {
  Services, ServiceDetail, BookMarketing, WhoWeHelp, AudienceDetail, Experts, BecomeExpert,
  VisibilityCheck, About, StartProject, Legal, NotFound,
} from "./pages/Pages";
import {
  Overview, Invoices, InvoiceEditor, InvoiceView, InquiriesAdmin, SettingsAdmin,
} from "./dashboard/Dashboard";
import { WorkDirectory, ProjectStudy, ResourceDirectory, Article, ToolDirectory, Checklist } from "./pages/Library";
import { services } from "./data";

const sharedRoutes = (
  <>
    <Route index element={<Overview />} />
    <Route path="portfolio" element={<RequirePermission permission="work.manage"><PortfolioManager /></RequirePermission>} />
    <Route path="testimonials" element={<RequirePermission permission="testimonials.manage"><TestimonialManager /></RequirePermission>} />
    <Route path="invoices" element={<RequirePermission permission="invoices.manage"><Invoices /></RequirePermission>} />
    <Route path="invoices/new" element={<RequirePermission permission="invoices.manage"><InvoiceEditor /></RequirePermission>} />
    <Route path="invoices/:id" element={<RequirePermission permission="invoices.manage"><InvoiceEditor /></RequirePermission>} />
    <Route path="inquiries" element={<RequirePermission permission="inquiries.manage"><InquiriesAdmin /></RequirePermission>} />
  </>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          {services.map((s) => <Route key={s.slug} path={s.route} element={<ServiceDetail slug={s.slug} />} />)}
          <Route path="/book-author-services/book-marketing" element={<BookMarketing />} />
          <Route path="/who-we-help" element={<WhoWeHelp />} />
          <Route path="/who-we-help/:slug" element={<AudienceDetail />} />
          <Route path="/work" element={<WorkDirectory />} />
          <Route path="/work/:slug" element={<ProjectStudy />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/become-an-expert" element={<BecomeExpert />} />
          <Route path="/resources" element={<ResourceDirectory />} />
          <Route path="/resources/:slug" element={<Article />} />
          <Route path="/tools" element={<ToolDirectory />} />
          <Route path="/tools/:slug" element={<Checklist />} />
          <Route path="/tools/visibility-check" element={<VisibilityCheck />} />
          <Route path="/about" element={<About />} />
          <Route path="/start-a-project" element={<StartProject />} />
          <Route path="/privacy" element={<Legal kind="privacy" />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/invoice/:id" element={<InvoiceView />} />
        <Route element={<AuthProvider><Outlet /></AuthProvider>}>
          <Route path="/login" element={<Login />} />
          <Route path="/account/password" element={<SetPassword />} />
          <Route path="/admin" element={<Workspace role="admin" />}>
            {sharedRoutes}
            <Route path="experts" element={<TeamAccess />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
          <Route path="/expert" element={<Workspace role="expert" />}>
            {sharedRoutes}
            <Route path="*" element={<Navigate to="/expert" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
