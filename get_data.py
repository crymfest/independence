import pandas as pd
from tabulate import tabulate
import json

#Get data from Wikipedia
url = "https://en.wikipedia.org/wiki/List_of_national_independence_days"
df_ind = pd.read_html(url, header=0)[0]
url = "https://en.wikipedia.org/wiki/ISO_3166-1"
df_iso = pd.read_html(url, header=0)[1]

#Clean data - account for shifted data with countries that have multiple independence days (e.g. Armenia)
cols = df_ind.columns
for index,row in df_ind[df_ind['Country'].str.contains("[0-9]{1,2}-[0-9]{1,2}")].iterrows():
	for i in range(1,len(cols))[::-1]:	
		df_ind.loc[index,cols[i]] = df_ind.loc[index,cols[i-1]]
	df_ind.loc[index,'Country'] = df_ind.loc[index-1,'Country']

#Print sample data
print tabulate(df_ind.head(15), headers=list(df_ind.columns), tablefmt='psql')
print tabulate(df_iso.head(15), headers=list(df_iso.columns), tablefmt='psql')

#Join data sets
df_ind = pd.merge(left=df_ind,right=df_iso,how='left',left_on='Country',right_on='English short name (upper/lower case)')

#Rename "Alpha-3 code" to "id" and "Year celebrated" to "Year"
df_ind = df_ind.rename(columns={"Alpha-3 code":"id", "Year celebrated":"Year"})

#Load world_countries.json to supplement missing country codes
with open('world_countries.json', 'r') as f:
     json_wc = json.load(f)

#Check if country with missing id is in world_countries and has id
for index, row in df_ind[df_ind['id'].isnull()].iterrows():
	for country in json_wc['features']:
		if country['properties']['name'] == row['Country']:
			df_ind.loc[index,'id'] = country['id']
			break

#Manually fill id values for some random countries
dict_country_ids = {"Congo, Democratic Republic of the":"COD","Congo, Republic of the":"COG","Gambia, The":"GMB","Korea, North":"PRK","Korea, South":"KOR","Macedonia, Republic of":"MKD","Northern Cyprus":"CYP","Republic of Ireland":"IRL","Tanzania":"TZA","United States":"USA"}
for country in dict_country_ids:
	df_ind.loc[df_ind['Country']==country,'id'] = dict_country_ids[country]

#Manually fix some bad years
dict_fixed_years = {"1810 and 1819":"1810","1948 !5708 (1948)":"1948"}
for year in dict_fixed_years:
	df_ind.loc[df_ind['Year']==year,'Year'] = dict_fixed_years[year]

#Save to csv
df_ind.loc[df_ind['id'].notnull(),['id','Country','Year']].to_csv('independence_days.tsv', index=False, encoding='utf-8', sep="\t")

#Save to json
# with open('independence_days.json', 'w') as f:
     # json.dump(df_ind[df_ind['id'].notnull()].to_dict("records"), f)


