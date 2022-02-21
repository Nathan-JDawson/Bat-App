from docxtpl import DocxTemplate # type: ignore
import json

def open_json(filename):
    with open(filename) as f:
        data = json.load(f)
    # endwith

    return data

if __name__ == "__main__":
    try:
        # will need to be able to take an argument for the filename

        # file path is from the node server folder, as that is where the process is called
        json_data = open_json("../node server/data.json")

        # import the template doc
        template = DocxTemplate("../report_gen/simply_ecology_template.docx")

    
        # render new doc
        template.render(json_data, autoescape=True)
        template.save("../report_gen/generated_report_test.docx")

        print("generated successfully")
    except Exception as e:
        print("error: ", e)
    