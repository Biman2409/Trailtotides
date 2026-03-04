import json

with open('new_adventures.json', 'r') as f:
    adventures = json.load(f)

# Skip Chadar Trek (Frozen River) which is at index 5 (id 105)
# Actually let's just match by name
to_skip = ["Chadar Trek (Frozen River)"]

output = []
for adv in adventures:
    if adv['name'] in to_skip:
        continue
    
    # Format bestMonths as [ "Jan", "Feb" ]
    best_months = json.dumps(adv['bestMonths'])
    
    # Format operators
    ops = []
    for op in adv['operators']:
        ops.append(f'{{ name: "{op["name"]}", verified: {str(op["verified"]).lower()}, priceFrom: "{op["priceFrom"]}", rating: {op["rating"]}, website: "{op["website"]}" }}')
    ops_str = "[" + ", ".join(ops) + "]"
    
    # Format tags
    tags = json.dumps(adv['tags'])
    
    obj = f"""    {{
      id: "{adv['id']}",
      slug: "{adv['slug']}",
      name: "{adv['name']}",
      tagline: "{adv['tagline']}",
      region: "{adv['region']}",
      state: "{adv['state']}",
      type: "Trekking",
      difficulty: "{adv['difficulty']}",
      duration: "{adv['duration']}",
      durationDays: "{adv['durationDays']}",
      terrain: "{adv['terrain']}",
      bestSeason: "{adv['bestSeason']}",
      bestMonths: {best_months},
      groupSize: "Small group (2–6)",
      heroImage: "{adv['heroImage']}",
      galleryImages: [],
      lat: 0,
      lng: 0,
      description: "{adv['description']}",
      whatMakesSpecial: "{adv['whatMakesSpecial']}",
      whoFor: "{adv['whoFor']}",
      whoNot: "{adv['whoNot']}",
      safetyNotes: "{adv['safetyNotes']}",
      operators: {ops_str},
      tags: {tags},
      featured: false,
    }},"""
    output.append(obj)

print("\n".join(output))
