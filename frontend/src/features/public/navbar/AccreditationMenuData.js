import {
  Award,
  Landmark,
  FileCheck,
  UsersRound,
} from "lucide-react";

export const accreditationMenuData = [
  {
    title: "NAAC",
    icon: Award,

    items: [
      {
        title: "NAAC Overview",
        path: "/naac",
      },
      {
        title: "NAAC Criteria",
        path: "/naac/criteria",
      },
      {
        title: "SSR",
        path: "/naac/ssr",
      },
      {
        title: "DVV",
        path: "/naac/dvv",
      },
      {
        title: "Extension Profile",
        path: "/extension-profile",
      },
      {
        title: "Criteria Extension Documents",
        path: "/extension-documents",
      },
      {
        title: "AQAR",
        path: "/naac/aqar",
      },
    
      {
        title: "NAAC Certificates",
        path: "/naac/certificates",
      },
      {
        title: "Affiliation Documents",
        path: "/naac/affiliation",
      },
    ],
  },

  {
    title: "Recognition & Rankings",
    icon: Landmark,

    items: [
      {
        title: "NIRF Ranking",
        path: "/accreditation/nirf",
      },
      {
        title: "AISHE",
        path: "/accreditation/aishe",
      },
      {
        title: "UGC Recognition (2(f) & 12(B))",
        path: "/accreditation/ugc",
      },
      {
        title: "University Affiliation",
        path: "/accreditation/affiliation",
      },
      {
        title: "Recognition & Approvals",
        path: "/accreditation/approvals",
      },
    ],
  },

  {
    title: "Mandatory Disclosure",
    icon: FileCheck,

    items: [
      {
        title: "Mandatory Disclosure",
        path: "/mandatory-disclosure",
      },
      {
        title: "Right to Information (RTI)",
        path: "/mandatory-disclosure/rti",
      },
      {
        title: "Institution Profile",
        path: "/mandatory-disclosure/profile",
      },
      {
        title: "Policies & Manuals",
        path: "/mandatory-disclosure/policies",
      },
      {
        title: "Code of Conduct",
        path: "/mandatory-disclosure/code-of-conduct",
      },
      {
        title: "Service Rules",
        path: "/mandatory-disclosure/service-rules",
      },
      {
        title: "HR Policy",
        path: "/mandatory-disclosure/hr-policy",
      },
    ],
  },

  {
    title: "Committees",
    icon: UsersRound,

    items: [
      {
        title: "IQAC",
        path: "/committees/iqac",
      },
      {
        title: "Anti-Ragging Committee",
        path: "/committees/anti-ragging",
      },
      {
        title: "Grievance Redressal Cell",
        path: "/committees/grievance",
      },
      {
        title: "Internal Complaints Committee (ICC)",
        path: "/committees/icc",
      },
      {
        title: "SC/ST Cell",
        path: "/committees/sc-st",
      },
      {
        title: "OBC Cell",
        path: "/committees/obc",
      },
      {
        title: "Minority Cell",
        path: "/committees/minority",
      },
      {
        title: "Divyang Cell",
        path: "/committees/divyang",
      },
      {
        title: "Student Welfare Committee",
        path: "/committees/student-welfare",
      },
    ],
  },
];