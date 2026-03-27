import React, { useState, useEffect } from 'react';
import { admin } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, ShieldCheck, Activity } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.getAnalytics()
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-rose-500 font-bold">Loading Analytics...</div>;
  }

  // Parse data
  const totalStudents = data?.roles?.find(r => r.role === 'student')?.count || 0;
  const totalCounselors = data?.roles?.find(r => r.role === 'counselor')?.count || 0;

  const appointmentData = data?.appointments?.map(a => ({ name: a.status.toUpperCase(), value: parseInt(a.count) })) || [];
  
  // Format assessments data for Bar Chart
  const assessmentDataRaw = data?.assessments || [];
  const groupedAssessments = {};
  assessmentDataRaw.forEach(item => {
    const sev = item.severity || 'Unknown';
    if(!groupedAssessments[sev]) groupedAssessments[sev] = { name: sev, PHQ9: 0, GAD7: 0 };
    if (item.test_type === 'PHQ9') groupedAssessments[sev].PHQ9 += parseInt(item.count);
    if (item.test_type === 'GAD7') groupedAssessments[sev].GAD7 += parseInt(item.count);
  });
  const assessmentData = Object.values(groupedAssessments);

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Overall Analytics</h1>
          <p className="text-sm font-bold text-gray-400">Real-time student and counselor metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric Cards */}
        <div className="bg-white p-6 rounded-3xl border border-[#DCEAFF] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-4xl font-black text-gray-900">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DCEAFF] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
            <ShieldCheck className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Counselors</p>
            <h3 className="text-4xl font-black text-gray-900">{totalCounselors}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#DCEAFF] shadow-sm flex flex-col items-center">
          <h2 className="text-lg font-black text-gray-900 mb-6 self-start">Appointment Statuses</h2>
          <div className="h-72 w-full max-w-sm">
            {appointmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appointmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontWeight: 600, fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold">
                <PieChart className="w-12 h-12 mb-2 opacity-20" />
                No Appointments Yet
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#DCEAFF] shadow-sm flex flex-col">
          <h2 className="text-lg font-black text-gray-900 mb-6">Screening Results by Severity</h2>
          <div className="flex-1 min-h-[16rem]">
            {assessmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assessmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 600}} stroke="#9CA3AF" />
                  <YAxis tick={{fontSize: 12, fontWeight: 600}} stroke="#9CA3AF" />
                  <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend wrapperStyle={{fontWeight: 600, fontSize: '12px'}} />
                  <Bar dataKey="PHQ9" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="GAD7" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold">
                <Activity className="w-12 h-12 mb-2 opacity-20" />
                No Screenings Found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
