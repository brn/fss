#!/bin/sh
cd `dirname $0`

readonly COUNT=$(expr ${1:-1000} + 0)
readonly TEST_DIR=/tmp/fss_debug
rm -rf TEST_DIR > /dev/null 2>&1
mkdir -p $TEST_DIR

mysql -uuser -ppassword -h127.0.0.1 file_storage -e "TRUNCATE TABLE files" > /dev/null 2>&1

readonly PER=$(echo "scale=5; 100 / ${COUNT}" | bc)
PROG=0
for i in $(eval echo {1..$COUNT}); do
  TEST_FILE=${TEST_DIR}/dummy_${i}
  echo "file_${i}" > $TEST_FILE
  ../filestorage upload --file $TEST_FILE > /dev/null
  mysql -uuser -ppassword -h 127.0.0.1 file_storage -e "UPDATE files SET created_at = '2020-01-01 00:00:00' WHERE id = ${i}" > /dev/null 2>&1
  PROG=$(echo "scale=5; ${PROG} + ${PER}" | bc)
  echo "Now initializing database $(printf '%.2f' $PROG)%\\c"
  echo "\r\c"
done

rm -rf $TEST_DIR
