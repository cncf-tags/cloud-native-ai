
from langchain.text_splitter import RecursiveCharacterTextSplitter
from ibm_watson_machine_learning.foundation_models import Model
from langchain.chains.summarize import load_summarize_chain
import json
from langchain import PromptTemplate
import pandas as pd
import os
from tenacity import retry, stop_after_attempt, wait_fixed
from logger import setup_logger

logger = setup_logger("TranscriptSummarizer")
class TranscriptSummarizer():
    def __init__(self, model_id, summary_param, keywords_param, transcript_path):
        self.APIKEY = os.environ['WATSONX_KEY']
        self.project_id = os.environ['WATSONX_PROJECT_ID']
        self.model_id = model_id
        self.summary_param = summary_param
        self.keywords_param = keywords_param
        f = open(transcript_path)
        self.videos_dict = json.load(f)
        self.llm_summary, self.llm_keywords = self.create_models()

    def create_models(self):
        llm_summary = Model(
            model_id=self.model_id,
            credentials={
                "apikey": self.APIKEY,
                "url": "https://us-south.ml.cloud.ibm.com"
            },
            project_id=self.project_id,
            params={
                'TEMPERATURE': 0.7,
                'MAX_NEW_TOKENS': 512,
                'TOP_K': 10,
            }
        )

        llm_keywords = Model(
            model_id=self.model_id,
            credentials={
                "apikey": self.APIKEY,
                "url": "https://us-south.ml.cloud.ibm.com"
            },
            project_id=self.project_id,
            params={
                'TEMPERATURE': 0.1,
                'MAX_NEW_TOKENS': 128,
                'TOP_K': 10,
            }
        )
        return llm_summary, llm_keywords

    def LLM_summarizer(self, llm_summary, llm_keywords, transcript, chunk_size, chunk_overlap, key):
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        texts = text_splitter.create_documents([transcript])
        map_summary_template = open('prompt/chunks_summary_prompt1.txt').readlines()
        map_summary_template = ''.join(map_summary_template)
        combine_summary_template = open('prompt/combine_summary_prompt.txt').readlines()
        combine_summary_template = ''.join(combine_summary_template)

        keyword_template = open('prompt/keyword_template.txt').readlines()
        keyword_template = ''.join(keyword_template)

        map_prompt = PromptTemplate(template=map_summary_template, input_variables=["text"])
        combine_prompt = PromptTemplate(template=combine_summary_template, input_variables=["text"])
        prompt_keywords = PromptTemplate(template=keyword_template, input_variables=["text"])
        chain_summary = load_summarize_chain(llm=llm_summary, chain_type="map_reduce", map_prompt=map_prompt,
                                                 combine_prompt=combine_prompt, verbose=True)
        summary = chain_summary.run(texts)
        summary_doc = text_splitter.create_documents([summary])
        chain_keywords = load_summarize_chain(llm=llm_keywords, chain_type="stuff", prompt=prompt_keywords,
                                              verbose=False)
        keywords = chain_keywords.run(summary_doc)
        return summary, keywords

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def run(self):
        i = 0
        missed_video_id = []
        print(self.llm_summary.get_details())

        max_sequence_length = self.llm_summary.get_details()['model_limits']['max_sequence_length']
        chunk_size = max_sequence_length - 1000
        chunk_overlap = 50
        cncf_video_summary = pd.DataFrame(columns=['video_id', 'video_title', 'summary', 'keywords'])
        cncf_video_summary.to_csv('cncf_video_summary.csv', index=False)

        for key in self.videos_dict.keys():
            i += 1
            transcript = self.videos_dict[key]['transcript'][:100]
            print(len(transcript.split(' ')))
            if i == 2:
                break
            try:
                summary, keywords = self.LLM_summarizer(self.llm_summary.to_langchain(), self.llm_keywords.to_langchain(), transcript,
                                               chunk_size, chunk_overlap, key)
            except:
                logger.error(f"Failed to generate the summary and keywords for video: {key}")
                missed_video_id = open('missed_video_id.txt', 'a')
                missed_video_id.write(key)
                continue

            data = {'video_id': [key], 'video_title': [self.videos_dict[key]['video_title']],
                    'conference_name': [self.videos_dict[key]['play_list']['title']], 'summary': [summary],
                    'keywords': [keywords]}
            df = pd.DataFrame(data)
            df.to_csv('cncf_video_summary.csv', mode='a', index=False, header=False)


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
transcript_path = 'CNCF_video_information.json'
summarizer = TranscriptSummarizer(model_id, summary_param, keywords_param, transcript_path).run()