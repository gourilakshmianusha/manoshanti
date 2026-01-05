
import React, { useState } from 'react';
import { LogOut, FileText, Send, Loader2, User, Activity, History, Printer } from 'lucide-react';
import { AssessmentTest, PatientDetails, User as UserType, LabReport } from '../types';
import { generateReport } from '../geminiService';

interface DashboardViewProps {
  user: UserType;
  onLogout: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, onLogout }) => {
  const [patient, setPatient] = useState<PatientDetails>({
    name: '',
    age: '',
    gender: 'Male',
    referralReason: '',
    clinicalObservations: '',
    testScores: ''
  });
  const [selectedTest, setSelectedTest] = useState<AssessmentTest>(AssessmentTest.MISIC);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<LabReport | null>(null);
  const [reportHistory, setReportHistory] = useState<LabReport[]>([]);

  const handleGenerate = async () => {
    if (!patient.name || !patient.age) {
      alert("Please fill in at least the name and age.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateReport(patient, selectedTest);
      const newReport: LabReport = {
        id: Date.now().toString(),
        patient: { ...patient },
        testType: selectedTest,
        date: new Date().toLocaleDateString(),
        summary: result.summary,
        fullReport: result.fullReport
      };
      setCurrentReport(newReport);
      setReportHistory(prev => [newReport, ...prev]);
    } catch (err) {
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setPatient({
      name: '',
      age: '',
      gender: 'Male',
      referralReason: '',
      clinicalObservations: '',
      testScores: ''
    });
    setCurrentReport(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 flex justify-between items-center no-print">
        <div className="flex items-center gap-2 text-blue-600">
          <FileText size={24} />
          <h1 className="text-xl font-bold tracking-tight">PsychLab Pro</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <User size={16} />
            <span>{user.email}</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-500 hover:text-red-600 transition flex items-center gap-1 text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column */}
        <div className="lg:col-span-4 space-y-6 no-print">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
              <Activity className="text-blue-500" size={20} />
              <h2 className="font-semibold text-gray-800">New Lab Assessment</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                  placeholder="Full Name"
                  value={patient.name}
                  onChange={e => setPatient({...patient, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                    placeholder="e.g. 12 years"
                    value={patient.age}
                    onChange={e => setPatient({...patient, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={patient.gender}
                    onChange={e => setPatient({...patient, gender: e.target.value})}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assessment Tool</label>
                <select
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-blue-700"
                  value={selectedTest}
                  onChange={e => setSelectedTest(e.target.value as AssessmentTest)}
                >
                  {Object.values(AssessmentTest).map(test => (
                    <option key={test} value={test}>{test}</option>
                  ))}
                </select>
              </div>

              {/* REORDERED: Scores come first now */}
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Raw Scores / Further details</label>
                <textarea
                  className="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition min-h-[100px]"
                  placeholder="IQ scores, scale points, percentile, etc."
                  value={patient.testScores}
                  onChange={e => setPatient({...patient, testScores: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Referral Reason</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition min-h-[80px]"
                  placeholder="Why was the patient referred?"
                  value={patient.referralReason}
                  onChange={e => setPatient({...patient, referralReason: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinical Observations</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition min-h-[100px]"
                  placeholder="Behavioral observations..."
                  value={patient.clinicalObservations}
                  onChange={e => setPatient({...patient, clinicalObservations: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* History Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
             <div className="flex items-center gap-2 mb-4">
              <History className="text-gray-400" size={18} />
              <h2 className="font-semibold text-gray-800">Recent Reports</h2>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {reportHistory.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No reports generated yet.</p>
              ) : (
                reportHistory.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setCurrentReport(report)}
                    className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition"
                  >
                    <div className="font-medium text-sm text-gray-900">{report.patient.name}</div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{report.testType}</span>
                      <span>{report.date}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Report Preview Column */}
        <div className="lg:col-span-8">
          {!currentReport && !isGenerating ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <FileText size={64} className="opacity-20" />
              </div>
              <h3 className="text-lg font-medium text-gray-600">No active report</h3>
              <p className="max-w-xs mt-2">Fill in the patient details and click generate to see the clinical findings here.</p>
            </div>
          ) : isGenerating ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <Loader2 className="animate-spin text-blue-500 mb-6" size={48} />
              <h3 className="text-xl font-semibold text-gray-800">Generating Clinical Report</h3>
              <p className="max-w-md mt-4 text-gray-600 leading-relaxed">
                Gemini is analyzing the behavioral observations and test scores for {patient.name} to craft a professional laboratory report...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden report-container">
              {/* Report Header Controls */}
              <div className="bg-gray-50 border-b border-gray-100 px-8 py-4 flex justify-between items-center no-print">
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Draft Ready
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrint}
                    className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm"
                  >
                    <Printer size={18} />
                    Print / Save PDF
                  </button>
                </div>
              </div>

              {/* Actual Report Document */}
              <div className="p-10 md:p-16 space-y-8">
                {/* Clinic Letterhead Simulation */}
                <div className="text-center pb-8 border-b-2 border-blue-100 relative">
                  <div className="absolute top-0 left-0 text-gray-300 pointer-events-none uppercase tracking-[0.2em] font-black text-4xl opacity-5 transform -rotate-12 translate-y-12">
                    CONFIDENTIAL CLINICAL RECORD
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase">PSYCHOLOGICAL ASSESSMENT LABORATORY</h1>
                  <p className="text-sm text-gray-500 mt-1 italic font-medium">Department of Clinical Psychology & Neurodevelopment</p>
                </div>

                {/* Patient Profile */}
                <div className="grid grid-cols-2 gap-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-0.5">Patient Name</span>
                    <span className="text-lg font-bold text-gray-800">{currentReport?.patient.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-0.5">Date of Report</span>
                    <span className="text-lg font-medium text-gray-800">{currentReport?.date}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-0.5">Age / Gender</span>
                    <span className="text-lg font-medium text-gray-800">{currentReport?.patient.age} / {currentReport?.patient.gender}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-0.5">Assessment Tool</span>
                    <span className="text-lg font-bold text-blue-700">{currentReport?.testType}</span>
                  </div>
                </div>

                {/* Short Preview / Executive Summary */}
                <div className="space-y-2 no-print">
                  <h3 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2">
                    <Send size={14} />
                    Executive Summary
                  </h3>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg italic text-blue-900">
                    {currentReport?.summary}
                  </div>
                </div>

                {/* Main Content */}
                <div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {currentReport?.fullReport.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) return <h2 key={idx} className="text-2xl font-bold border-b-2 border-gray-100 pb-2 mt-8 mb-4">{line.substring(2)}</h2>;
                    if (line.startsWith('## ')) return <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-blue-900">{line.substring(3)}</h3>;
                    if (line.startsWith('### ')) return <h4 key={idx} className="text-lg font-semibold mt-4 mb-2 text-gray-700 uppercase tracking-wide">{line.substring(4)}</h4>;
                    return <p key={idx} className="mb-4">{line}</p>;
                  })}
                </div>

                {/* Footer Signature */}
                <div className="pt-16 mt-16 border-t border-gray-200 grid grid-cols-2">
                   <div className="space-y-1">
                      <div className="h-1 bg-gray-400 w-48 mb-2"></div>
                      <p className="text-sm font-bold">Authorized Signatory</p>
                      <p className="text-xs text-gray-500">Clinical Neuropsychologist</p>
                   </div>
                   <div className="text-right text-xs text-gray-400 flex flex-col justify-end">
                      <p>Electronic Document ID: {currentReport?.id}</p>
                      <p>PsychLab Version 2.4.0-Beta</p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-400 no-print border-t border-gray-100">
        &copy; {new Date().getFullYear()} PsychLab Clinical Systems. Confidential Medical Information.
      </footer>
    </div>
  );
};

export default DashboardView;
