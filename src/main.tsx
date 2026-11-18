import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { init } from "./lib/store";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import {
  Services, ServiceDetail, BookMarketing, WhoWeHelp, AudienceDetail, Experts, BecomeExpert,
  VisibilityCheck, About, StartProject, Legal, NotFound,
} from "./pages/Pages";
import {
  Login, DashboardLayout, Overview, Invoices, InvoiceEditor, InvoiceView, ExpertsAdmin, InquiriesAdmin, SettingsAdmin,
} from "./dashboard/Dashboard";
import { WorkDirectory, ProjectStudy, ResourceDirectory, Article, ToolDirectory, Checklist } from "./pages/Library";
import { services } from "./data";

init();

const dash = (
  <>
    <Route index element={<Overview />} />
    <Route path="invoices" element={<Invoices />} />
    <Route path="invoices/new" element={<InvoiceEditor />} />
    <Route path="invoices/:id" element={<InvoiceEditor />} />
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
        <Route path="/login" element={<Login />} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          {dash}
          <Route path="experts" element={<ExpertsAdmin />} />
          <Route path="inquiries" element={<InquiriesAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
        <Route path="/expert" element={<DashboardLayout role="expert" />}>{dash}</Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
