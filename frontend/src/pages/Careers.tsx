import React from "react";
import { Link } from "react-router-dom";
import { FaMotorcycle, FaStore, FaLaptopCode, FaCheckCircle, FaEnvelope } from "react-icons/fa";

const Careers: React.FC = () => {
  const openings = [
    {
      title: "Delivery Partner / Fleet Rider",
      department: "Logistics & Dispatch",
      type: "Flexible Shifts (Full/Part-Time)",
      perks: "Earn ₹40–₹80 per delivery + Weekly bonus incentives",
      description: "Deliver orders swiftly across city zones with real-time GPS routing and instant wallet payouts.",
      icon: <FaMotorcycle />,
      link: "/select-role",
      cta: "Join as Rider",
    },
    {
      title: "Restaurant Success Specialist",
      department: "Merchant Partnerships",
      type: "Full-Time (Hybrid)",
      perks: "Competitive salary + Growth incentives",
      description: "Onboard culinary partners, curate high-converting photo menus, and optimize kitchen turnaround rates.",
      icon: <FaStore />,
      link: "/add-restaurant",
      cta: "Partner With Us",
    },
    {
      title: "Backend Microservices Engineer",
      department: "Engineering",
      type: "Full-Time (Remote)",
      perks: "Equity + Comprehensive health coverage",
      description: "Scale high-concurrency Node.js / Express microservices, Redis distributed rate-limiting, and WebRTC / Socket.IO event buses.",
      icon: <FaLaptopCode />,
      link: "mailto:support.wehear@gmail.com?subject=Nomato%20Engineering%20Application",
      cta: "Apply via Email",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-4 border border-red-100">
          We Are Hiring
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Shape the future of <br />
          <span className="text-red-600">food commerce & logistics.</span>
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed text-sm sm:text-base">
          Join our mission to power seamless dining, delivery logistics, and restaurant growth with modern engineering and human care.
        </p>
      </div>

      {/* Openings Grid */}
      <div className="space-y-6 mb-16">
        {openings.map((job) => (
          <div
            key={job.title}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg">
                  {job.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                  <span className="text-xs font-semibold text-gray-500">{job.department} • {job.type}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                {job.description}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <FaCheckCircle size={10} />
                <span>{job.perks}</span>
              </div>
            </div>

            <div className="shrink-0">
              {job.link.startsWith("mailto") ? (
                <a
                  href={job.link}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-gray-800 transition inline-flex items-center gap-2"
                >
                  <FaEnvelope size={12} />
                  <span>{job.cta}</span>
                </a>
              ) : (
                <Link
                  to={job.link}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition inline-block text-center"
                >
                  {job.cta}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Careers;
