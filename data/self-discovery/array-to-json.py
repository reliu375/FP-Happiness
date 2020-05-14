'''convert array of keywords to json format {"word": word, "freq": freq}'''


import json

json_arr = []

with open("./select-words-arr.json", 'r') as f:
    parsed_json = json.load(f) # array

for word in parsed_json:
    d = {}
    d["word"] = word
    d["freq"] = 1; # constant
    json_arr.append(d) # add dict to arr

with open('./select-words.json', 'w') as f:
    json.dump(json_arr, f)
