#! /bin/bash
#
# run.sh -- build and optionally test the software in this repo via docker
#
# type "run.sh -h" to see detailed help
#
prog=`basename $0`
execdir=`dirname $0`
[ "$execdir" = "" -o "$execdir" = "." ] && execdir=$PWD
codedir=`(cd $execdir/.. > /dev/null 2>&1; pwd)`
os=`uname`
SED_RE_OPT=r
[ "$os" != "Darwin" ] || SED_RE_OPT=E

dap_dists="midas-author-wizard midas-author-lps"
avail_dists="$dap_dists"

function usage {
    cat <<EOF

$prog - build and optionally test the software in this repo via docker

SYNOPSIS
  $prog [-d|--docker-build] [--dist-dir DIR] [CMD ...] 
        [DISTNAME|angular ...] 
        

ARGS:
  angular   apply commands to all available angular distributions

DISTNAMES:  editable, wizard, pdr-lps

CMDs:
  build     build the software
  test      build the software and run the unit tests
  install   just install the prerequisites (use with shell)
  shell     start a shell in the docker container used to build and test

OPTIONS
  -d        build the required docker containers first
  -t TESTCL include the TESTCL class of tests when testing; as some classes
            of tests are skipped by default, this parameter provides a means 
            of turning them on.
EOF
}

function wordin {
    word=$1
    shift

    echo "$@" | grep -qsw "$word"
}
function docker_images_built {
    for image in "$@"; do
        (docker images | grep -qs $image) || {
            return 1
        }
    done
    return 0
}

set -e

distvol=
distdir=
dodockbuild=
cmds=
args=()
dargs=()
dists=
testcl=()
while [ "$1" != "" ]; do
    case "$1" in
        -d|--docker-build)
            dodockbuild=1
            ;;
        --dist-dir)
            shift
            distdir="$1"
            mkdir -p $distdir
            distdir=`(cd $distdir > /dev/null 2>&1; pwd)`
            distvol="-v ${distdir}:/app/dist"
            args=(${args[@]} "--dist-dir=/app/dist")
            ;;
        --dist-dir=*)
            distdir=`echo $1 | sed -e 's/[^=]*=//'`
            mkdir -p $distdir
            distdir=`(cd $distdir > /dev/null 2>&1; pwd)`
            distvol="-v ${distdir}:/app/dist"
            args=(${args[@]} "--dist-dir=/app/dist")
            ;;
        -t|--incl-tests)
            shift
            testcl=(${testcl[@]} $1)
            ;;
        --incl-tests=*)
            testcl=(${testcl[@]} `echo $1 | sed -e 's/[^=]*=//'`)
            ;;
        -h|--help)
            usage
            exit
            ;;
        -*)
            args=(${args[@]} $1)
            ;;
        midas-author-wizard|midas-author-lps)
            wordin $1 $dists || dists="$dists $1"
            ;;
        editable)
            target=midas-author-lps
            echo "Warning: 'editable' component name is deprecated;" \
                 "treating it as a synonym for $target"
            wordin $target $dists || dists="$dists $target"
            ;;
        wizard)
            target=midas-author-wizard
            echo "Warning: 'wizard' component name is deprecated;" \
                 "treating it as a synonym for $target"
            wordin $target $dists || dists="$dists $target"
            ;;
        angular)
            for target in $dap_dists; do
                wordin $target $dists || dists="$dists $target"
            done
            ;;
        build|install|test|shell)
            cmds="$cmds $1"
            ;;
        *)
            echo Unsupported command: $1
            false
            ;;
    esac
    shift
done

[ -z "$distvol" ] || dargs=(${dargs[@]} "$distvol")
[ -z "${testcl[@]}" ] || {
    dargs=(${dargs[@]} --env OAR_TEST_INCLUDE=\"${testcl[@]}\")
}

dists=`echo $dists`
cmds=`echo $cmds`
[ -n "$dists" ] || dists=$avail_dists
[ -n "$cmds" ] || cmds="build"
echo "run.sh: Running docker commands [$cmds] on [$dists]"

testopts="--cap-add SYS_ADMIN"
volopt="-v ${codedir}:/dev/oar-pdr-angular"

# check to see if we need to build the docker images; this can't detect
# changes requiring re-builds.
# 
if [ -z "$dodockbuild" ]; then
    if wordin build-test $dists; then
        if { wordin build $cmds || wordin test $cmds; }; then
            docker_images_built oar-pdr-angular/build-test || dodockbuild=1
        fi
    fi
fi

[ -z "$dodockbuild" ] || {
    echo '#' Building missing docker containers...
    $execdir/dockbuild.sh
}

# build distributions, if requested
#
if wordin build $cmds; then
    echo '+' docker run --rm $volopt "${dargs[@]}" oar-pdr-angular/build-test \
                    build "${args[@]}" $dists
    docker run --rm $volopt "${dargs[@]}" oar-pdr-angular/build-test \
           build "${args[@]}" $dists
fi

# run tests, if requested
#
if wordin test $cmds; then
    # not yet supported
    echo '#' test command not yet implemented
#    echo '+' docker run --rm $volopt "${dargs[@]}" oar-pdr-angular/build-test \
#                    test "${args[@]}" $dists
#    docker run --rm $volopt "${dargs[@]}" oar-pdr-angular/build-test \
#           test "${args[@]}" $dists
fi

# open a shell, if requested
#
if wordin shell $cmds; then
    echo '+' docker run -ti --rm $volopt "${dargs[@]}"  \
                    oar-pdr-angular/build-test shell "${args[@]}"
    docker run --rm -ti $volopt "${dargs[@]}" oar-pdr-angular/build-test \
           shell "${args[@]}"
fi

