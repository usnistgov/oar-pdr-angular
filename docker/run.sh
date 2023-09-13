#! /bin/bash
#
prog=`basename $0`
execdir=`dirname $0`
[ "$execdir" = "" -o "$execdir" = "." ] && execdir=$PWD
export CODEDIR=`(cd $execdir/.. > /dev/null 2>&1; pwd)`
export DOCKERDIR=$execdir
PACKAGE_NAME=oar-pdr-angular

DISTNAMES="midas-lps midas-wizard pdr-lps pdr-rpa-request pdr-rpa-approve"

function usage {
    cat <<EOF

$prog - build and optionally test the software in this repo

SYNOPSIS
  $prog [-d|--docker-build] [build|test|install|shell ...] [ DIST ... ]
        

ARGS
  build     build the software
  test      build the software and run the unit tests
  install   just install the prerequisites (use with shell)
  shell     start a shell in the docker container used to build and test

  DIST      the component (e.g. midas-lps) to build or test

OPTIONS
  -d        build the required docker containers first
EOF
}

set -e
# set -x

doinstall=
dodockbuild=
distvol=
distdir=
ops=
args=()
comps=
while [ "$1" != "" ]; do
    case "$1" in
        shell|build|install|test)
            ops="$ops $1"
            ;;
        midas-lps|midas-wizard|pdr-lps|pdr-rpa-request|pdr-rpa-approve)
            comps="$comps $1"
            ;;
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
        -h|--help)
            usage
            exit
            ;;
        -*)
            args=(${args[@]} $1)
            ;;
        *)
            echo "${prog}: unsupported operation:" $1
            false
            ;;
    esac
    shift
done

ti=
(echo "$ops" | grep -qs shell) && ti="-ti"

testopts="--cap-add SYS_ADMIN"
volopt="-v ${CODEDIR}:/home/build"

if echo "$ops" | egrep -qsw 'test|shell'; then
    [ -n "$dodockbuild" ] && {
        echo '++' $execdir/dockbuild.sh test
        $execdir/dockbuild.sh test
    }

    echo '+' docker run $ti --rm $volopt $testopts $distvol $PACKAGE_NAME/test $ops "${args[@]}" $comps
    exec docker run $ti --rm $volopt $testopts $distvol $PACKAGE_NAME/test $ops "${args[@]}" $comps
else
    # build only
    [ -n "$dodockbuild" ] && {
        echo '++' $execdir/dockbuild.sh build
        $execdir/dockbuild.sh build
    }

    echo '+' docker run --rm $volopt $distvol $PACKAGE_NAME/build makedist "${args[@]}" $comps
    exec docker run --rm $volopt $distvol $PACKAGE_NAME/build makedist "${args[@]}" $comps
fi

