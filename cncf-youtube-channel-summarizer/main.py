import os
from extract_youtube_videos_info import get_video_info
from transcript_summarizer import TranscriptSummarizer
from googleapiclient.discovery import build

def run():
    YOUR_API_KEY = os.environ['GOOGLE_API_KEY']  ## GOOGLE_API_KEY for extracting youtube videos.
    CHANNEL_ID = 'UCvqbFHwN-nwalWPjPUKpvTA'   ## This channel id is extracted from  CNCF youtube video url.
    youtube = build('youtube', 'v3', developerKey=YOUR_API_KEY)
    videos_dict = get_video_info(youtube, CHANNEL_ID) ## extract all video_information, and store them

    model_id = "ibm-mistralai/mixtral-8x7b-instruct-v01-q"
    summary_param = {
        'TEMPERATURE': 0.7,
        'MAX_NEW_TOKENS': 512,
        'TOP_K': 10,
    }
    keywords_param = {
        'TEMPERATURE': 0.1,
        'MAX_NEW_TOKENS': 128,
        'TOP_K': 10,
    }
    transcript_path = 'data/CNCF_video_information.json'
    summarizer = TranscriptSummarizer(model_id, summary_param, keywords_param, transcript_path).run() # do summarization
