#! /bin/bash
#
# buildall.sh:  build all docker images in this directory
#
# Usage: buildall.sh
#
prog=`basename $0`
execdir=`dirname $0`
[ "$execdir" = "" -o "$execdir" = "." ] && execdir=$PWD
codedir=`(cd $execdir/.. > /dev/null 2>&1; pwd)`
set -e

## These are set by default via _dockbuild.sh; if necessary, uncomment
## and customize
#
PACKAGE_NAME=oar-pdr-angular
# 
## list the names of the image directories (each containing a Dockerfile) for
## containers to be built.  List them in dependency order (where a latter one
## depends the former ones).  
#
DOCKER_IMAGE_DIRS="build-test"

. $codedir/oar-build/_dockbuild.sh

# Override, if need be, the UID of the user to run as in the container; the 
# default is the user running this script.
#
# OAR_DOCKER_UID=

# set BUILD_OPTS and BUILD_IMAGES
# 
setup_build

log_intro   # record start of build into log

# install CA certs into containers that can use them
if { echo $BUILD_IMAGES | grep -qs build-test; }; then
    cp_ca_certs_to build-test
fi

if { echo " $BUILD_IMAGES " | grep -qs " build-test "; }; then
    echo '+' docker build $BUILD_OPTS -t $PACKAGE_NAME/build-test build-test
    docker build $BUILD_OPTS -t $PACKAGE_NAME/build-test build-test 2>&1
fi
