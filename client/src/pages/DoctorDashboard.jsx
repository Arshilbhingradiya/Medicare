import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Fetch appointments and patients
    // This will be implemented with API calls
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
          <button
            onClick={() => navigate('/manage-schedule')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Manage Schedule
          </button>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Today's Appointments</h2>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{appointment.patient.name}</h3>
                      <p className="text-gray-600">
                        {appointment.time} - {appointment.reason}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => navigate(`/patient/${appointment.patient._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Patient
                      </button>
                      <button
                        onClick={() => navigate(`/appointment/${appointment._id}`)}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                      >
                        Start Consultation
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No appointments for today</p>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Patients</h2>
          <div className="space-y-4">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <div
                  key={patient._id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-gray-600">
                        Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/patient/${patient._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View History
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent patients</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 