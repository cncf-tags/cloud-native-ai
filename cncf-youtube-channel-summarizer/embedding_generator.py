from sentence_transformers import SentenceTransformer
import pandas as pd
import pickle
def embedding_generator(model, data):
    dataset = pd.read_csv('data/cncf_video_summary_combine.csv')
    bi_encoder = SentenceTransformer(model)
    bi_encoder.max_seq_length = 256     #Truncate long passages to 256 tokens
    ##### Semantic Search #####
    # Encode the query using the bi-encoder and find potentially relevant passages
    embeddings = bi_encoder.encode(data, convert_to_tensor=True, show_progress_bar=True)
    return embeddings


if __name__ == "__main__":
    dataset = pd.read_csv('data/cncf_video_summary_combine.csv')
    embeddings = embedding_generator('multi-qa-MiniLM-L6-cos-v1', dataset['merge'])
    with open('data/embedding.pkl', 'wb') as f:
        pickle.dump(embeddings.numpy(), f)
