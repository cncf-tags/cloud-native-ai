import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const Navbar = () => {

  const [input, setInput] = useState("");

  const fetchData = (value) => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((user) => {
          return (
            value &&
            user &&
            user.name &&
            user.name.toLowerCase().includes(value)
          );
        });
        setResults(results);
      });
  };

  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
  };

  return (
    <>
      <nav className="flex justify-between items-center px-4 py-2">
        <div className="flex-grow">
          <input
            type="text"
            className="w-3/4 bg-white text-black-200 px-4 py-2 rounded-md"
            placeholder="Search..."
          />
        </div>
        <div className="flex items-center"></div>
      </nav>
    </>
  );
};

export default Navbar;