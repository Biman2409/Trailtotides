import csv
import io
import re

csv_raw = """Trek Name,Region,Base Camp,Difficulty,Duration,Distance,Best Season,Cost (INR),Link
Bali Pass,Uttarakhand,Sankri,Difficult,8 Days,56 km,"May, June, September, October",22000,https://trekthehimalayas.com/bali-pass-trek
Panch Kedar Trek,Uttarakhand,Rishikesh,Moderate to Difficult,12 Days,107 km,"May, June, September, October",64500,https://trekthehimalayas.com/panchkedar-trek
Pin Bhaba Pass,Himachal Pradesh,Kafnu,Moderate to Difficult,8 Days,51 km,"July, August, September",17900,https://trekthehimalayas.com/pin-bhaba-pass-trek
Buran Ghati,Himachal Pradesh,Shimla,Moderate to Difficult,7 Days,37 km,"May, June, September, October",16500,https://trekthehimalayas.com/buran-ghati-pass-trek
Pin Parvati Pass,Himachal Pradesh,Manali,Challenging,11 Days,110 km,"July, August",45000,https://trekthehimalayas.com/pin-parvati-pass-trek
Chadar Trek (Frozen River),Ladakh,Leh,Difficult,8 Days,28 km,January,26500,https://trekthehimalayas.com/chadar-trek
Goechala Trek,Sikkim,Yuksom,Difficult,11 Days,76 km,March to April | September to November,21000,https://trekthehimalayas.com/goechala-trek
Dayara Bugyal,Uttarakhand,Raithal,Easy to Moderate,6 Days,29 km,All year except July-August,-,https://trekthehimalayas.com/dayara-bugyal-trek
Deoriatal - Chandrashila,Uttarakhand,Sari Village,Easy to Moderate,5 Days,23 km,All year,8900,https://trekthehimalayas.com/chopta-chandrashila-deoria-tal-trek
Kedarkantha,Uttarakhand,Sankri,Easy to Moderate,6 Days,20 km,December to April,10900,https://trekthehimalayas.com/kedarkantha-trek
Brahmatal,Uttarakhand,Lohajung,Easy to Moderate,6 Days,26 km,December to March,10900,https://trekthehimalayas.com/brahmatal-trek
Valley of Flowers & Hemkund,Uttarakhand,Pipalkoti,Easy to Moderate,6 Days,37 km,July to September,11800,https://trekthehimalayas.com/valley-of-flowers-trek
Kuari Pass,Uttarakhand,Pipalkoti,Moderate,6 Days,27 km,All year,11900,https://trekthehimalayas.com/winter-kuari-pass-trek
Phulara Ridge,Uttarakhand,Sankri,Easy to Moderate,6 Days,29 km,"May, June, October, November",9500,https://trekthehimalayas.com/phulara-ridge-trek
Ali Bedni Bugyal,Uttarakhand,Lohajung,Moderate,6 Days,31 km,"May, June, September, October",9800,https://trekthehimalayas.com/ali-bedni-bugyal-trek
Gulabi Kantha,Uttarakhand,Hanuman Chatti,Moderate,5 Days,24 km,All year,10900,https://trekthehimalayas.com/gulabi-kantha-trek
Kareri Lake,Himachal Pradesh,Kareri Village,Easy,3 Days,26 km,April to November,5500,https://trekthehimalayas.com/kareri-lake-trek
Tarsar Marsar,Kashmir,Aru,Moderate,7 Days,48 km,"July, August",17000,https://trekthehimalayas.com/tarsar-marsar-trek
Sandakphu Trek,West Bengal,Sepi,Moderate,7 Days,68 km,All year except monsoon,13900,https://trekthehimalayas.com/sandakphu-trek
Bajre Dara,Sikkim,Yuksom,Moderate,5 Days,22 km,November to March,12600,https://trekthehimalayas.com/bajre-dara-trek
Roopkund,Uttarakhand,Lohajung,Moderate to Difficult,8 Days,53 km,"May, June, September, October",-,https://trekthehimalayas.com/roopkund-trek
Rupin Pass,Himachal Pradesh,Bawta,Moderate to Difficult,7 Days,42 km,"May, June, September, October",16500,https://trekthehimalayas.com/rupin-pass-trek
Gaumukh Tapovan,Uttarakhand,Gangotri,Moderate to Difficult,8 Days,40 km,"May, June, September, October",17500,https://trekthehimalayas.com/gaumukh-tapovan-trek
Kedartal,Uttarakhand,Gangotri,Difficult,7 Days,32 km,"May, June, October",16000,https://trekthehimalayas.com/kedar-tal-trek
Satopanth Lake,Uttarakhand,Pipalkoti,Moderate to Difficult,6 Days,40 km,"May, June, October",22500,https://trekthehimalayas.com/satopanth-lake-trek
Bagini Glacier,Uttarakhand,Pipalkoti,Moderate to Difficult,9 Days,43 km,"May, June, September",14800,https://trekthehimalayas.com/bagini-glacier-and-changbang-base-camp
Pangarchulla Peak,Uttarakhand,Pipalkoti,Moderate to Difficult,7 Days,39 km,March-April,13250,https://trekthehimalayas.com/pangarchulla-peak-trek
Panwali Kantha,Uttarakhand,Ghuttu,Moderate,5 Days,40 km,"May, June, September, October",14500,https://trekthehimalayas.com/panwali-kantha
Bhrigu Lake,Himachal Pradesh,Gulaba,Easy to Moderate,4 Days,24 km,May to September,7500,https://trekthehimalayas.com/bhrigu-lake-trek
Beas Kund,Himachal Pradesh,Dhundi,Easy to Moderate,4 Days,18 km,"May, June, August, September",7950,https://trekthehimalayas.com/beas-kund-trek
Hampta Pass,Himachal Pradesh,Manali,Moderate,5 Days,24 km,June to September,12500,https://trekthehimalayas.com/hampta-pass-trek
Sar Pass,Himachal Pradesh,Kasol,Moderate,5 Days,33 km,"May, June",11300,https://trekthehimalayas.com/sar-pass-trek
Chandrakhani Pass,Himachal Pradesh,Manali,Easy to Moderate,5 Days,20 km,May to September,11200,https://trekthehimalayas.com/chandrakhani-pass-trek
Kashmir Great Lakes,Kashmir,Sonamarg,Moderate to Difficult,8 Days,72 km,"July, August",21000,https://trekthehimalayas.com/kashmir-great-lakes-trek
Markha Valley,Ladakh,Leh,Moderate,7 Days,53 km,May to September,22500,https://trekthehimalayas.com/markha-valley-trek
Har Ki Dun Trek,Uttarakhand,Sankri,Easy to Moderate,7 Days,36 km,April to November,12500,https://trekthehimalayas.com/har-ki-dun-trek
Dodital - Darwa Pass,Uttarakhand,Uttarkashi,Moderate,7 Days,50 km,April to November,11400,https://trekthehimalayas.com/dodital-darwa-pass-trek
Pindari Glacier,Uttarakhand,Khati,Moderate,6 Days,50 km,"May, June, September, October",14500,https://trekthehimalayas.com/pindari-glacier-trek
Doodhpathri,Kashmir,Doodhpathri,Moderate to Difficult,7 Days,49 km,"July, August",16800,https://trekthehimalayas.com/doodhpathri-trek
Surya Top,Uttarakhand,Natin Village,Moderate,7 Days,32 km,"May, June, October, November",11500,https://trekthehimalayas.com/surya-top-trek
Ranthan Kharak,Uttarakhand,Kathgodam,Moderate,7 Days,37 km,"May, June, September, October",9500,https://trekthehimalayas.com/ranthan-kharak-trek
Everest Base Camp (EBC),Nepal,Kathmandu,Difficult,13 Days,112 km,"March, April, May, October, November",75500,https://trekthehimalayas.com/everest-base-camp-trek
Gokyo Lakes Trek,Nepal,Kathmandu,Difficult,17 Days,138 km,"March, April, May, October",97000,https://trekthehimalayas.com/everest-base-camp-via-gokyo-ri
Annapurna Circuit,Nepal,Kathmandu,Difficult,15 Days,158 km,"March, April, May, October",75000,https://trekthehimalayas.com/annapurna-circuit-trek
Annapurna Base Camp,Nepal,Pokhara,Moderate,9 Days,70 km,March to May | September to November,37500,https://trekthehimalayas.com/annapurna-base-camp-trek
Manaslu Circuit,Nepal,Kathmandu,Difficult,14 Days,140 km,"April, May, October",88000,https://trekthehimalayas.com/manaslu-circuit-trek
Lobuche Peak,Nepal,Kathmandu,Challenging,18 Days,124 km,"April, May, October",20100,https://trekthehimalayas.com/lobuche-peak-trek
Mera Peak,Nepal,Kathmandu,Challenging,15 Days,100 km,"April, May, October",185000,https://trekthehimalayas.com/mera-peak-expedition"""

import json

def get_slug(name):
    return name.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('&', 'and').replace(',', '').replace('--', '-')

def map_difficulty(d):
    d = d.lower()
    if 'difficult' in d and 'moderate' in d: return 'Advanced'
    if 'difficult' in d: return 'Expert'
    if 'challenging' in d: return 'Expert'
    if 'moderate' in d: return 'Intermediate'
    if 'easy' in d: return 'Beginner'
    return 'Intermediate'

def map_duration(d):
    try:
        days = int(re.search(r'\d+', d).group())
        if days >= 7: return '7+ days'
        if days >= 3: return '3–5 days'
        return 'Weekend'
    except:
        return '7+ days'

def map_region(r):
    if r in ['Sikkim', 'Nagaland', 'Arunachal Pradesh', 'Meghalaya']: return 'Northeast'
    if r in ['Uttarakhand', 'Himachal Pradesh', 'Ladakh', 'Kashmir', 'Nepal']: return 'Himalayas'
    if r == 'West Bengal': return 'Himalayas'
    return 'Himalayas'

def map_months(s):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    found = []
    for m in months:
        if m in s:
            found.append(m)
    return found

reader = csv.DictReader(io.StringIO(csv_raw))
results = []
for i, row in enumerate(reader):
    name = row['Trek Name']
    slug = get_slug(name)
    region = map_region(row['Region'])
    state = row['Region']
    diff = map_difficulty(row['Difficulty'])
    duration = map_duration(row['Duration'])
    durationDays = row['Duration']
    cost = row['Cost (INR)']
    link = row['Link']
    months = map_months(row['Best Season'])
    
    adv = {
        "id": str(100 + i),
        "slug": slug,
        "name": name,
        "tagline": f"{name} in {state}",
        "region": region,
        "state": state,
        "type": "Trekking",
        "difficulty": diff,
        "duration": duration,
        "durationDays": durationDays,
        "terrain": f"High altitude trek starting from {row['Base Camp']}",
        "bestSeason": row['Best Season'],
        "bestMonths": months,
        "groupSize": "Small group (2–6)",
        "heroImage": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=70",
        "galleryImages": [],
        "lat": 0,
        "lng": 0,
        "description": f"{name} is a {row['Difficulty']} trek in {state} spanning {row['Distance']}.",
        "whatMakesSpecial": f"Spectacular views of the {state} mountains.",
        "whoFor": f"Trekkers looking for a {diff.lower()} challenge.",
        "whoNot": "Those not physically fit for high altitude.",
        "safetyNotes": "Carry high altitude gear and follow guide instructions.",
        "operators": [{ "name": "Trek The Himalayas", "verified": True, "priceFrom": f"₹{cost}", "rating": 4.8, "website": link }],
        "tags": ["trekking", state.lower(), diff.lower()],
        "featured": False,
    }
    results.append(adv)

print(json.dumps(results, indent=2))
