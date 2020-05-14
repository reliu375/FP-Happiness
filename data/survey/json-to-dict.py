'''
convert [{'word' : word, "freq" : freq}] to
{word : freq}
'''
import json


d = {}
with open("./top100words.json", 'r') as f:
    parsed_json = json.load(f) # array

for word_dict in parsed_json:
    word = word_dict['word']
    freq = word_dict['freq']

    d[word] = freq

with open('./top100words-dict.json', 'w') as f:
    json.dump(d, f)
