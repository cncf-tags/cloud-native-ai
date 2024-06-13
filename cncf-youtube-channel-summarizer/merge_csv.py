import pandas as pd
import os

def merge_csv():
    csv_list = []
    filename_list = os.listdir('data/')
    for i in range(0, len(filename_list)):
        if '.csv' in filename_list[i]:
            filename_list[i] = 'data/' + filename_list[i]
            csv_list.append(filename_list[i])

    dataframes = [pd.read_csv(each_file) for each_file in csv_list]
    merged_df = pd.concat(dataframes, ignore_index=True)
    merged_df['merge'] = merged_df['video_title'] + ' ' + merged_df['conference_name'] + ' ' + merged_df[
        'summary'] + ' ' + merged_df['keywords']
    merged_df.to_csv('data/cncf_video_summary_combine.csv', index=False)

if __name__ == "__main__":
    merge_csv()


