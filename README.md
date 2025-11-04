# OAR Angular applications for the NIST Public Data Repository (oar-pdr-angular)

[![main branch status](https://github.com/usnistgov/oar-pdr-angular/actions/workflows/main.yml/badge.svg)](https://github.com/usnistgov/oar-pdr-angular/actions/workflows/main.yml) | 
[![integration branch status](https://github.com/usnistgov/oar-pdr-angular/actions/workflows/integration.yml/badge.svg)](https://github.com/usnistgov/oar-pdr-angular/actions/workflows/integration.yml)

This repository provides the [Angular](https://angular.io) applications that provide the web
front-ends to the NIST Public Data Repository (PDR) and related tools.  The PDR is developed and
operated as part of the NIST Open Access to Research (OAR) program.  The specific applications
provided include:
  * pdr-lps -- the PDR Landing Page Service (LPS)
  * midas-author -- an application for creating a new non-literature digital asset (e.g. data,
    software) publication with two parts: a creation wizard and an editor.
  * pdr-rpa -- application for managing requests for requests for restricted public data with two
    parts:  one used by public users to request access (pdr-rpa-approve) and one used by internal
    users to approve requests.  

As software based on the the [Angular](https://angular.io/) application framework, the code is
written primarily in [Typescript](https://typescriptlang.org).

## Contents

```
pdr-lps      --> the Angular project directory for the pdr-lps app
midas-author --> contains Angular project directories for the two parts of the DAPTool
pdr-rpa      --> contains Angular project directories for the two parts of RPA app
oar-lps      --> contains Angular library project, oarlps, containing common code used by the
                 above applications
scripts/     --> Tools for running the demonstrations and running all tests
oar-build/   --> general oar build system support (do not customize)
docker/      --> Docker containers for building and running tests
.github/     --> GitHub repository configuration, including CI scripts for GitHub Actions
CODEOWNERS   --> A listing of contacts, administrators, and contributors for this repository
LICENSE.md   --> A statement of rights and responsibilities for use and copying of this software
```

## Prerequisites

Software in this repository is built using the [Angular](https://angular.io/) application framework
(v13), and, thus, is built and run using `nodejs` and `npm`.  Both become available to your
development environment when you install,

  * node 18.20.0 or higher

All prerequisite Javascript modules needed are provided via the `npm` build tool.  See
`package.json` for a listing of primary dependencies and `package-lock.json` for a
complete listing of all dependencies.

### Acquiring prerequisites via Docker

As an alternative to explicitly installing prerequisites to run the tests, the `docker` directory
contains scripts for building a Docker container with all prerequites installed in a properly
configured environment.  Running the `docker/run.sh` script will build the containers (caching them
locally), start the container, and put the user in a bash shell in the container.  From there, one
can run applications or tests.

The `scripts` directory also includes scripts that will launch Docker containers to build the
software (`makedist.docker`) and run tests (`testall.docker`).

To use these scripts and containers, Docker must be installed separately.  

## Building and Testing the software

As a standard OAR repository, it includes simple language-independent tools for building and testing
the software without special knowledge of Typescript or Angular (assuming all prerequisites have
been installed first); these are described in the section
["Simple Building and Testing with OAR Tools"](#simple-building-and-testing-with-oar-tools).

Developers, on the other hand, primarily use the native tools (`npm`) to build and test as described
in ["Building and Testing Using Native Tools"](#building-and-testing-using-native-tools).  

### Simple Building and Testing with OAR Tools

As a standard OAR repository, the software products can be built by simply via the `makedist`
script, assuming the prerequisites are installed:

```
  scripts/makedist
```

The built products will be written into the `dist` subdirectory (created by the `makedist`); each
will be written into a zip-formatted file with a name formed from the product name and a version
string.

The individual products can be built separately by specifying the product name as arguments, e.g:

```
  scripts/makedist pdr-lps
  scripts/makedist midas-author
```

Additional options are available; use the `-h` option to view the details:

```
  scripts/makedist -h
```

The `testall` script can be used to execute all unit and integration tests:

```
  scripts/testall
```

Like with `makedist`, you can run the tests for the different products separately by listing the
desired product names as arguments to `testall`.  Running `testall -h` will explain available
command-line options.


### Building and Testing Using Native Tools

The `npm` tool can be used in the standard way for [Angular projects](https://angular.io/docs) to
build and test this software.

Detail commands and instructions:

1. Clone this repository and update Angular library
    
    After clone the repository, do the following:
    
```
    cd oar-pdr-angular
    git submodule update --init --recursive
    cd lib
    git checkout integration
```

Now lib folder should have the latest code of oar-lib-angular.
    
2. Install packages

    Go to root folder, switch to initial-portal-setup02 branch, then do npm install:
    
```    
    Note: make sure your npm version is 7.0.0 or higher. Use npm -v to check your version. 
    If not, run npm install -g npm@latest.
    
    cd ..
    git checkout feature/add-lps-lib
    npm i --legacy-peer-deps
```    
    
3. Build and run your application

You can build Angular library and your application separately or with one command.

To build Angular library:

```    
    npm run build-lib
```

Yo build local Angular library:

```
    npm run build-oarlps
```

To build and run wizard:

```    
    npm run build-sw
    npm run start-sw
```

To build MIDAS publishing UI application:

```    
    npm run build-midaslps
    npm run start-midaslps
```

To build public landing page:

```    
    npm run build-pdrlps
    npm run start-pdrlps
```

4. Testing your app locally

Wizard:

```
    http://localhost:4200
```

Publishing UI:
    Set the following flags in environment.ts:
        useMetadataService: false
        useCustomizationService: false

        editEnabled: true

```
    http://localhost:4202/od/id/test1?editEnabled=true
```

Public landing page:
    Set the following flags in environment.ts:
        useMetadataService: false
        useCustomizationService: false

        editEnabled: false

```
    http://localhost:4201/od/id/test1
```

#### Unit Testing and Debugging

As described above, the `testall` script will run all unit tests for all applications and
libraries in this repo (as well as for individual components).  This script runs the tests via
npm scripts defined in the `package.json` file.  For example, to run the tests for the
`oarlps` library, type:

```
    npm run test:oarlps
```

The following script names run tests for individual components:
&nbsp; `test:oarlps` -- run tests in the `oarlps` library
&nbsp; `test:pdrlps` -- run tests in the pdr-lps application
&nbsp; `test:wizard` -- run tests in the midas-author wizard application
&nbsp; `test:midasauthor` -- run tests in the midas-author lps application
&nbsp; `test:pdr-rpa-request` -- run tests in the pdr-rpa request application
&nbsp; `test:pdr-rpa-approve` -- run tests in the pdr-rpa approve application

To restrict the test execution to just one `.spec.ts` file, add the file name (without a path
or `.ts` extension) to the npm command line:

```
    npm run test:oarlps nerdm.service.spec
```

Test debugging can be accomplished via the [`node` interpreter's "inspect"
feature](https://nodejs.org/en/learn/getting-started/debugging).  Before starting the
debugger, one normally sets an initial breakpoint by inserting a ``debugger;`` line
into the "spec" file.  Then, to execute the test in debug mode, one uses a command of
this form:

&nbsp;`node --inspect-brk node_modules/.bin/jest --runInBand --config` _path-to-jest-config_ _spec-file_

For example,
```
    node --inspect-brk node_modules/.bin/jest --runInBand --config oar-lps/libs/oarlps/jest.config.js nerdm.service.spec
```

(The `.ts` extension on the _spec-file_ is optional.)

The node interpreter, after starting, will pause to wait for a debugger to connect.  [Different
debugger clients are
supported](https://nodejs.org/en/learn/getting-started/debugging#inspector-clients), including
the Chrome browser and VisualStudio.  To debug using Chrome,

  1.  Start the Chrome browser
  2.  Navigate to "chrome://inspect"; if node is waiting, this page will show an "inspect"
      link at the bottom.
  3.  Click "inspect" link; this will open the Chrome's developer tool window open to the
      debugger.
  4.  Click the play button to execute until the first ``debugger;`` line is reached.

From there, use the Chrome debugger features to set additional breakpoints as needed.  

## Repository Administration

Please see [`LICENSE.md`](LICENSE.md) for the current licensing statements.  Software in this
repository is open-source and held in the public domain.

### Contacts

The administrators of this repository include:

  * Gretchen Greene (gretchen.greene@nist.gov)
  * Jon Zhang (.zhang@nist.gov)
  * Ray Plante (raymond.plante@nist.gov)
  * Christopher David (christopher.davis@nist.gov)

