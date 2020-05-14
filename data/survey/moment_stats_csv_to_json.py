#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 25 13:52:03 2020

@author: merylw
"""

''' category: gender : marital : parenthood : country : age '''

import csv
import json

d = {}

with open('./moment_stats.csv', mode='r') as infile:
    reader = csv.reader(infile)
    headers = next(reader)
    print(headers)
    
    for row in reader: 
        gender = row[0]
        marital = row[1]
        parenthood = row[2]
        country = row[3]
        age = row[4]
        category = row[5]
        
        total_moments = row[6]
        percent_category = row[7]
        

        if category not in d:
            d[category] = {}
        
        if gender not in d[category]:
            d[category][gender] = {}
        
        if marital not in d[category][gender]:
            d[category][gender][marital] = {}
            
        if parenthood not in d[category][gender][marital]:
            d[category][gender][marital][parenthood] = {}
        
        if country not in d[category][gender][marital][parenthood]:
            d[category][gender][marital][parenthood][country] = {}
            
        if age not in d[category][gender][marital][parenthood][country]:
            d[category][gender][marital][parenthood][country][age] = {}
        
        
        
        d[category][gender][marital][parenthood][country][age]["total_moments"] = total_moments
        d[category][gender][marital][parenthood][country][age]["percent_category"] = percent_category
        
    with open('./moment_stats.json', 'w') as f:
        json.dump(d, f)
            
             
            
        
        
        
        
    # with open('coors_new.csv', mode='w') as outfile:
    #     writer = csv.writer(outfile)
    #     mydict = {rows[0]:rows[1] for rows in reader}