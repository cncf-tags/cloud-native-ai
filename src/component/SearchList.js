// components/SearchList.js
import { useRouter } from 'next/router';

const SearchList = ({ results, onSearchSelect }) => {
  const router = useRouter();

  const handleClick = (videoId, name) => {
    onSearchSelect(name);
    router.push(`/conferences/${videoId}`);
  };

  return (
    <div className="results">
      {results.length > 0 &&
        results.map((result, index) => (
          <div
            key={index}
            className="result-item"
            onClick={() => handleClick(result.video_id, result.conference_name)}
          >
            <p>{result.conference_name}</p>
          </div>
        ))}
    </div>
  );
};

export default SearchList;
