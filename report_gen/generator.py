from typing import Dict
import traceback
from docx.shared import Mm # type: ignore
from docxtpl import DocxTemplate, InlineImage # type: ignore
import json
from PIL import Image # type: ignore

def open_json(filename: str) -> Dict:
    with open(filename) as f:
        data: Dict = json.load(f)
    # endwith

    return data

if __name__ == "__main__":
    try:
        # will need to be able to take an argument for the filename

        # file path is from the node server folder, as that is where the process is called
        json_data: Dict = open_json("../node server/data.json")

        # import the template doc
        template = DocxTemplate("../report_gen/simply_ecology_template.docx")

        # filepath: str = "../report_gen/img/" + json_data["filenames"][0]
        # img = Image.open(filepath)
        # img = img.save(filepath)
        # json_data["image_external_wall_1"] = InlineImage(template, filepath, height=Mm(60))

        # render new doc
        template.render(json_data, autoescape=True)
        template.save("../report_gen/generated_report_test.docx")

        print("generated successfully")
    except Exception as e:
        print(traceback.format_exc())
        print("error: ", e)
    