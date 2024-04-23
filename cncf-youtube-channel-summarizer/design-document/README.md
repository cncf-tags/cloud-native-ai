# Design Document

## Extract Transcripts
### Method 1
* Using langchain to access YouTube Video transcripts.
  * Requirements: Scrape all CNCF Video URL from YouTube.
```py

#Access transcripts by URL

from langchain.document_loaders import YoutubeLoader
loader = YoutubeLoader.from_youtube_url(
    'youtube_url', add_video_info=True
)
transcript = loader.load()
```

### Method 2
* Use _youtube data api v3 API_ from Google to request all video_ids,
    * Requirements: Get API_KEY, Private CNCF channel_id.
```py

#Access transcripts by youtube data api v3 API.

from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi


youtube = build('youtube', 'v3', developerKey='YOUR_API_KEY')

def get_channel_videos(channel_id):
    # Get the channel's content details
    channel_response = youtube.channels().list(id=channel_id, part='snippet,contentDetails,statistics').execute()
   # print(channel_response)
    playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']

    # Fetch videos from the playlist
    videos = []
    next_page_token = None
    while True:
        playlist_response = youtube.playlistItems().list(playlistId=playlist_id, part='snippet', maxResults=50,
                                                         pageToken=next_page_token).execute()
        videos.extend([item['snippet']['resourceId']['videoId'] for item in playlist_response['items']])
        next_page_token = playlist_response.get('nextPageToken')
        if next_page_token is None:
            break
    return videos
def get_video_captions_id(video_id):
    # List the available captions for the video
    captions_list = youtube.captions().list(part='snippet', videoId=video_id).execute()
    if 'items' not in captions_list or not captions_list['items']:
        print("No captions available for video ID:", video_id)
        return

    for caption in captions_list['items']:
        print(f"Caption ID: {caption['id']}, Language: {caption['snippet']['language']}, Is Auto-generated: {caption['snippet']['trackKind']}")
def get_video_captions(video_id):
    # List the available captions for the video
    raw_captions = YouTubeTranscriptApi.get_transcript(video_id)
    captions = ''
    for sentences in raw_captions:
        captions += sentences['text'] + ' '
    return captions

def main():
    video_ids = get_channel_videos('channel_id')
    for video_id in video_ids:
        print(f"Video ID: {video_id}")
        print(f"Caption ID: {get_video_captions_id(video_id)}")
        cap = get_video_captions(video_id)
        print(cap)
        return cap
main()
```
### About Google API access
[Get API_KEY Video Tutorial](https://www.youtube.com/watch?v=DuudSp4sHmg)  
[Get Credentials Tutorial](https://developer.chrome.com/docs/webstore/using-api)

## LLM Backend Setup (WatsonX)
1. [Create account for IBM WatsonX.](https://dataplatform.cloud.ibm.com/registration/stepone?context=wx)
2. [Create project in WatsonX.](https://video.ibm.com/recorded/132861278)
3. [Associate the project to Watson Machine Learning-xg service with free trial.](https://dataplatform.cloud.ibm.com/docs/content/wsj/getting-started/assoc-services.html?context=cpdaas)
4. [Create and copy API_KEY.](https://dataplatform.cloud.ibm.com/docs/content/wsj/model/wos-creds.html?context=cpdaas)
5. Copy Project_ID.  
### LLMs Support List in Watson Machine Learning
* [List](https://ibm.github.io/watson-machine-learning-sdk/model.html#ibm_watson_machine_learning.foundation_models.utils.enums.ModelTypes)
### Integrate LangChain with Watson Machine Learning
* [Text Summarization of Large Documents using LangChain](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/language/use-cases/document-summarization/summarization_large_documents_langchain.ipynb)
```py
# Code example for integrating LangChain and Watson
from langchain_community.document_loaders import YoutubeLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from ibm_watson_machine_learning.foundation_models import Model
from ibm_watson_machine_learning.foundation_models.utils.enums import ModelTypes
from langchain.chains.summarize import load_summarize_chain

loader = YoutubeLoader.from_youtube_url(
    "YouTube_URL", add_video_info=True
)
transcript = loader.load()
text_splitter  = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=50)
texts = text_splitter.split_documents(transcript)

flan_ul2_model = Model(
    model_id=ModelTypes.FLAN_UL2,
    credentials={
        "apikey": "API_KEY",
        "url": "https://us-south.ml.cloud.ibm.com"
    },
    project_id="project_id"
    )

chain = load_summarize_chain(llm=flan_ul2_model.to_langchain(), chain_type="map_reduce", verbose=True)
summary = chain.run(texts)
```
