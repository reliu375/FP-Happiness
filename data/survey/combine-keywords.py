''' combine topic_dict/* into an array of strings '''
import csv
import json
import os

all_keywords = []
path = './topic_dict/'

for filename in os.listdir(path):
    print('filename: ', filename)
    with open(path+filename, 'r') as infile:

        reader = csv.reader(infile)

        header = next(reader) #skip

        for row in reader:  # each row has a keyword
            word = row[0]
            all_keywords.append(word)

with open('./all-keywords.json', 'w') as f:
    json.dump(all_keywords, f)
