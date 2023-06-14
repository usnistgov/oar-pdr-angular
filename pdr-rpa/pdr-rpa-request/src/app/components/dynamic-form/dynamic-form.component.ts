import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { CustomValidators } from "../../validators/custom-validators";

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  formTemplatesPath: string = "assets/form-templates/";
  myForm: FormGroup = new FormGroup({});
  formFields: any;
  title: string = "RPA Dynamic Form";
  currentDataset: any;
  welcomeMessage: string = "";
  blacklists: any = {};
  iconClasses: any = {
    disclaimer1: "bi bi-arrows-collapse",
    disclaimer2: "bi bi-arrows-collapse",
    terms: "bi bi-arrows-collapse",
  };
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Load dataset by ediid
    const ediid = "ark:/88434/mds2-2909"; 
    this.loadDataset(ediid);
  }
  
  private loadDataset(ediid: string): void {
    // HTTP request to load dataset by ediid
    this.http.get<any>("assets/datasets.json").subscribe((data) => {
      const dataset = data.datasets.find((d: any) => d.ediid === ediid);
      if (dataset) {
        this.currentDataset = dataset;
        this.loadFormData(dataset);
      } else {
        console.error("Dataset not found");
      }
    });
  }

  private loadFormData(dataset: any): void {
    this.http.get<any>(this.formTemplatesPath + dataset.formTemplate).subscribe((data) => {
      this.processFormData(data, dataset);
      this.initializeForm();
    });
  }
  
  private processFormData(data: any, dataset: any): void {
    this.formFields = data["fields"];
    this.title = data["title"];
    this.blacklists = data["blacklists"];
    const values = {
      dataset_link: dataset.url,
    };
    this.welcomeMessage = this.replaceTemplate(
      data["welcomeMessage"],
      values
    );
    console.log(this.formFields);
  }
  
  private initializeForm(): void {
    const formGroup: any = {};
  
    this.formFields.forEach((field: any) => {
      if (field.type === "checkbox") {
        formGroup[field.name] = new FormControl(
          false,
          Validators.requiredTrue
        );
      } else {
        formGroup[field.name] = new FormControl(
          "",
          Validators.compose(this.getValidators(field.validators))
        );
      }
    });
  
    this.myForm = new FormGroup(formGroup);
  }

  getValidators(validators: string[]) {
    const validationFunctions: ValidatorFn[] = [];

    if (validators.includes("required")) {
      validationFunctions.push(Validators.required);
    }

    if (validators.includes("email")) {
      validationFunctions.push(Validators.email);
    }

    if (validators.includes("requiredTrue")) {
      validationFunctions.push(Validators.requiredTrue);
    }

    if (validators.includes("blacklist")) {
      validationFunctions.push(CustomValidators.blacklisted(
        this.blacklists.email.patterns,
        this.blacklists.email.emails, 
        this.blacklists.email.domains
      ));
    }

    if(validators.includes("latinOnly")) {
      validationFunctions.push(CustomValidators.nonLatinCharacters())
    }

    return validationFunctions;
  }

  replaceTemplate(template: string, values: { [key: string]: string }): string {
    return template.replace(
      /\${(.*?)}/g,
      (match, key) => values[key.trim()] ?? ""
    );
  }

  onSubmit() {
    console.log(
      this.formFields
        .filter((field: any) => field.type !== "disclaimer")
        .reduce((acc: any, field: any) => {
          acc[field.name] = this.myForm.value[field.name];
          return acc;
        }, {})
    );
  }

  toggleIcon(fieldId: string) {
    console.log(this.iconClasses[fieldId]);
    this.iconClasses[fieldId] =
      this.iconClasses[fieldId] === "bi bi-arrows-collapse"
        ? "bi bi-arrows-expand"
        : "bi bi-arrows-collapse";
  }

  generateDefaultValues() {
    // read default values from config file
    this.http.get("assets/default-values.json").subscribe((data: any) => {
      // fill out form with default values
      for (let field of this.formFields) {
        if (data[field.name]) {
          this.myForm.controls[field.name].setValue(data[field.name]);
        }
      }
    });
  }
}
