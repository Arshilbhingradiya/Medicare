import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    // Fetch appointments and medical records
    // This will be implemented with API calls
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
          <button
            onClick={() => navigate('/book-appointment')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Book New Appointment
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Dr. {appointment.doctor.name}</h3>
                      <p className="text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Medical Records</h2>
          <div className="space-y-4">
            {medicalRecords.length > 0 ? (
              medicalRecords.map((record) => (
                <div
                  key={record._id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{record.diagnosis}</h3>
                      <p className="text-gray-600">
                        Dr. {record.doctor.name} - {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-2">{record.prescription}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/medical-record/${record._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No medical records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 