import pandas as pd
import csv
from nltk.corpus import stopwords
import json
import operator

stop_words = set(stopwords.words('english'))

genders = ['m', 'f', 'o']
marital = ['single', 'married', 'divorced', 'separated', 'widowed']
parenthood = ['y', 'n']
country = ['USA', 'IND', 'CAN', 'VEN', 'GBR', 'PHL', 'MEX', 'AUS', 'BRA', 'NGA']
age = [10*i for i in range(10)]
category = list(pd.unique(hm_demo.predicted_category))
topics = ['entertainment', 'exercise', 'family', 'food', 'people', 'pets', 'school', 'shopping', 'work']

def load_data():
    hm = pd.read_csv('data/cleaned_hm.csv')
    demo = pd.read_csv('data/demographic.csv')
    hm_demo = pd.merge(left = hm, right = demo, on = 'wid')

    return hm_demo

def filter_data(hm_demo):
    hm_demo.age = hm_demo.age.apply(lambda x: transform(x))
    f1 = (hm_demo.parenthood.isnull() | hm_demo.gender.isnull() | hm_demo.age.isnull() | hm_demo.country.isnull() | hm_demo.marital.isnull() | (hm_demo.ground_truth_category.isnull() & hm_demo.predicted_category.isnull()))
    f2 = (hm_demo.country.isin(country)) & (hm_demo.age != -1)

    hm_demo = hm_demo[~f1&f2]

    return hm_demo

def gen_clean_dataset():
    hm_demo = load_data()
    hm_demo = filter_data(hm_demo)

    hm_demo['text'] = hm_demo.cleaned_hm.apply(parse_text)
    hm_demo['char_len'] = hm_demo.cleaned_hm.apply(lambda x: len(x))
    hm_demo.to_csv('data/all_moments.csv')

# --- Functions for generating data for visualizations --- #

# Demographic Statistics: number of moments by demographic combinations + category
def generate_demographic_category_statistics(hm_demo):
    a = itertools.product(genders, marital, parenthood, country, age, category)
    res = []
    counter = 1

    for combo in a:
        new_list = [j for j in combo]
        f = (hm_demo.gender == new_list[0]) & (hm_demo.marital == new_list[1]) & (hm_demo.parenthood == new_list[2]) & (hm_demo.country == new_list[3]) & (hm_demo.age >= new_list[4]) & (hm_demo.age < new_list[4] + 10)
        data = hm_demo[f]
        total_moments, total_users = data.shape[0], len(list(pd.unique(data.wid)))
        if total_moments == 0:
            new_list.append(0)
            new_list.append(0)
        else:
            data = data[data.predicted_category == new_list[-1]]
            num_moments, num_users = data.shape[0], len(list(pd.unique(data.wid)))
            new_list.append(total_moments)
            new_list.append(round(num_moments/total_moments*100, 2))

        res.append(new_list)
        counter += 1

    with open('data/moment_stats.csv', 'w', encoding = 'utf-8') as csvfile:
        field_names = ['gender', 'marital', 'parenthood', 'country', 'age', 'category', 'total_moments', 'percent_category']
        writer = csv.writer(csvfile, delimiter=',', quoting=csv.QUOTE_NONE,)
        writer.writerow(field_names)
        writer.writerows(res)

# Word frequency in specific topics of happy moments
def generate_frequency_by_topic(hm_demo):
    topic_freq, new_res = word_frequency_by_topic(hm_demo)

    for cat in new_res:
        new_res[cat] = sorted(new_res[cat].items(), key=operator.itemgetter(1), reverse=True)[:100]

    for topic in new_res:
        new_res[topic] = list_to_dict(new_res[topic], ['word', 'freq'], [0, 1])

    with open('data/topic_words.json', 'w', encoding='utf-8') as json_file:
        json.dump(new_res, json_file)


# List of moment IDs associated with specific topics
def generate_moments_by_topic(hm_demo):
    topics = {topic: set() for topic in topics}

    for row in hm_demo.iterrows():
        bag_of_words = row[1].text.strip().split(' ')
        hm_id = row[1].hmid

        for word in bag_of_words:
            for ix, topic in enumerate(topics):
                if word not in stop_words and word.isalpha() and word in topic_wordsets[ix]:
                    topics[topic].add(hm_id)

    topics = {topic: list(topics[topic]) for topic in topics}

    with open('data/moments_by_topic.json', 'w', encoding='utf-8') as json_file:
        json.dump(topics, json_file)

# List of moment iDs containing the word specified by the keys
def generate_moments_by_word(hm_demo):
    word_dict = produce_word_dict(hm_demo, stop_words)
    word_dict = {word: list(word_dict[word]) for word in word_dict}
    with open('data/word_to_index.json', 'w', encoding = 'utf-8') as jsonfile:
        json.dump(word_dict, jsonfile)

# --- Utility function for data transformations --- #

def transform(age):
    if type(age) == str:
        age = age[:2]
        try:
            return float(age)
        except:
            return -1
    else:
        return float(age)

def parse_text(row):
    row = row.replace('.', '')
    row = row.replace('!', '')
    row = row.replace(',', '')
    return row.lower()

def create_topic_wordsets():
    topic_wordsets = []

    for ix in range(len(topics)):
        words = set()
        filename = 'data/topic_dict/{}-dict.csv'.format(topics[ix])
        df = pd.read_csv(filename)
        total_words = set(pd.unique(df.words))
        for word in total_words:
            words.add(word.lower())
        topic_wordsets.append(words)

    return topic_wordsets

def list_to_dict(data, keys, vals):
    new_list = []
    for item in data:
        new_item = {}
        for ix, key in enumerate(keys):
            new_item[keys[ix]] = item[vals[ix]]

        new_list.append(new_item)

    return new_list

def word_frequency_by_topic(hm_demo):
    new_res = {topic: {} for topic in topics}
    topic_freq = [0 for topic in topics]

    for text in hm_demo.text:
        bag_of_words = text.strip().split(' ')
        relevant_topics = set()
        added = [False for topic in topics]
        for word in bag_of_words:
            # https://machinelearningmastery.com/clean-text-machine-learning-python/
            for ix, topic in enumerate(topics):
                if word not in stop_words and word.isalpha() and word in topic_wordsets[ix]:
                    relevant_topics.add(ix)
                    added[ix] = True
                    topic_freq[ix] += 1
        for word in bag_of_words:
            for ix in relevant_topics:
                if word not in stop_words and word.isalpha():
                    new_res[topics[ix]][word] = new_res[topics[ix]].get(word, 0) + 1

    return topic_freq, new_res

def produce_word_dict(dataset, stop_words):
    word_dict = {}

    for row in dataset.iterrows():
        bag_of_words = row[1].text.strip().split(' ')
        for word in bag_of_words:
            if word not in word_dict and word not in stop_words:
                word_dict[word] = set()
            if word not in stop_words:
                word_dict[word].add(row[1]['hmid'])
    return word_dict
