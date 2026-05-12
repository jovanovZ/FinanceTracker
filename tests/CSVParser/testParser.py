import requests
import json

url = "http://localhost:3000/"

# login first

# check if categories exist
# if they are get them
# if not add them


importsUrl = url + "import/csv"
files = ["februar_2025", "januar_2025", "marec_2025"]
for filename in files:
    # upload csv
    file = {'file': open(filename + ".csv", 'rb')}
    response = requests.post(importsUrl, files=file)
    # check output
    if response.json()["transactions"] == json.load(open(filename + ".json")):
        print("Pass")
    else:
        print(response.json())
        print(json.load(open(filename+".json")))
        print("Fail")