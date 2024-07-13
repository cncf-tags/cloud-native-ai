import nltk
from nltk.tokenize import word_tokenize
from rank_bm25 import BM25Okapi
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import pickle
import json
import sys

nltk.download('punkt')

class BM25():
    def __init__(self, dataset, top_k=5):
        self.dataset = dataset
        self.top_k = top_k
        self.tokenized_corpus = [self.preprocess_text(doc) for doc in dataset['merge']]
    
    def preprocess_text(self, text):
        return word_tokenize(text.lower())

    def search(self, query, bm25):
        tokenized_query = self.preprocess_text(query)
        scores = bm25.get_scores(tokenized_query)
        top_n_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:self.top_k]
        video_ids = [self.dataset.loc[i]['video_id'] for i in top_n_indices]
        return video_ids

    def run(self, query):
        bm25 = BM25Okapi(self.tokenized_corpus)
        return self.search(query, bm25)

class BIENCODER():
    def __init__(self, dataset, embeddings, top_k=5):
        self.dataset = dataset
        self.embeddings = embeddings
        self.top_k = top_k
        self.bi_encoder = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')
        self.bi_encoder.max_seq_length = 256

    def search(self, query):
        question_embedding = self.bi_encoder.encode(query, convert_to_tensor=True)
        hits = util.semantic_search(question_embedding, self.embeddings, top_k=self.top_k)
        hits = hits[0]
        hits = sorted(hits, key=lambda x: x['score'], reverse=True)
        video_ids = [self.dataset.loc[hit['corpus_id']]['video_id'] for hit in hits]
        return video_ids

if __name__ == "__main__":
    query = sys.argv[1]
    csv_url = sys.argv[2]
    dataset = pd.read_csv(csv_url)
    
    bm25_search = BM25(dataset, top_k=5)
    bm25_video_ids = bm25_search.run(query)

    with open('data/embedding.pkl', 'rb') as f:
        embeddings = pickle.load(f)
    biencoder_search = BIENCODER(dataset, embeddings)
    biencoder_video_ids = biencoder_search.search(query)

    combined_results = {
        'bm25': bm25_video_ids,
        'biencoder': biencoder_video_ids
    }

    print(json.dumps(combined_results))
