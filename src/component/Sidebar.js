import React, { useState } from 'react';
import Papa from 'papaparse';// Make sure to install papaparse with command 'npm install papaparse'
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();
  // State to track the selected button, conference data, and dropdown visibility
  const [selectedButton, setSelectedButton] = useState(null);
  const [conferences, setConferences] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Function to handle button click and update selectedButton state
  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
    router.push('/');
    if (buttonName === 'conference') {
      // Toggle dropdown visibility
      setDropdownVisible(!dropdownVisible);
      // If "Conference" button is clicked, fetch and set conference data
      if (!dropdownVisible) {
        fetchConferences();
      }
    } else {
      // Hide dropdown if another button is clicked
      setDropdownVisible(false);
    }
  };

  // Function to fetch conference data from CSV file
  const fetchConferences = () => {
    // Replace the URL with the correct path to your CSV file
    fetch('https://raw.githubusercontent.com/cncf-tags/cloud-native-ai/main/cncf-youtube-channel-summarizer/data/sample_cncf_video_summary.csv')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((text) => {
        // Parse CSV data using PapaParse and extract 'conference_name' column
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const uniqueConferences = new Set();
            const conferencesData = result.data.reduce((acc, row) => {
              const name = row['conference_name'].trim();
              if (!uniqueConferences.has(name)) {
                uniqueConferences.add(name);
                acc.push({ name });
              }
              return acc;
            }, []);
            setConferences(conferencesData);
          },
        });
      })
      .catch((error) => {
        console.error('Error fetching conference data:', error);
      });
  };

  // Function to handle click on dropdown button
  const handleDropdownButtonClick = () => {
    // Navigate to the new page when dropdown button is clicked
    router.push('/conferences/NewPage');
  };

  return (
    <>
      <aside className="fixed top-0 left-0 w-64 h-full" aria-label="Sidenav">
        <div className="overflow-y-auto py-5 px-3 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <ul className="space-y-2">
            <li>
              <a href="#" className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedButton === 'dashboard' ? 'bg-blue-500 text-black' : ''}`} onClick={() => handleButtonClick('dashboard')}>
                <span className="ml-3">Dashboard</span>
              </a>
            </li>
            <li>
              <button type="button" className={`flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${selectedButton === 'conference' ? 'bg-blue-500 text-black' : ''}`} onClick={() => handleButtonClick('conference')}>
                <span className="flex-1 ml-3 text-left whitespace-nowrap">Conference</span>
                <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> 
              </button>
              {/* Render conference list if the "Conference" button is selected and dropdown is visible */}
              {selectedButton === 'conference' && dropdownVisible && (
                <ul className="pl-6 mt-2">
                  {/* Render conference items */}
                  {conferences.map((conference, index) => (
                    <li key={index} className="py-1">
                      <button type="button" className="text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full p-1 rounded-lg transition" onClick={handleDropdownButtonClick}>
                        {conference.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
