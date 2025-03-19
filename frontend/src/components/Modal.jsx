import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ show, onClose, interview }) => {
  if (!show) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{interview.title}</h2>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <p className="text-gray-700 dark:text-gray-300"><strong>Interviewer:</strong> {interview.interviewer?.name || 'N/A'}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Candidate Id:</strong> {interview.candidate_id || 'N/A'}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Field:</strong> {interview.field}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Level:</strong> {interview.level}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Date:</strong> {new Date(interview.date).toLocaleDateString()}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Time:</strong> {interview.start_time} - {interview.end_time}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Notes:</strong> {interview.notes || 'No description provided.'}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;