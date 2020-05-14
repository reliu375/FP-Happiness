'''
convert csv file to json file
{int hmid: {"cleaned_hm": String, "predicted_category": String }}
* only includes moments length < 65 char
'''

import csv
import json

NUM_CHAR = 65

j = {}

with open('./all_moments.csv', mode='r') as infile:
    reader = csv.reader(infile)
    headers = next(reader)

    for row in reader:
        hmid = row[1]
        cleaned_hm = row[5]
        predicted_category = row[9]

        if len(cleaned_hm) < NUM_CHAR:
            j[hmid] = { "cleaned_hm" : cleaned_hm, "predicted_category" : predicted_category}

    with open('./all_moments.json', 'w') as f:
        json.dump(j, f)
