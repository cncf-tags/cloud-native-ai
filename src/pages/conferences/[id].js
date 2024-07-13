// pages/conferences/[id].js

import { useRouter } from 'next/router';
import Papa from 'papaparse';

export default function Conference({ conferences, allVideos }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    const sameConferences = allVideos.filter((video) => video.conference_name === conferences[0].conference_name);

    return (
        <div className="container">
            <h1>{conferences[0].conference_name}</h1>
            {sameConferences.map((conference, index) => (
                <div key={index} className="conference">
                    <p><strong>Video Title:</strong> {conference.video_title}</p>
                    <p><strong>Video Link:</strong> <a href={`https://www.youtube.com/watch?v=${conference.video_id}`} target="_blank" rel="noopener noreferrer">{`https://www.youtube.com/watch?v=${conference.video_id}`}</a></p>
                    <p><strong>Video Summary:</strong> {conference.summary}</p>
                    <p>-------------------------</p>
                </div>
            ))}
        </div>
    );
    
}

export async function getStaticPaths() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/cncf-tags/cloud-native-ai/main/cncf-youtube-channel-summarizer/data/cncf_video_summary_combine.csv');
        if (!response.ok) {
            throw new Error('Failed to fetch CSV');
        }
        const csvText = await response.text();
        const { data: videos } = Papa.parse(csvText, { header: true });
      
        // Filter out any videos with empty video_id
        const validVideos = videos.filter(video => video.video_id.trim() !== '');
        const paths = validVideos.map((video) => ({
            params: { id: video.video_id },
        }));

        return {
            paths,
            fallback: false, // or 'blocking' or true
        };
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
        return {
            paths: [],
            fallback: false, // or 'blocking' or true
        };
    }
}

export async function getStaticProps({ params }) {
    try {
        const response = await fetch('https://raw.githubusercontent.com/cncf-tags/cloud-native-ai/main/cncf-youtube-channel-summarizer/data/cncf_video_summary_combine.csv');
        if (!response.ok) {
            throw new Error('Failed to fetch CSV');
        }
        const csvText = await response.text();
        const { data: videos } = Papa.parse(csvText, { header: true });
        const conferences = videos.filter((video) => video.video_id === params.id);
        if (conferences.length === 0) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                conferences,
                allVideos: videos,
            },
        };
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
        return {
            notFound: true,
        };
    }
}
