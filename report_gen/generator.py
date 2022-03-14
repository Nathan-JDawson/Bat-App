from typing import Dict, List
import traceback
from docx.shared import Mm # type: ignore
from docxtpl import DocxTemplate, InlineImage # type: ignore
import json
from PIL import Image

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
        template = DocxTemplate("../report_gen/exterior_test.docx")
        sd = template.new_subdoc()

        # takes the filenames from the json file, uses them to create InlineImages
        filenames: List[str] = json_data["wall_filenames"] + json_data["roof_filenames"]
        captions: List[str]  = json_data["wall_captions"]  + json_data["roof_captions"]
        images: List = []
        for index, filename in enumerate(filenames):
            path = "../report_gen/img/" + filename

            # need to open and resave image - problem with docxtpl and iOS images :/
            img = Image.open(path)
            img.save(path)

            image: Dict = {
                "image"     : InlineImage(template, path, height=Mm(60)),
                "caption"   : captions[index]
            }
            
            images.append(image)
        #endfor
        
        json_data["image_external"] = images
        print(json_data)

        # render new doc
        template.render(json_data, autoescape=True)
        template.save("../report_gen/generated_report_test.docx")

        print("generated successfully")
    except Exception as e:
        print(traceback.format_exc())
        print("error: ", e)
    