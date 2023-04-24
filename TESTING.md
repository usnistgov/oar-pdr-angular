# Unit Test with Jest for Angular Projects

## Migrate to Jest

Folllowing step-by-step guide on how to remove Karma and set up Jest for an Angular project:

### Clone your app (do not run npm install just yet)

Inside the `oar-pdr-angular` project, run the following commands:

```sh
git clone https://github.com/usnistgov/oar-pdr-angular.git
cd oar-pdr-angular/
git submodule update --init --recursive
cd lib
git checkout integration
cd ..
git checkout <FEATURE_BRANCH>
```

### Get rid of Karma

1. Remove all Karma and Jasmine related dependencies from the `package.json` file of all projects and libraries. In the case of `oar-pdr-angular`, clean it up under `midas-author/wizard` and `oarlps`.

2. Build your app to ensure everything is still working. 

Inside `oar-pdr-angular`, run the following commands:

```sh
npm i --legacy-peer-deps
npm i rxjs@6.6.7 --legacy-peer-deps

// Build general lib
npm run build-lib

// Build lps lib
npm run build-oarlps

// Build wizard
npm run build-sw

// Build publishing UI
npm run build-midaslps
```

3. Delete the following two files from each project and library:

```sh
karma.config.js
src/test.ts
```

For the `oar-pdr-angular` project, delete the following files:

```sh
/midas-author/lps/karma.config.js
/midas-author/lps/src/test.ts
/midas-author/wizard/karma.config.js
/midas-author/wizard/src/test.ts
/oar-lps/libs/oarlps/karma.config.js
/oar-lps/libs/oarlps/src/test.ts
/pdr-lps/karma.config.js
/pdr-lps/src/test.ts
/pdr-rpa/pdr-rpa-approve/karma.config.js
/pdr-rpa/pdr-rpa-approve/src/test.ts
/pdr-rpa/pdr-rpa-request/karma.config.js
/pdr-rpa/pdr-rpa-request/src/test.ts
```

4. Remove `src/test.ts` from the `"files"` key in the following files (if any): 

```sh
tsconfig.lib.json
tsconfig.app.json
tsconfig.spec.json
```

Change the following:

```json
"files": [
  "src/test.ts"
],
```

to:

```json
"files": [],
```

For the `oar-pdr-angular` project, update the following files:

```sh
/midas-author/lps/src/tsconfig.spec.json
/midas-author/wizard/tsconfig.spec.json
/oar-lps/libs/oarlps/tsconfig.lib.json
/oar-lps/libs/oarlps/tsconfig.spec.json
/pdr-rpa/pdr-rpa-approve/tsconfig.spec.json
/pdr-rpa/pdr-rpa-request/tsconfig.spec.json
```


5. Delete the `test` folder.

6. Delete the `"test"` key from the `angular.json` file (both libs and projects).

For the `oar-pdr-angular` project, update the following files:

```sh
/midas-author/lps/angular.json
/midas-author/wizard/angular.json
/oar-lps/angular.json
/pdr-lps/angular.json
/pdr-rpa/pdr-rpa-approve/angular.json
/pdr-rpa/pdr-rpa-request/angular.json
```


### Set up Jest

1. Run the following command at the root folder (in the case of `oar-pdr-angular`, /oar-pdr-angular/):

```sh
npm i -D @types/jest jest jest-preset-angular ts-jest --legacy-peer-deps
```

2. At the root of each project and library, add the following files:

- `jest.config.js`

Put the following content in the file:

```ts
module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['./setup-jest.ts'],
    moduleNameMapper: {
        "^lodash-es$": "lodash"
    },
    globalSetup: 'jest-preset-angular/global-setup'
};
```

- `setup-jest.ts`

Put the following content in the file:

```ts
import 'jest-preset-angular/setup-jest';
```

3. Add the Jest types. Otherwise, the compiler will not recognize `describe()`, `it()`, etc.


Add `"jest"` to the types array in all `tsconfig.spec.json` files at the root of each project and library.

If there is no `tsconfig.spec.json` file, create one with the following content for each project:

For each project (please note project and library are different), please note the path of `extends` should point to `tsconfig.json` at the root directory (/oar-pdr-angular):

For example, for `midas-author/lps`, extends should be:

```json
"extends": "../../tsconfig.json",
```

For pdr-lps, extends should be:

```json
"extends": "../tsconfig.json",
```

`tsconfig.spec.json` for projects (**/midas-author/lps**, /**midas-author/wizard**, **/pdr-lps**, **/pdr-rpa/pdr-rpa-approve**, **/pdr-rpa/pdr-rpa-request**):

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jest", "node"
    ]
  },
  "files": [
    "src/polyfills.ts"
  ],
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

4. Set the `esModuleInterop` flag to true in all `tsconfig.json` files (not `tsconfig.lib.json`) under `"compilerOptions"` and `"angularCompilerOptions"`.

5. In your root tsconfig.json, add the following to `"compilerOptions"`:

```json
"typeRoots": [
    "node_modules/@types"
],
```


6. Add the following script to your root `package.json` under `"scripts"` based on your project setup:

For the `oar-pdr-angular` project:

```json
"test": "npm run test:midasauthor; npm run test:wizard; npm run test:oarlps; npm run test:pdrlps",
"test:midasauthor": "jest --config ./midas-author/lps/jest.config.js --silent",
"test:wizard": "jest --config ./midas-author/wizard/jest.config.js --silent",
"test:oarlps": "jest --config ./oar-lps/libs/oarlps/jest.config.js --silent",
"test:pdrlps": "jest --config ./pdr-lps/jest.config.js --silent"
"test:pdr-rpa-approve": "jest --config ./pdr-rpa/pdr-rpa-approve/jest.config.js --silent"
"test:pdr-rpa-request": "jest --config ./pdr-rpa/pdr-rpa-request/jest.config.js --silent"
```


(**--silent** means to hide console log output)

###	Testing

To test all, run the following command:

```sh
npm run test
```

To test single file, run the following command:

```sh
npm run test:midasauthor landingpage.component.spec.ts
```


### Debug with Jest

1. Place debugger wherever you want to set the breakpoint.

2. Run the following command in a console window (the command is from [Jest troubleshooting website](https://jestjs.io/docs/troubleshooting)) in the root folder of a project or library to debug the project or library:

```sh
node --inspect-brk ../../node_modules/.bin/jest --runInBand --config ./jest.config.js
```

Use `../` instead of `../../` if your project root is only one level under the main root folder.

To debug a single file:

```sh
node --inspect-brk ../../node_modules/.bin/jest --runInBand --config ./jest.config.js filename
```

For example:

```sh
node --inspect-brk ../../node_modules/.bin/jest --runInBand --config ./jest.config.js landingpage.component.spec
```

You will see something like this:

```sh
Debugger listening on ws://127.0.0.1:9229/c769d9b4-eab3-41f4-afd6-ccb9b0006eb8
For help, see: https://nodejs.org/en/docs/inspector
```

3. Open Chrome inspect: `chrome://inspect` and click on `“inspect”` at the bottom.

[image_placeholder]

You will see:

[image_placeholder]

4. Click on `"Next"`, and the app should pause at the breakpoint.

[image_placeholder]


### Troubleshooting

1. If you get this error when running the command:

```sh
node --inspect-brk node_modules/.bin/jest --runInBand

FAIL projects/wizard/src/app/startwiz/navigator/navigator.component.spec.ts
```

**Solution**: Specify the config file in the command:

```sh
node --inspect-brk ../../node_modules/.bin/jest --runInBand --config ./jest.config.js
```


2. If you get this error when trying to debug:

```sh
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
```

**Solution**: Make sure you did step 5 correctly:

In your root `tsconfig.json`, add the following to `"compilerOptions"`:`

```json
"typeRoots": [
    "node_modules/@types"
],
```

3. If the compiler does not recognize `describe()`, `it()`, and `expec()`, you might need to run the following command under project root as well:

```sh
npm i -D @types/jest jest jest-preset-angular ts-jest --legacy-peer-deps
```


## Examples

### Unit Test an Angular Service

Consider this example of an Angular service that uses HTTP:

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MyService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/users'; // URL to web api

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get<any[]>(this.apiUrl);
  }
}
```

This service has a method called getData() that takes a URL as input and returns an Observable that emits the response from the HTTP GET request. The `HttpClient` is injected into the service's constructor and used to make the HTTP request.

To unit test this service, we would use this typical structure:

- Create a test suite that includes:
  - a `beforeEach()` function to set up the testing module
  - a `afterEach()` function to verify that no unexpected HTTP requests were made, 
  - one or more `it()` functions to test individual methods of the service. 

- We make use of:
  - `HttpClientTestingModule`: a module that provides an implementation of `HttpClient` that can be used in unit tests. It allows us to test the HTTP requests and responses that our services make to external APIs without actually making the requests.

  - `HttpTestingController`: a service that allows us to control and verify the HTTP requests that our services make during unit tests. It provides a way to mock HTTP responses for our test cases and to verify that the correct HTTP requests were made by our services.


Following is an example test suite for this service:

```ts
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { MyService } from "./myservice";

describe("MyService", () => {
  let mockHttp: HttpTestingController;
  let myService: MyService;

  beforeEach(() => {
    // Set up the testing module with the HttpClientTestingModule and MyService provider
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyService],
    });

    // Get a reference to the HttpTestingController for making requests and flushing responses
    mockHttp = TestBed.inject(HttpTestingController);

    // Get a reference to the MyService instance being tested
    myService = TestBed.inject(MyService);
  });

  afterEach(() => {
    // Verify that no outstanding requests remain after each test
    mockHttp.verify();
  });

  // Test suite
  describe("#getData", () => {
    // Test 1
    it("should return data", async () => {
      const data = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ];
      const url = "https://jsonplaceholder.typicode.com/users";

      // Make the HTTP request
      const promise = myService.getData(url).toPromise();

      // Respond with mock data
      const req = mockHttp.expectOne(url);
      req.flush(data);

      // Wait for the promise to resolve
      await promise;

      // Check the response data
      const responseData = await promise;

      // Assert
      expect(responseData).toEqual(data);
    });

    // Test 1
    it("should handle errors", async () => {
      const errorMessage = "An error occurred";
      const url = "https://jsonplaceholder.typicode.com/users";

      // Make the HTTP request
      const promise = myService.getData(url).toPromise();

      // Respond with an error
      const req = mockHttp.expectOne(url);
      req.flush(null, { status: 500, statusText: errorMessage });

      // Wait for the promise to resolve
      let responseError;
      try {
        await promise;
      } catch (error) {
        responseError = error;
      }

      // Check the error message
      expect(responseError).toBeDefined();
      expect(responseError.message).toEqual(errorMessage);
    });
  });
});
```


### Unit Test an Angular Component:

Following is an example of a component that makes use of `MyService` to fetch some data and display it in an HTML list:

```ts
import { Component, OnInit } from '@angular/core';
import { MyService } from './my.service';

@Component({
  selector: 'app-my-component',
  template: `
    <h1>Data:</h1>
    <ul>
      <li *ngFor="let item of data">{{ item.name }}</li>
    </ul>
  `,
})
export class MyComponent implements OnInit {
  data: any[];

  constructor(private myService: MyService) {}

  ngOnInit(): void {
    this.myService.getData().subscribe(
      (response) => {
        this.data = response;
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
```

And following is an example of how to unit test this component:

```ts
// Import necessary modules and components
describe("MyComponent", () => {
  let fixture: ComponentFixture<MyComponent>; // Reference to the component fixture
  let myComponent: MyComponent; // Reference to the component instance
  let myService: MyService; // Reference to the MyService instance

  beforeEach(async () => {
    // Set up the testing module
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [MyComponent],
      providers: [MyService],
    }).compileComponents();
    // Create the component fixture
    fixture = TestBed.createComponent(MyComponent);

    // Get a reference to the component instance
    myComponent = fixture.componentInstance;

    // Get a reference to the MyService instance
    myService = TestBed.inject(MyService);

    // mock data
    const mockData = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ];

    // Spy on the getData method of MyService and make it return mockData
    jest.spyOn(myService, "getData").mockReturnValue(of(mockData));
  });

  // Test 1
  it("should create", () => {
    // Assert that the component instance exists
    expect(myComponent).toBeTruthy();
  });

  // Test 2
  it("should display list of items", () => {
    // Render the component
    fixture.detectChanges();

    // Find the list element in the DOM
    const list = fixture.nativeElement.querySelector("ul");

    // Expect the list element to exist
    expect(list).toBeTruthy();
  });

  // Test 3
  it("should call MyService.getData on init", async () => {
    // Wait for the fixture to stabilize
    await fixture.whenStable();
    // Assert that MyService.getData was called
    expect(myService.getData).toHaveBeenCalled();
  });

  // Test 4
  it("should fetch the data", async () => {
    // Wait for the fixture to stabilize
    await fixture.whenStable();
    // Assert that the data is correct
    expect(myComponent.data).toEqual([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ]);
  });

  afterEach(() => {
    // Reset the MyService spy if needed
    jest.spyOn(myService, "getData").mockReset();
  });
});
```

You can find more information about testing Angular with Jest in the official documentations:

- [Angular Unit Testing](https://angular.io/guide/testing-components-scenarios)
- [Jest documentation](https://jestjs.io/docs/getting-started)

Other guides:

- [Testing Angular Faster with Jest](https://www.xfive.co/blog/testing-angular-faster-jest/)
