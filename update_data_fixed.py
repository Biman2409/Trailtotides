
import json
import re

def process_data():
    with open('data_backup.ts', 'r') as f:
        content = f.read()

    # Find the adventures array
    match = re.search(r'export const adventures: Adventure\[\] = \[(.*?)\];\s*export const stories', content, re.DOTALL)
    if not match:
        print("Could not find adventures array precisely")
        # Fallback to a simpler match if needed
        match = re.search(r'export const adventures: Adventure\[\] = \[(.*)\];', content, re.DOTALL)
        if not match:
            return

    adventures_str = match.group(1)
    
    with open('new_adventures.json', 'r') as f:
        new_adventures_data = json.load(f)

    to_remove = [
        "munnar-trek", "hampi-biking", "jaisalmer-camel-safari", 
        "goa-kayaking", "arunachal-expedition", "gandikota-trek", 
        "mumbai-rooftop-adventure"
    ]

    def find_objects(s):
        objects = []
        depth = 0
        start = -1
        for i, char in enumerate(s):
            if char == '{':
                if depth == 0:
                    start = i
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0 and start != -1:
                    objects.append(s[start:i+1])
                    start = -1
        return objects

    adventure_objects = find_objects(adventures_str)
    
    updated_adventures = []
    seen_slugs = set()
    
    for obj in adventure_objects:
        slug_match = re.search(r'slug:\s*["\']([^"\']+)["\']', obj)
        if slug_match:
            slug = slug_match.group(1)
            if slug in to_remove:
                continue
            
            # Update baseCamp if it's a Trekking adventure and baseCamp is missing or empty
            type_match = re.search(r'type:\s*["\']([^"\']+)["\']', obj)
            if type_match and type_match.group(1) == "Trekking":
                if 'baseCamp:' not in obj or re.search(r'baseCamp:\s*["\']\s*["\']', obj):
                    terrain_match = re.search(r'terrain:\s*["\'](?:[^"\']*starting from\s+)([^"\']+)["\']', obj)
                    if terrain_match:
                        base_camp = terrain_match.group(1).split(' ')[0].strip(',')
                        obj = re.sub(r'(heroImage:)', f'baseCamp: "{base_camp}",\n      \\1', obj)
            
            updated_adventures.append(obj)
            seen_slugs.add(slug)

    def format_as_ts(adv):
        def format_op(op):
            return f'{{ name: "{op["name"]}", verified: {str(op["verified"]).lower()}, priceFrom: "{op["priceFrom"]}", rating: {op["rating"]}, website: "{op.get("website", "")}" }}'
        
        ops = ", ".join([format_op(op) for op in adv['operators']])
        months = ", ".join([f'"{m}"' for m in adv['bestMonths']])
        
        bc_line = ""
        if adv.get('baseCamp'):
            bc_line = f'\n    baseCamp: "{adv["baseCamp"]}",'
        elif "starting from " in adv['terrain']:
            bc = adv['terrain'].split("starting from ")[1].split(" ")[0].strip(",")
            bc_line = f'\n    baseCamp: "{bc}",'

        return f"""  {{
    id: "{adv['id']}",
    slug: "{adv['slug']}",
    name: "{adv['name']}",
    tagline: "{adv['tagline']}",
    region: "{adv['region']}",
    state: "{adv['state']}",
    type: "{adv['type']}",
    difficulty: "{adv['difficulty']}",
    duration: "{adv['duration']}",
    durationDays: "{adv['durationDays']}",
    altitude: "{adv.get('altitude', '')}",
    terrain: "{adv['terrain']}",{bc_line}
    bestSeason: "{adv['bestSeason']}",
    bestMonths: [{months}],
    groupSize: "{adv['groupSize']}",
    heroImage: "{adv['heroImage']}",
    galleryImages: [],
    lat: {adv['lat']},
    lng: {adv['lng']},
    description: "{adv['description']}",
    whatMakesSpecial: "{adv['whatMakesSpecial']}",
    whoFor: "{adv['whoFor']}",
    whoNot: "{adv['whoNot']}",
    safetyNotes: "{adv['safetyNotes']}",
    operators: [{ops}],
    tags: {json.dumps(adv['tags'])},
    featured: {str(adv['featured']).lower()},
  }}"""

    for adv in new_adventures_data:
        if adv['slug'] not in seen_slugs:
            updated_adventures.append(format_as_ts(adv))
            seen_slugs.add(adv['slug'])

    new_adventures_str = ",\n".join(updated_adventures)
    
    # Correctly replace ONLY the adventures array part
    # We find where adventures start and where stories start
    start_marker = 'export const adventures: Adventure[] = ['
    end_marker = 'export const stories: Story[] = ['
    
    start_pos = content.find(start_marker) + len(start_marker)
    end_pos = content.find(end_marker)
    
    # Find the last ]; before stories
    last_bracket = content.rfind('];', start_pos, end_pos)
    
    new_content = content[:start_pos] + "\n" + new_adventures_str + "\n" + content[last_bracket:]
    
    with open('src/lib/data.ts', 'w') as f:
        f.write(new_content)

if __name__ == "__main__":
    process_data()
