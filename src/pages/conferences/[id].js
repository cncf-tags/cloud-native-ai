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
                    <div>
                        <div className="video-container">
                            <iframe
                                width="560"
                                height="315"
                                src={`https://www.youtube.com/embed/${conference.video_id}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={conference.video_title}
                            ></iframe>
                        </div>
                    </div>
                    <br/>
                    <p><strong>Title:</strong> {conference.video_title}</p>
                    <p><strong>Summary:</strong> {conference.summary}</p>
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

        // Filter out duplicates by video_id
        const uniqueVideos = Array.from(new Set(videos.map(video => video.video_id)))
                                  .map(id => videos.find(video => video.video_id === id));

        const paths = uniqueVideos.map((video) => ({
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

        // Filter out duplicates by video_id
        const uniqueVideos = Array.from(new Set(videos.map(video => video.video_id)))
                                  .map(id => videos.find(video => video.video_id === id));

        const conferences = uniqueVideos.filter((video) => video.video_id === params.id);
        if (conferences.length === 0) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                conferences,
                allVideos: uniqueVideos,
            },
        };
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
        return {
            notFound: true,
        };
    }
}
