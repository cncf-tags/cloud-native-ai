
from langchain.text_splitter import RecursiveCharacterTextSplitter
from ibm_watson_machine_learning.foundation_models import Model
from langchain.chains.summarize import load_summarize_chain
import json
from langchain import PromptTemplate
import pandas as pd
import sys
import os
from tenacity import retry, stop_after_attempt, wait_fixed
from logger import setup_logger

logger = setup_logger("TranscriptSummarizer")
class TranscriptSummarizer():
    def __init__(self, model_id, summary_param, keywords_param, transcript_path):
        self.APIKEY = os.environ['WATSONX_KEY']
        self.project_id = os.environ['WATSONX_PROJECT_ID']
        self.url = os.environ['WATSONX_URL']
        self.model_id = model_id
        self.summary_param = summary_param
        self.keywords_param = keywords_param
        f = open(transcript_path)
        self.videos_dict = json.load(f)
        self.videos_dict = dict_to_list_of_dicts(self.videos_dict)
        self.llm_summary, self.llm_keywords = self.create_models()

    def create_models(self):
        llm_summary = Model(
            model_id=self.model_id,
            credentials={
                "apikey": self.APIKEY,
                "url": self.url
            },
            project_id=self.project_id,
            params=self.summary_param
        )

        llm_keywords = Model(
            model_id=self.model_id,
            credentials={
                "apikey": self.APIKEY,
                "url": self.url
            },
            project_id=self.project_id,
            params=self.keywords_param
        )
        return llm_summary, llm_keywords

    def LLM_summarizer(self, llm_summary, llm_keywords, transcript, chunk_size, chunk_overlap, key):
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        texts = text_splitter.create_documents([transcript])
        map_summary_template = open('cncf-youtube-channel-summarizer/prompt/chunks_summary_prompt.txt').readlines()
        map_summary_template = ''.join(map_summary_template)
        combine_summary_template = open('cncf-youtube-channel-summarizer/prompt/combine_summary_prompt.txt').readlines()
        combine_summary_template = ''.join(combine_summary_template)

        keyword_template = open('prompt/keyword_template.txt').readlines()
        keyword_template = ''.join(keyword_template)

        map_prompt = PromptTemplate(template=map_summary_template, input_variables=["text"])
        combine_prompt = PromptTemplate(template=combine_summary_template, input_variables=["text"])
        prompt_keywords = PromptTemplate(template=keyword_template, input_variables=["text"])
        chain_summary = load_summarize_chain(llm=llm_summary, chain_type="map_reduce", map_prompt=map_prompt,
                                                 combine_prompt=combine_prompt, verbose=False)
        summary = chain_summary.run(texts)
        summary_doc = text_splitter.create_documents([summary])
        chain_keywords = load_summarize_chain(llm=llm_keywords, chain_type="stuff", prompt=prompt_keywords,
                                              verbose=False)
        keywords = chain_keywords.run(summary_doc)
        return summary, keywords

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def run(self, start_index, end_index):
        max_sequence_length = self.llm_summary.get_details()['model_limits']['max_sequence_length']
        chunk_size = max_sequence_length - 1000
        chunk_overlap = 50
        self.videos_dict = self.videos_dict[start_index:end_index+1]
        for i in range(0, len(self.videos_dict)):
            key = list(self.videos_dict[i].keys())[0]
            transcript = self.videos_dict[i][key]['transcript']
            try:
                summary, keywords = self.LLM_summarizer(self.llm_summary.to_langchain(), self.llm_keywords.to_langchain(), transcript,
                                               chunk_size, chunk_overlap, key)
                logger.info(f"Finish Video {key}, index {i}")
            except Exception as e:
                logger.error(f"Failed to generate the summary and keywords for video: {key}")
                logger.error(f"{e}")
                missed_video_id = open('cncf-youtube-channel-summarizer/data/missed_video_id.txt', 'a')
                missed_video_id.write(key+',')
                continue

            data = {'video_id': [key], 'video_title': [self.videos_dict[i][key]['video_title']],
                    'conference_name': [self.videos_dict[i][key]['play_list']['title']], 'summary': [summary],
                    'keywords': [keywords]}
            df = pd.DataFrame(data)
            df.to_csv('cncf-youtube-channel-summarizer/data/cncf_video_summary.csv', mode='a', index=False, header=False)

def dict_to_list_of_dicts(dictionary):
    # Initialize an empty list for the list of dictionaries
    list_of_dicts = []

    # Iterate through the dictionary items
    for key, value in dictionary.items():
        # Create a dictionary for the current key-value pair
        pair_dict = {key: value}
        # Append the dictionary to the list
        list_of_dicts.append(pair_dict)

    return list_of_dicts

if __name__ == "__main__":
    args = sys.argv
    start_index = int(args[1])
    end_index = int(args[2])
    model_id = "ibm-mistralai/mixtral-8x7b-instruct-v01-q"
    summary_param = {
                    'TEMPERATURE':0.7,
                    'MAX_NEW_TOKENS':512,
                    'TOP_K': 10,
                    }
    keywords_param = {
                     'TEMPERATURE': 0.1,
                     'MAX_NEW_TOKENS': 128,
                     'TOP_K': 10,
                     }
    transcript_path = 'cncf-youtube-channel-summarizer/data/CNCF_video_information.json'
    summarizer = TranscriptSummarizer(model_id, summary_param, keywords_param, transcript_path).run(start_index, end_index)
