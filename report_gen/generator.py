from typing import Dict, List
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

        # takes the filenames from the json file, uses them to create InlineImages
        filenames: List[str] = json_data["filenames"]
        images: List = []
        for index, filename in enumerate(filenames):
            path = "../report_gen/img/" + filename

            # need to open and resave image - problem with docxtpl and iOS images :/
            img = Image.open(path)
            img = img.save(path)

            image = {
                "image"     : InlineImage(template, path, height=Mm(70)),
                "caption"   : json_data["captions"][index]
            }
            
            images.append(image)
        #endfor
        
        json_data["image_external_wall"] = images
        print(json_data)

        # render new doc
        template.render(json_data, autoescape=True)
        template.save("../report_gen/generated_report_test.docx")

        print("generated successfully")
    except Exception as e:
        print(traceback.format_exc())
        print("error: ", e)
    