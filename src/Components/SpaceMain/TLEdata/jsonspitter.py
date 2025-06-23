import json

def parse_tle_block(tle_text: str):
    lines = tle_text.strip().splitlines()
    satellites = []

    for i in range(0, len(lines), 3):
        if i + 2 >= len(lines):
            break  # avoid incomplete sets
        name = lines[i].strip()
        line1 = lines[i + 1].strip()
        line2 = lines[i + 2].strip()

        satellites.append({
            "name": name,
            "line1": line1,
            "line2": line2
        })

    return satellites


if __name__ == "__main__":
    with open("src\Components\SpaceMain\TLEdata\data.txt", "r") as file:
        raw_tle = file.read()

    result = parse_tle_block(raw_tle)

    with open("src\Components\SpaceMain\TLEdata\tle_output.json", "w") as outfile:
        json.dump(result, outfile, indent=2)

    print(f"✅ Parsed {len(result)} satellites and saved to tle_output.json")
