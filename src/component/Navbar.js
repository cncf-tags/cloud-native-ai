import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import Papa from "papaparse";
import SearchList from "./SearchList";

const Navbar = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  const fetchData = (value) => {
    fetch("https://raw.githubusercontent.com/cncf-tags/cloud-native-ai/main/cncf-youtube-channel-summarizer/data/cncf_video_summary_combine.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsedData = Papa.parse(csvText, { header: true }).data;
        const uniqueResults = new Set();
        const filteredResults = parsedData.filter((item) => {
          if (
            value &&
            item &&
            item.conference_name &&
            item.conference_name.toLowerCase().includes(value.toLowerCase()) &&
            !uniqueResults.has(item.conference_name)
          ) {
            uniqueResults.add(item.conference_name);
            return true;
          }
          return false;
        });
        setResults(filteredResults);
      });
  };

  const handleChange = (value) => {
    setInput(value);
    if (value) {
      setIsVisible(true);
      fetchData(value);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (conferenceName) => {
    setInput(conferenceName);
    setIsVisible(false);
  };

  return (
    <div className='navbar'>
      <div className="search-input">
        <input
          type="text"
          className="w-full bg-white text-gray-600 px-4 py-2 rounded-md"
          placeholder="Type to search conference names..."
          value={input}
          onChange={(e) => handleChange(e.target.value)}
        />
        <FaSearch id="search-icon" className="ml-2 text-gray-500" />
      </div>
      {isVisible && input && <SearchList results={results} onSearchSelect={handleSelect} />}
    </div>
  );
};

export default Navbar;
