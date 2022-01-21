import sys
from typing import List, Dict
from docxtpl import DocxTemplate
import random
import json

def open_json(filename):
    with open(filename) as f:
        data = json.load(f)
    # endwith

    return data

if __name__ == "__main__":
    json_data = open_json("data.json")

    # import the template doc
    template = DocxTemplate("report_template.docx")

    table_contents: List[Dict[str, int]] = []

    # generate random values for the table
    for i in range(10):
        features = {}
        for j in range(1,6):
            number = random.randint(0, 100)
            features["Feature_" + str(j)] = number
        # endfor
        table_contents.append(features)
    # endfor

    json_data["table_1"] = table_contents

    print(json_data)

    # render new doc
    template.render(json_data)
    template.save("generated_report_test.docx")