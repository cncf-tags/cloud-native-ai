import nltk
from nltk.tokenize import word_tokenize
from rank_bm25 import BM25Okapi
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import pickle
# Download required NLTK data
nltk.download('punkt')

class BM25():
    def __init__(self, dataset, top_k=5):
        self.dataset = dataset
        self.top_k = top_k
        self.tokenized_corpus = [self.preprocess_text(doc) for doc in dataset['merge']]
    # Function to preprocess and tokenize text
    def preprocess_text(self, text):
        return word_tokenize(text.lower())


    # Function to perform a search query
    def search(self, query, bm25):
        tokenized_query = self.preprocess_text(query)
        scores = bm25.get_scores(tokenized_query)
        results = []
        top_n_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:self.top_k]

        video_ids = []
        for i in top_n_indices:
            results.append((self.dataset['merge'][i], scores[i]))
            video_ids.append(self.dataset.loc[i]['video_id'])
        print(results)
        return video_ids


    def run(self, query):
        # Initialize BM25
        bm25 = BM25Okapi(self.tokenized_corpus)
        # Example query
       # query = "CNCF Webinars"
        video_ids = self.search(query, bm25, )
        return video_ids

class BIENCODER():
    def __init__(self, dataset, embeddings, top_k=5):
        self.dataset = dataset
        self.embeddings = embeddings
        self.top_k = top_k
        self.bi_encoder = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')
        self.bi_encoder.max_seq_length = 256

    def search(self, query):
        print("Input question:", query)
        question_embedding = self.bi_encoder.encode(query, convert_to_tensor=True)
       # question_embedding = question_embedding.cuda()
        hits = util.semantic_search(question_embedding, self.embeddings, top_k=self.top_k)
        hits = hits[0]  # Get the hits for the first query
        # print(hits)

        # Output of top-5 hits from bi-encoder
        print("\n-------------------------\n")
        print("Top-3 Bi-Encoder Retrieval hits")
        hits = sorted(hits, key=lambda x: x['score'], reverse=True)
        video_ids = []
        for hit in hits:
            print("\t{:.3f}\t{}".format(hit['score'], self.dataset['merge'][hit['corpus_id']]))
            video_ids.append(self.dataset.loc[hit['corpus_id']]['video_id'])
        return video_ids

if __name__ == "__main__":
    query = 'CNCF Webinars'  ## input query
    dataset = pd.read_csv('data/cncf_video_summary_combine.csv')
    print('Method 1: BM25 alg for semantic search:')
    bm25_search = BM25(dataset, top_k=5)
    video_ids = bm25_search.run(query)
    print('here')
    print(video_ids)

    print('Method 2: Deep learning for semantic search:')
    with open('data/embedding.pkl', 'rb') as f:
        embeddings = pickle.load(f)
    video_ids = BIENCODER(dataset, embeddings).search(query)
    print(video_ids)