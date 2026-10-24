
import { Routes, Route } from "react-router-dom";

// ============================================================
// PUBLIC WEBSITE
// ============================================================

import HomePage from "./features/public/home/HomePage";
import StaticPage from "./features/public/StaticPage";
import StudentInitiativePage from "./features/public/StudentInitiativePage";
import LibraryPage from "./features/public/library/LibraryPage";
import DepartmentPage from "./features/public/departments/DepartmentPage";
import FacilitiesPage from "./features/public/FacilitiesPage";
import EContentsPage from "./features/public/accessibility/EContentsPage";
import Alumni from "./features/public/accessibility/Alumni";
import NCC from "./features/public/accessibility/NCC";
import Sports from "./features/public/accessibility/Sports";
import CulturalActivity from "./features/public/accessibility/CulturalActivity";
import CareerGuidance from "./features/public/accessibility/CareerGuidance";
import WomensEmpowerment from "./features/public/accessibility/WomensEmpowerment";
import ScreenReader from "./features/public/accessibility/ScreenReader";
import CommitteePage from "./features/public/CommitteePage";
import ManagementCommitteePage from "./features/public/ManagementCommitteePage";

// ============================================================
// PUBLIC NAAC / IQAC
// ============================================================

import Naac from "./features/public/naac/Naac";
import NaacPage from "./features/public/naac/NaacPage";
import NaacCriterionPage from "./features/public/naac/NaacCriterionPage";
import ExtensionProfile from "./features/public/naac/ExtensionProfile";
import CriteriaExtensionDocuments from "./features/public/naac/CriteriaExtensionDocuments";
import AqarPage from "./features/public/naac/AqarPage";
import BestPractices from "./features/public/naac/BestPractices";
import IQAC from "./features/public/naac/IQAC";

// ============================================================
// ADMIN LAYOUT / GENERAL
// ============================================================

import AdminLayout from "./pages/public/admin/AdminLayout";
import AdminDashboard from "./pages/public/admin/AdminDashboard";
import AdminHomepage from "./pages/public/admin/AdminHomepage";
import FooterAdmin from "./pages/public/admin/footer/Footer";
import SitePagesAdmin from "./pages/public/admin/SitePagesAdmin";
import FacilitiesAdmin from "./pages/public/admin/FacilitiesAdmin";
import AlumniAdmin from "./pages/public/admin/accessibility/AlumniAdmin";
import StudentActivitiesAdmin from "./pages/public/admin/accessibility/StudentActivitiesAdmin";
import ScreenReaderAdmin from "./pages/public/admin/accessibility/ScreenReaderAdmin";
import StudentInitiativeAdmin from "./pages/public/admin/accessibility/StudentInitiativeAdmin";

// NCC Admin
// Create this component at the path below if it does not exist yet.
import NCCAdmin from "./pages/public/admin/accessibility/NCCAdmin";

// ============================================================
// ADMIN HOMEPAGE
// ============================================================

import CollegeHeader from "./pages/public/admin/homepage/CollegeHeader";
import HeroSlider from "./pages/public/admin/homepage/HeroSlider";
import HomeStatistics from "./pages/public/admin/homepage/HomeStatistics";
import HomeWelcome from "./pages/public/admin/homepage/HomeWelcome";
import AboutCollege from "./pages/public/admin/homepage/AboutCollege";
import HomeEvents from "./pages/public/admin/homepage/HomeEvents";
import Achievements from "./pages/public/admin/homepage/Achievements";
import HomeYoutube from "./pages/public/admin/homepage/HomeYoutube";
import HomePlacements from "./pages/public/admin/homepage/HomePlacements";
import HomeGallery from "./pages/public/admin/homepage/HomeGallery";
import QuickLinks from "./pages/public/admin/homepage/QuickLinks";
import BreakingNews from "./pages/public/admin/homepage/BreakingNews";
import NewsNotices from "./pages/public/admin/homepage/NewsNotices";
import BottomInstitutional from "./pages/public/admin/homepage/BottomInstitutional";

// ============================================================
// ADMIN DEPARTMENTS
// ============================================================

import DepartmentForm from "./pages/public/admin/department/DepartmentForm";
import Department from "./pages/public/admin/department/Departments";
import DepartmentCrudPage from "./pages/public/admin/department/DepartmentCrudPage";

// ============================================================
// ADMIN NAAC / IQAC
// ============================================================

import NaacAdmin from "./pages/public/admin/naac/NaacAdmin";
import ExtensionProfileAdmin from "./pages/public/admin/naac/ExtensionProfileAdmin";
import CriteriaExtensionDocumentsAdmin from "./pages/public/admin/naac/CriteriaExtensionDocumentsAdmin";
import BestPracticesAdmin from "./pages/public/admin/naac/BestPracticesAdmin";
import IQACAdmin from "./pages/public/admin/naac/IQACAdmin";
import CommitteeDocumentsAdmin from "./pages/public/admin/committees/CommitteeDocumentsAdmin";
import ManagementCommitteesAdmin from "./pages/public/admin/committees/ManagementCommitteesAdmin";

// ============================================================
// APP ROUTES
// ============================================================

function App() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC WEBSITE
      ====================================================== */}

      <Route path="/" element={<HomePage />} />

      {/* About */}
      <Route path="/about" element={<StaticPage pageKey="about" />} />
      <Route path="/about/founder" element={<StaticPage pageKey="founder" />} />
      <Route path="/about/chairman" element={<StaticPage pageKey="chairman" />} />
      <Route path="/about/principal" element={<StaticPage pageKey="principal" />} />
      <Route path="/about/mission-vision" element={<StaticPage pageKey="mission-vision" />} />
      <Route path="/about/legacy" element={<StaticPage pageKey="legacy" />} />

      <Route
        path="/about/governing-management-committee"
        element={<ManagementCommitteePage committeeKey="governing-management" />}
      />
      <Route
        path="/about/local-management-committee"
        element={<ManagementCommitteePage committeeKey="local-management" />}
      />

      {/* Academics and Admissions */}
      <Route path="/programmes" element={<StaticPage pageKey="programmes" />} />
      <Route path="/academics/programmes" element={<StaticPage pageKey="academics-programmes" />} />
      <Route path="/academics/calendar" element={<StaticPage pageKey="academics-calendar" />} />
      <Route path="/admissions" element={<StaticPage pageKey="admissions" />} />
      <Route path="/admissions/process" element={<StaticPage pageKey="admissions-process" />} />
      <Route path="/examinations" element={<StaticPage pageKey="examinations" />} />
      <Route path="/timetable" element={<StaticPage pageKey="timetable" />} />
      <Route path="/results" element={<StaticPage pageKey="results" />} />

      {/* General pages */}
      <Route path="/gallery" element={<StaticPage pageKey="gallery" />} />
      <Route path="/useful-links" element={<StaticPage pageKey="useful-links" />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/facilities" element={<FacilitiesPage />} />
      <Route path="/research" element={<StaticPage pageKey="research" />} />
      <Route path="/downloads" element={<StaticPage pageKey="downloads" />} />

      {/* ======================================================
          STUDENT'S ERA
      ====================================================== */}

      <Route path="/students-era" element={<StaticPage pageKey="students-era" />} />

      <Route
        path="/students-era/ncc"
        element={<StudentInitiativePage type="ncc" />}
      />

      <Route
        path="/students-era/nss"
        element={<StudentInitiativePage type="nss" />}
      />

      <Route
        path="/students-era/cultural-activities"
        element={<StaticPage pageKey="students-era-cultural-activities" />}
      />

      <Route
        path="/students-era/womens-empowerment"
        element={<StaticPage pageKey="students-era-womens-empowerment" />}
      />

      <Route
        path="/students-era/sports"
        element={<StaticPage pageKey="students-era-sports" />}
      />

      <Route
        path="/students-era/gym"
        element={<StaticPage pageKey="students-era-gym" />}
      />

      <Route
        path="/students-era/career-guidance"
        element={<StaticPage pageKey="students-era-career-guidance" />}
      />

      <Route
        path="/students-era/seminars"
        element={<StaticPage pageKey="students-era-seminars" />}
      />

      <Route
        path="/students-era/placements"
        element={<StaticPage pageKey="students-era-placements" />}
      />

      {/* Existing standalone accessibility routes */}
      <Route path="/alumni" element={<Alumni />} />
      <Route path="/e-contents" element={<EContentsPage />} />
      <Route path="/econtents" element={<EContentsPage />} />
      <Route path="/ncc" element={<NCC />} />
      <Route path="/sports" element={<Sports />} />
      <Route path="/cultural-activity" element={<CulturalActivity />} />
      <Route path="/career-guidance" element={<CareerGuidance />} />
      <Route path="/womens-empowerment" element={<WomensEmpowerment />} />
      <Route path="/screen-reader" element={<ScreenReader />} />

      {/* ======================================================
          DEPARTMENTS
      ====================================================== */}

      <Route path="/departments" element={<Department />} />
      <Route path="/departments/:slug" element={<DepartmentPage />} />

      {/* ======================================================
          NAAC
      ====================================================== */}

      <Route path="/naac" element={<Naac />} />
      <Route path="/naac/criterion-1" element={<StaticPage pageKey="naac-criteria" />} />
      <Route path="/naac/criteria" element={<NaacPage />} />
      <Route path="/naac/criteria/:slug" element={<NaacCriterionPage />} />
      <Route path="/naac/ssr" element={<StaticPage pageKey="naac-ssr" />} />
      <Route path="/naac/dvv" element={<StaticPage pageKey="naac-dvv" />} />
      <Route path="/naac/documents" element={<StaticPage pageKey="naac-documents" />} />
      <Route path="/naac/certificates" element={<StaticPage pageKey="naac-certificates" />} />
      <Route path="/naac/affiliation" element={<StaticPage pageKey="naac-affiliation" />} />
      <Route path="/naac/best-practices" element={<BestPractices />} />
      <Route path="/naac/aqar" element={<AqarPage />} />
      <Route path="/extension-profile" element={<ExtensionProfile />} />
      <Route path="/extension-documents" element={<CriteriaExtensionDocuments />} />

      {/* ======================================================
          IQAC
      ====================================================== */}

      <Route path="/iqac" element={<StaticPage pageKey="iqac-about" />} />
      <Route path="/iqac/about" element={<StaticPage pageKey="iqac-about" />} />
      <Route path="/iqac/vision-mission" element={<StaticPage pageKey="iqac-vision-mission" />} />
      <Route path="/iqac/committee" element={<StaticPage pageKey="iqac-committee" />} />
      <Route path="/iqac/coordinator" element={<StaticPage pageKey="iqac-coordinator" />} />
      <Route path="/iqac/meetings" element={<IQAC />} />
      <Route path="/iqac/minutes" element={<IQAC />} />
      <Route path="/iqac/action-taken" element={<StaticPage pageKey="iqac-action-taken" />} />
      <Route path="/iqac/best-practices" element={<StaticPage pageKey="iqac-best-practices" />} />
      <Route path="/iqac/distinctiveness" element={<StaticPage pageKey="iqac-distinctiveness" />} />
      <Route path="/iqac/aaa" element={<StaticPage pageKey="iqac-aaa" />} />
      <Route path="/iqac/green-audit" element={<StaticPage pageKey="iqac-green-audit" />} />
      <Route path="/iqac/energy-audit" element={<StaticPage pageKey="iqac-energy-audit" />} />
      <Route path="/iqac/gender-audit" element={<StaticPage pageKey="iqac-gender-audit" />} />
      <Route path="/iqac/quality-initiatives" element={<StaticPage pageKey="iqac-quality-initiatives" />} />
      <Route path="/iqac/activities" element={<StaticPage pageKey="iqac-activities" />} />
      <Route path="/iqac/annual-reports" element={<StaticPage pageKey="iqac-annual-reports" />} />
      <Route path="/iqac/archive" element={<StaticPage pageKey="iqac-archive" />} />

      {/* ======================================================
          ACCREDITATION AND DISCLOSURE
      ====================================================== */}

      <Route path="/accreditation/nirf" element={<StaticPage pageKey="accreditation-nirf" />} />
      <Route path="/accreditation/aishe" element={<StaticPage pageKey="accreditation-aishe" />} />
      <Route path="/accreditation/ugc" element={<StaticPage pageKey="accreditation-ugc" />} />
      <Route path="/accreditation/affiliation" element={<StaticPage pageKey="accreditation-affiliation" />} />
      <Route path="/accreditation/approvals" element={<StaticPage pageKey="accreditation-approvals" />} />

      <Route path="/mandatory-disclosure" element={<StaticPage pageKey="mandatory-disclosure" />} />
      <Route path="/mandatory-disclosure/rti" element={<StaticPage pageKey="mandatory-disclosure-rti" />} />
      <Route path="/mandatory-disclosure/profile" element={<StaticPage pageKey="mandatory-disclosure-profile" />} />
      <Route path="/mandatory-disclosure/policies" element={<StaticPage pageKey="mandatory-disclosure-policies" />} />
      <Route path="/mandatory-disclosure/code-of-conduct" element={<StaticPage pageKey="mandatory-disclosure-code-of-conduct" />} />
      <Route path="/mandatory-disclosure/service-rules" element={<StaticPage pageKey="mandatory-disclosure-service-rules" />} />
      <Route path="/mandatory-disclosure/hr-policy" element={<StaticPage pageKey="mandatory-disclosure-hr-policy" />} />

      {/* ======================================================
          COMMITTEES
      ====================================================== */}

      <Route path="/committees/iqac" element={<CommitteePage slug="iqac" />} />
      <Route path="/committees/anti-ragging" element={<CommitteePage slug="anti-ragging" />} />
      <Route path="/committees/grievance" element={<CommitteePage slug="grievance" />} />
      <Route path="/committees/icc" element={<CommitteePage slug="icc" />} />
      <Route path="/committees/sc-st" element={<CommitteePage slug="sc-st" />} />
      <Route path="/committees/obc" element={<CommitteePage slug="obc" />} />
      <Route path="/committees/minority" element={<CommitteePage slug="minority" />} />
      <Route path="/committees/divyang" element={<CommitteePage slug="divyang" />} />
      <Route path="/committees/student-welfare" element={<CommitteePage slug="student-welfare" />} />

      {/* ======================================================
          ADMIN - PAGES OUTSIDE ADMIN LAYOUT
      ====================================================== */}

      <Route path="/admin/screen-reader" element={<ScreenReaderAdmin />} />

      {/* ======================================================
          ADMIN LAYOUT
          Parent URL: /admin
      ====================================================== */}

      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<AdminDashboard />} />

        {/* General admin pages */}
        <Route path="pages" element={<SitePagesAdmin />} />
        <Route path="facilities" element={<FacilitiesAdmin />} />
        <Route path="gallery" element={<HomeGallery />} />
        <Route path="footer" element={<FooterAdmin />} />

        {/* Header and college identity */}
        <Route path="header" element={<CollegeHeader />} />
        <Route path="college-status" element={<BottomInstitutional />} />

        {/* Homepage */}
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="homepage/CollegeHeader" element={<CollegeHeader />} />
        <Route path="homepage/hero-slider" element={<HeroSlider />} />
        <Route path="homepage/statistics" element={<HomeStatistics />} />
        <Route path="homepage/welcome" element={<HomeWelcome />} />
        <Route path="homepage/aboutcollege" element={<AboutCollege />} />
        <Route path="homepage/events" element={<HomeEvents />} />
        <Route path="homepage/achievements" element={<Achievements />} />
        <Route path="homepage/youtube" element={<HomeYoutube />} />
        <Route path="homepage/placements" element={<HomePlacements />} />
        <Route path="homepage/gallery" element={<HomeGallery />} />
        <Route path="homepage/quick-links" element={<QuickLinks />} />
        <Route path="homepage/breaking-news" element={<BreakingNews />} />
        <Route path="homepage/news-notices" element={<NewsNotices />} />
        <Route path="homepage/BottomInstitutional" element={<BottomInstitutional />} />

        {/* Departments */}
        <Route path="departments" element={<Department />} />
        <Route path="departments/new" element={<DepartmentForm />} />
        <Route path="departments/:id" element={<DepartmentForm />} />
        <Route path="department-profiles" element={<DepartmentCrudPage resource="profiles" />} />
        <Route path="department-programmes" element={<DepartmentCrudPage resource="programmes" />} />
        <Route path="department-sections" element={<DepartmentCrudPage resource="sections" />} />
        <Route path="department-faculty" element={<DepartmentCrudPage resource="faculty" />} />

        {/* ====================================================
    STUDENTS INITIATIVES
==================================================== */}

        <Route path="student-initiatives/ncc" element={<NCCAdmin />} />

        <Route path="student-initiatives" element={<StudentInitiativeAdmin />} />

        {/* Existing student activities admin */}
        <Route path="student-activities" element={<StudentActivitiesAdmin />} />

        {/* Alumni
<Route
  path="accessibility/alumni"
  element={<AlumniAdmin />}
/> */}

        {/* ====================================================
            NAAC
        ==================================================== */}

        <Route path="accreditation/criteria" element={<NaacAdmin />} />
        <Route path="naac" element={<NaacAdmin />} />
        <Route path="accreditation" element={<NaacAdmin />} />
        <Route path="extension-profile" element={<ExtensionProfileAdmin />} />
        <Route path="extension-documents" element={<CriteriaExtensionDocumentsAdmin />} />
        <Route path="naac/best-practices" element={<BestPracticesAdmin />} />

        {/* ====================================================
            COMMITTEES
        ==================================================== */}

        <Route path="committees" element={<CommitteeDocumentsAdmin />} />
        <Route path="management-committees" element={<ManagementCommitteesAdmin />} />

        {/* ====================================================
            IQAC
        ==================================================== */}

        <Route path="iqac" element={<IQACAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;